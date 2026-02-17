from django.db import models

# Create your models here.
from django.conf import settings
from products.models import Product

class Order(models.Model):
    STATUS_CHOICES = [
        ('in_progress', 'In Progress'),
        ('ready', 'Ready'),
        ('paid', 'Paid'),
        ('cancelled', 'Cancelled'),
    ]

    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='in_progress')
    total = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    def update_total(self):
        total = sum(item.subtotal for item in self.items.all())
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
