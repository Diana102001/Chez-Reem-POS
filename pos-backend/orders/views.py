from collections import defaultdict
from datetime import datetime, timedelta
from decimal import Decimal
from io import BytesIO

from django.db.models import Count, Sum
from django.db.models.functions import TruncDate, TruncWeek
from django.http import HttpResponse
from django.utils import timezone

from rest_framework import viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import DailyClosing, Order, OrderItem, TaxType
from .serializers import OrderSerializer, OrderItemSerializer, TaxTypeSerializer
from payments.models import Payment
from products.models import Product, Category
from users.permissions import IsAdmin, IsCashier, IsAdminOrReadOnly


class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated, IsCashier]


class OrderItemViewSet(viewsets.ModelViewSet):
    queryset = OrderItem.objects.all()
    serializer_class = OrderItemSerializer
    permission_classes = [IsAuthenticated, IsCashier]


class TaxTypeViewSet(viewsets.ModelViewSet):
    queryset = TaxType.objects.all().order_by('type')
    serializer_class = TaxTypeSerializer
    permission_classes = [IsAuthenticated, IsAdminOrReadOnly]


def _to_money(value):
    if value is None:
        return 0.0
    if not isinstance(value, Decimal):
        value = Decimal(str(value))
    return float(value.quantize(Decimal('0.01')))


def _parse_report_date(date_str):
    if date_str:
        try:
            parsed_date = datetime.strptime(date_str, '%Y-%m-%d').date()
            if parsed_date > timezone.localdate():
                return None, "Future dates are not allowed."
            return parsed_date, None
        except ValueError:
            return None, "Invalid date format. Use YYYY-MM-DD."
    return timezone.localdate(), None


def _parse_report_mode(mode_str):
    mode = (mode_str or 'detailed').strip().lower()
    if mode not in ('simple', 'detailed'):
        return None, "Invalid mode. Use 'simple' or 'detailed'."
    return mode, None


def _resolve_report_window(report_date, start_date=None, opening_time=None, closing_time=None):
    start_date = start_date or report_date
    tz = timezone.get_current_timezone()

    if opening_time:
        opened_at = opening_time
    else:
        opened_at = timezone.make_aware(datetime.combine(start_date, datetime.min.time()), tz)

    if closing_time:
        closed_at = closing_time
    else:
        if report_date == timezone.localdate():
            closed_at = timezone.now()
        else:
            closed_at = timezone.make_aware(datetime.combine(report_date, datetime.max.time()), tz)

    return opened_at, closed_at


