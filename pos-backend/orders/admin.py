from django.contrib import admin

# Register your models here.
from .models import DailyClosing, Order, OrderItem, TaxType

admin.site.register(Order)
admin.site.register(OrderItem)
admin.site.register(TaxType)
admin.site.register(DailyClosing)
