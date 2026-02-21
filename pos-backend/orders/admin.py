from django.contrib import admin

# Register your models here.
from .models import Order, OrderItem, TaxType

admin.site.register(Order)
admin.site.register(OrderItem)
admin.site.register(TaxType)