def _build_daily_report_payload(report_date, start_date=None, opening_time=None, closing_time=None):
    start_date = start_date or report_date
    opened_at, closed_at = _resolve_report_window(
        report_date,
        start_date=start_date,
        opening_time=opening_time,
        closing_time=closing_time,
    )
    payments_qs = Payment.objects.filter(
        created_at__gte=opened_at,
        created_at__lte=closed_at,
    ).select_related('order', 'order__tax_type')
    order_ids = list(payments_qs.values_list('order_id', flat=True).distinct())
    tickets_qs = Order.objects.filter(id__in=order_ids).select_related('tax_type', 'created_by').order_by('id')

    tax_groups = defaultdict(lambda: {
        'ticket_count': 0,
        'total_ht': Decimal('0.00'),
        'total_vat': Decimal('0.00'),
        'total_ttc': Decimal('0.00'),
    })
    tax_type_groups = {}
    for tax_type in TaxType.objects.all().order_by('type'):
        tax_type_groups[tax_type.id] = {
            'tax_type_id': tax_type.id,
            'tax_type': tax_type.type,
            'tax_rate': Decimal(tax_type.percent or 0),
            'ticket_count': 0,
            'total_ht': Decimal('0.00'),
            'total_vat': Decimal('0.00'),
            'total_ttc': Decimal('0.00'),
        }
    tickets = []
    order_type_groups = defaultdict(lambda: {
        'order_count': 0,
        'total_ttc': Decimal('0.00'),
    })

    total_ht = Decimal('0.00')
    total_vat = Decimal('0.00')
    total_ttc = Decimal('0.00')

    for ticket in tickets_qs:
        tax_rate = Decimal(ticket.tax_type.percent) if ticket.tax_type else Decimal('0.00')
        tax_key = str(tax_rate.quantize(Decimal('0.01')))

        group = tax_groups[tax_key]
        group['ticket_count'] += 1
        group['total_ht'] += ticket.subtotal
        group['total_vat'] += ticket.tax_amount
        group['total_ttc'] += ticket.total
        if ticket.tax_type_id and ticket.tax_type_id in tax_type_groups:
            tax_type_group = tax_type_groups[ticket.tax_type_id]
            tax_type_group['ticket_count'] += 1
            tax_type_group['total_ht'] += ticket.subtotal
            tax_type_group['total_vat'] += ticket.tax_amount
            tax_type_group['total_ttc'] += ticket.total

        total_ht += ticket.subtotal
        total_vat += ticket.tax_amount
        total_ttc += ticket.total

        order_type = getattr(ticket, 'order_type', None) or 'non_defini'
        order_type_groups[order_type]['order_count'] += 1
        order_type_groups[order_type]['total_ttc'] += ticket.total

        tickets.append({
            'order_id': ticket.id,
            'created_at': ticket.created_at.isoformat(),
            'created_by_username': ticket.created_by.username if ticket.created_by else None,
            'created_by_role': ticket.created_by.role if ticket.created_by else None,
            'order_type': order_type,
            'tax_rate': _to_money(tax_rate),
            'ht': _to_money(ticket.subtotal),
            'vat': _to_money(ticket.tax_amount),
            'ttc': _to_money(ticket.total),
        })

    by_tax_rate = []
    for tax_key in sorted(tax_groups.keys(), key=lambda x: Decimal(x)):
        group = tax_groups[tax_key]
        by_tax_rate.append({
            'tax_rate': _to_money(Decimal(tax_key)),
            'ticket_count': group['ticket_count'],
            'total_ht': _to_money(group['total_ht']),
            'total_vat': _to_money(group['total_vat']),
            'total_ttc': _to_money(group['total_ttc']),
        })

    by_tax_type = []
    for tax_type in tax_type_groups.values():
        by_tax_type.append({
            'tax_type_id': tax_type['tax_type_id'],
            'tax_type': tax_type['tax_type'],
            'tax_rate': _to_money(tax_type['tax_rate']),
            'ticket_count': tax_type['ticket_count'],
            'total_ht': _to_money(tax_type['total_ht']),
            'total_vat': _to_money(tax_type['total_vat']),
            'total_ttc': _to_money(tax_type['total_ttc']),
        })

    payment_methods = []
    payment_groups = (
        payments_qs.values('method')
        .annotate(ticket_count=Count('id'), total_amount=Sum('amount'))
        .order_by('method')
    )
    for item in payment_groups:
        payment_methods.append({
            'method': item['method'],
            'ticket_count': item['ticket_count'],
            'total_amount': _to_money(item['total_amount']),
        })

    by_order_type = []
    for order_type in sorted(order_type_groups.keys()):
        item = order_type_groups[order_type]
        by_order_type.append({
            'type': order_type,
            'order_count': item['order_count'],
            'total_ttc': _to_money(item['total_ttc']),
        })

    ticket_count = len(tickets)
    average_ticket = (total_ttc / ticket_count) if ticket_count else Decimal('0.00')

    return {
        'report_mode': 'detailed',
        'start_date': start_date.strftime('%Y-%m-%d'),
        'opening_time': opened_at.isoformat(),
        'closing_time': closed_at.isoformat(),
        'report_date': report_date.strftime('%Y-%m-%d'),
        'tickets': tickets,
        'by_order_type': by_order_type,
        'by_tax_rate': by_tax_rate,
        'by_tax_type': by_tax_type,
        'payment_methods': payment_methods,
        'totals': {
            'ticket_count': ticket_count,
            'total_revenue': _to_money(total_ttc),
            'total_vat': _to_money(total_vat),
            'total_ht': _to_money(total_ht),
            'total_ttc': _to_money(total_ttc),
            'average_ticket': _to_money(average_ticket),
        },
    }


def _build_simple_report_payload(detailed_payload):
    totals = detailed_payload.get('totals', {})
    by_order_type = detailed_payload.get('by_order_type') or [
        {
            'type': 'non_defini',
            'order_count': totals.get('ticket_count', 0),
            'total_ttc': totals.get('total_ttc', 0.0),
        }
    ]
    return {
        'report_mode': 'simple',
        'start_date': detailed_payload.get('start_date'),
        'opening_time': detailed_payload.get('opening_time'),
        'closing_time': detailed_payload.get('closing_time'),
        'report_date': detailed_payload.get('report_date'),
        'is_closed': detailed_payload.get('is_closed', False),
        'is_started': detailed_payload.get('is_started', False),
        'closing_status': detailed_payload.get('closing_status'),
        'source': detailed_payload.get('source', 'live'),
        'summary': {
            'order_count': totals.get('ticket_count', 0),
            'total_ttc': totals.get('total_ttc', 0.0),
            'total_ht': totals.get('total_ht', 0.0),
            'total_vat': totals.get('total_vat', 0.0),
        },
        'order_type_totals': by_order_type,
        'tickets': [],
        'totals': totals,
        'by_tax_rate': [],
        'by_tax_type': [],
        'payment_methods': [],
    }


