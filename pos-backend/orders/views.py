from datetime import timedelta

from django.db.models import Sum, Count
from django.db.models.functions import TruncDate, TruncWeek
from django.utils import timezone

from rest_framework import viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Order, OrderItem
from .serializers import OrderSerializer, OrderItemSerializer
from products.models import Product, Category
from users.permissions import IsAdmin, IsCashier


class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated, IsCashier]


class OrderItemViewSet(viewsets.ModelViewSet):
    queryset = OrderItem.objects.all()
    serializer_class = OrderItemSerializer
    permission_classes = [IsAuthenticated, IsCashier]


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

    # --- Low Stock Items ---
    low_stock = list(
        Product.objects.filter(quantity__lt=5)
        .values('id', 'name', 'quantity')
    )

    return Response({
        'total_revenue': float(total_revenue),
        'total_orders': total_orders,
        'total_products': total_products,
        'daily_revenue': daily_revenue,
        'weekly_revenue': weekly_revenue,
        'most_demanded_by_category': most_demanded,
        'low_stock_items': low_stock,
    })