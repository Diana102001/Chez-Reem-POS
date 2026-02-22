from django.db import models
from decimal import Decimal

# Create your models here.
from django.conf import settings
from products.models import Product


class TaxType(models.Model):
    type = models.CharField(max_length=100, unique=True)
    percent = models.DecimalField(max_digits=5, decimal_places=2, default=0)

    def __str__(self):
        return f"{self.type} ({self.percent}%)"


class Order(models.Model):
    STATUS_CHOICES = [
        ('in_progress', 'In Progress'),
        ('ready', 'Ready'),
        ('paid', 'Paid'),
        ('cancelled', 'Cancelled'),
    ]

    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_orders'
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='in_progress')
    tax_type = models.ForeignKey(
        TaxType,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='orders'
    )
    subtotal = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    tax_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    def update_total(self):
        total = sum(item.subtotal for item in self.items.all())
        tax_percent = self.tax_type.percent if self.tax_type else 0
        if tax_percent > 0:
            tax_amount = total * tax_percent / (100 + tax_percent)
        else:
            tax_amount = Decimal('0')
        self.subtotal = total - tax_amount
        self.tax_amount = tax_amount
        self.total = total
        self.save()

    def __str__(self):
        return f"Order {self.id}"



class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE)
    product = models.ForeignKey('products.Product', on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    choices = models.JSONField(default=list, blank=True)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    def save(self, *args, **kwargs):
        # Base price + sum of price adjustments in choices
        base_price = float(self.product.price)
        extra_price = sum(float(choice.get('price', 0)) for choice in self.choices)
        self.price = base_price + extra_price
        self.subtotal = self.quantity * self.price
        super().save(*args, **kwargs)
        self.order.update_total()

    def __str__(self):
        return f"{self.product.name} x {self.quantity}"


class DailyClosing(models.Model):
    report_date = models.DateField(unique=True)
    start_date = models.DateField()
    opening_time = models.DateTimeField(null=True, blank=True)
    closing_time = models.DateTimeField(null=True, blank=True)
    closed_at = models.DateTimeField(auto_now_add=True)
    closed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='daily_closings'
    )
    payload = models.JSONField(default=dict)

    class Meta:
        ordering = ['-report_date']

    def __str__(self):
        return f"DailyClosing {self.report_date}"