def _get_report_payload(report_date, start_date, opening_time=None, closing_time=None, report_mode='detailed'):
    closing = DailyClosing.objects.filter(report_date=report_date).first()
    if closing and closing.closing_time and closing.payload:
        payload = dict(closing.payload or {})
        payload.setdefault('start_date', closing.start_date.strftime('%Y-%m-%d'))
        payload.setdefault('report_date', closing.report_date.strftime('%Y-%m-%d'))
        payload.setdefault('opening_time', closing.opening_time.isoformat() if closing.opening_time else None)
        payload.setdefault('closing_time', closing.closing_time.isoformat() if closing.closing_time else None)
        payload['is_closed'] = True
        payload['is_started'] = True
        payload['closed_at'] = closing.closed_at.isoformat()
        payload['source'] = 'snapshot'
        payload['report_mode'] = 'detailed'
        return _build_simple_report_payload(payload) if report_mode == 'simple' else payload

    if closing and closing.opening_time:
        start_date = closing.start_date
        opening_time = closing.opening_time

    payload = _build_daily_report_payload(
        report_date,
        start_date=start_date,
        opening_time=opening_time,
        closing_time=closing_time,
    )
    payload['is_closed'] = False
    payload['is_started'] = bool(closing and closing.opening_time)
    if payload['is_started']:
        payload['closing_time'] = None
        payload['closing_status'] = 'ongoing'
    else:
        payload['closing_time'] = None
        payload['closing_status'] = 'not_started'
    payload['source'] = 'live'
    payload['report_mode'] = 'detailed'
    return _build_simple_report_payload(payload) if report_mode == 'simple' else payload


