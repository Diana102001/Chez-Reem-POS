from django.db import models

# Create your models here.
from django.conf import settings
from products.models import Product

class Order(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('cancelled', 'Cancelled'),
    ]

    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
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
    subtotal = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    def save(self, *args, **kwargs):
        self.price = self.product.price
        self.subtotal = self.quantity * self.price
        super().save(*args, **kwargs)
        self.order.update_total()

    def __str__(self):
        return f"{self.product.name} x {self.quantity}"
