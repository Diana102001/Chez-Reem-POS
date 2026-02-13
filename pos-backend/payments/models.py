from django.db import models

# Create your models here.
from orders.models import Order

class Payment(models.Model):
    METHOD_CHOICES = (
        ('cash', 'Cash'),
        ('card', 'Card'),
    )

    order = models.ForeignKey(Order, on_delete=models.PROTECT)
    method = models.CharField(max_length=20, choices=METHOD_CHOICES)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.method} - {self.amount} for Order {self.order.id}"