def _build_reportlab_pdf(payload):
    try:
        from reportlab.lib import colors
        from reportlab.lib.pagesizes import A4
        from reportlab.lib.styles import getSampleStyleSheet
        from reportlab.lib.units import inch
        from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle
    except Exception:
        return None, "reportlab is not installed. Run: pip install reportlab"

    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        leftMargin=28,
        rightMargin=28,
        topMargin=28,
        bottomMargin=28,
    )
    styles = getSampleStyleSheet()
    elements = []

    elements.append(Paragraph("<b>Daily Z Report</b>", styles["Title"]))
    elements.append(Spacer(1, 0.25 * inch))
    elements.append(Paragraph(f"Date: {payload['report_date']}", styles["Normal"]))
    elements.append(Paragraph(f"Opening Time: {payload.get('opening_time') or '-'}", styles["Normal"]))
    elements.append(Paragraph(f"Closing Time: {payload.get('closing_time') or '-'}", styles["Normal"]))
    if payload.get('report_mode') == 'simple':
        summary = payload.get('summary', {})
        elements.append(Paragraph(f"Orders: {summary.get('order_count', 0)}", styles["Normal"]))
        elements.append(Paragraph(f"Total TTC: {_to_money(summary.get('total_ttc', 0.0)):.2f} EUR", styles["Normal"]))
        elements.append(Paragraph(f"Total HT: {_to_money(summary.get('total_ht', 0.0)):.2f} EUR", styles["Normal"]))
        elements.append(Paragraph(f"Total VAT: {_to_money(summary.get('total_vat', 0.0)):.2f} EUR", styles["Normal"]))
    else:
        elements.append(Paragraph(f"Tickets: {payload['totals']['ticket_count']}", styles["Normal"]))
        elements.append(Paragraph(f"Total TTC: {_to_money(payload['totals']['total_ttc']):.2f} EUR", styles["Normal"]))
        elements.append(Paragraph(f"Total HT: {_to_money(payload['totals']['total_ht']):.2f} EUR", styles["Normal"]))
        elements.append(Paragraph(f"Total VAT: {_to_money(payload['totals']['total_vat']):.2f} EUR", styles["Normal"]))
        elements.append(Paragraph(f"Average Ticket: {_to_money(payload['totals']['average_ticket']):.2f} EUR", styles["Normal"]))
    elements.append(Spacer(1, 0.25 * inch))

    if payload.get('report_mode') == 'simple':
        order_type_data = [["Order Type", "Orders", "Total TTC"]]
        for row in payload.get("order_type_totals", []):
            order_type_data.append([
                str(row.get("type", "non_defini")),
                str(row.get("order_count", 0)),
                f"{_to_money(row.get('total_ttc', 0.0)):.2f} EUR",
            ])
        order_type_table = Table(order_type_data, repeatRows=1)
        order_type_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#e7e7e7")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.black),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
            ("ALIGN", (1, 1), (-1, -1), "RIGHT"),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTNAME", (0, 1), (-1, -1), "Helvetica"),
            ("FONTSIZE", (0, 0), (-1, -1), 9),
        ]))
        elements.append(Paragraph("<b>Totals By Order Type</b>", styles["Heading3"]))
        elements.append(order_type_table)
        doc.build(elements)
        buffer.seek(0)
        return buffer.getvalue(), None

    tax_data = [["Tax Type", "Tax Rate", "Tickets", "Total HT", "Total VAT", "Total TTC"]]
    for row in payload["by_tax_type"]:
        tax_data.append([
            str(row["tax_type"]),
            f"{_to_money(row['tax_rate']):.2f}%",
            str(row["ticket_count"]),
            f"{_to_money(row['total_ht']):.2f} EUR",
            f"{_to_money(row['total_vat']):.2f} EUR",
            f"{_to_money(row['total_ttc']):.2f} EUR",
        ])

    tax_table = Table(tax_data, repeatRows=1)
    tax_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#e7e7e7")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.black),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
        ("ALIGN", (2, 1), (-1, -1), "RIGHT"),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTNAME", (0, 1), (-1, -1), "Helvetica"),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("BOTTOMPADDING", (0, 0), (-1, 0), 6),
        ("TOPPADDING", (0, 0), (-1, 0), 6),
    ]))
    elements.append(Paragraph("<b>Tax Breakdown</b>", styles["Heading3"]))
    elements.append(tax_table)
    elements.append(Spacer(1, 0.2 * inch))

    payment_data = [["Payment Method", "Tickets", "Total"]]
    for row in payload["payment_methods"]:
        payment_data.append([
            str(row["method"]).upper(),
            str(row["ticket_count"]),
            f"{_to_money(row['total_amount']):.2f} EUR",
        ])

    payment_table = Table(payment_data, repeatRows=1)
    payment_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#e7e7e7")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.black),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
        ("ALIGN", (1, 1), (-1, -1), "RIGHT"),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTNAME", (0, 1), (-1, -1), "Helvetica"),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
    ]))
    elements.append(Paragraph("<b>Payment Methods</b>", styles["Heading3"]))
    elements.append(payment_table)

    doc.build(elements)
    buffer.seek(0)
    return buffer.getvalue(), None


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsCashier])
def daily_pos_report(request):
    report_date, error = _parse_report_date(request.query_params.get('date'))
    if error:
        return Response({'detail': error}, status=400)
    report_mode, mode_error = _parse_report_mode(request.query_params.get('mode'))
    if mode_error:
        return Response({'detail': mode_error}, status=400)
    start_date = report_date
    return Response(_get_report_payload(report_date, start_date, report_mode=report_mode))


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsCashier])
def daily_pos_report_pdf(request):
    report_date, error = _parse_report_date(request.query_params.get('date'))
    if error:
        return Response({'detail': error}, status=400)
    report_mode, mode_error = _parse_report_mode(request.query_params.get('mode'))
    if mode_error:
        return Response({'detail': mode_error}, status=400)
    closing = DailyClosing.objects.filter(report_date=report_date).first()
    if not closing or not closing.closing_time:
        return Response({'detail': 'Export is allowed only after day closing.'}, status=409)
    payload = _get_report_payload(report_date, report_date, report_mode=report_mode)
    pdf_bytes, pdf_error = _build_reportlab_pdf(payload)
    if pdf_error:
        return Response({'detail': pdf_error}, status=500)

    filename = f"daily-pos-report-{payload['report_date']}.pdf"
    response = HttpResponse(pdf_bytes, content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="{filename}"'
    return response


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsCashier])
def export_daily_report_pdf(request, date):
    report_date, error = _parse_report_date(date)
    if error:
        return Response({'detail': error}, status=400)
    report_mode, mode_error = _parse_report_mode(request.query_params.get('mode'))
    if mode_error:
        return Response({'detail': mode_error}, status=400)
    closing = DailyClosing.objects.filter(report_date=report_date).first()
    if not closing or not closing.closing_time:
        return Response({'detail': 'Export is allowed only after day closing.'}, status=409)
    payload = _get_report_payload(report_date, report_date, report_mode=report_mode)
    pdf_bytes, pdf_error = _build_reportlab_pdf(payload)
    if pdf_error:
        return Response({'detail': pdf_error}, status=500)

    filename = f"daily-pos-report-{payload['report_date']}.pdf"
    response = HttpResponse(pdf_bytes, content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="{filename}"'
    return response


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsCashier])
def start_daily_pos_report(request):
    report_date, error = _parse_report_date(request.data.get('date'))
    if error:
        return Response({'detail': error}, status=400)
    if report_date != timezone.localdate():
        return Response({'detail': 'Start day is only allowed for today.'}, status=409)

    existing = DailyClosing.objects.filter(report_date=report_date).first()
    if existing:
        payload = _get_report_payload(report_date, existing.start_date)
        if existing.closing_time:
            return Response({'detail': 'This day is already closed.', 'report': payload}, status=409)
        return Response({'detail': 'This day is already started.', 'report': payload}, status=409)

    opening_time = timezone.now()
    closing = DailyClosing.objects.create(
        report_date=report_date,
        start_date=report_date,
        opening_time=opening_time,
        closed_by=request.user if request.user.is_authenticated else None,
        payload={},
    )
    payload = _build_daily_report_payload(
        report_date,
        start_date=closing.start_date,
        opening_time=closing.opening_time,
    )
    payload['is_started'] = True
    payload['is_closed'] = False
    payload['closing_time'] = None
    payload['closing_status'] = 'ongoing'
    payload['source'] = 'live'
    return Response(payload, status=201)


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsCashier])
def close_daily_pos_report(request):
    report_date, error = _parse_report_date(request.data.get('date'))
    if error:
        return Response({'detail': error}, status=400)
    if report_date != timezone.localdate():
        return Response({'detail': 'Close day is only allowed for today.'}, status=409)

    closing = DailyClosing.objects.filter(report_date=report_date).first()
    if not closing or not closing.opening_time:
        return Response({'detail': 'Day not started. Start the day first.'}, status=409)
    if closing.closing_time:
        return Response({'detail': 'This day is already closed.'}, status=409)

    effective_opening_time = closing.opening_time
    effective_closing_time = timezone.now()
    start_date = closing.start_date

    payload = _build_daily_report_payload(
        report_date,
        start_date=start_date,
        opening_time=effective_opening_time,
        closing_time=effective_closing_time,
    )
    payload['is_closed'] = True
    payload['source'] = 'snapshot'
    payload['is_started'] = True
    payload['closing_status'] = 'closed'

    closing.closing_time = effective_closing_time
    if request.user.is_authenticated:
        closing.closed_by = request.user
    closing.payload = payload
    closing.save(update_fields=['closing_time', 'closed_by', 'payload'])
    payload['closed_at'] = closing.closed_at.isoformat()
    return Response(payload, status=200)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    now = timezone.now()

    # --- Totals ---
    total_revenue = (
        Order.objects.filter(status='paid')
        .aggregate(total=Sum('total'))['total']
    ) or 0
    total_orders = Order.objects.count()
    total_products = Product.objects.count()

    # --- Daily Revenue (last 30 days) ---
    thirty_days_ago = now - timedelta(days=30)
    daily_qs = (
        Order.objects.filter(status='paid', created_at__gte=thirty_days_ago)
        .annotate(date=TruncDate('created_at'))
        .values('date')
        .annotate(revenue=Sum('total'))
        .order_by('date')
    )
    daily_revenue = [
        {'date': entry['date'].strftime('%Y-%m-%d'), 'revenue': float(entry['revenue'])}
        for entry in daily_qs
    ]

    # --- Weekly Revenue (last 12 weeks) ---
    twelve_weeks_ago = now - timedelta(weeks=12)
    weekly_qs = (
        Order.objects.filter(status='paid', created_at__gte=twelve_weeks_ago)
        .annotate(week=TruncWeek('created_at'))
        .values('week')
        .annotate(revenue=Sum('total'))
        .order_by('week')
    )
    weekly_revenue = [
        {'week': entry['week'].strftime('%Y-%m-%d'), 'revenue': float(entry['revenue'])}
        for entry in weekly_qs
    ]

    # --- Most Demanded Product per Category ---
    most_demanded = []
    for category in Category.objects.all():
        top_product = (
            OrderItem.objects
            .filter(product__category=category)
            .values('product__id', 'product__name')
            .annotate(total_qty=Sum('quantity'))
            .order_by('-total_qty')
            .first()
        )
        if top_product:
            most_demanded.append({
                'category': category.name,
                'product': top_product['product__name'],
                'total_qty': top_product['total_qty'],
            })

    return Response({
        'total_revenue': float(total_revenue),
        'total_orders': total_orders,
        'total_products': total_products,
        'daily_revenue': daily_revenue,
        'weekly_revenue': weekly_revenue,
        'most_demanded_by_category': most_demanded,
        'low_stock_items': [],
    })
