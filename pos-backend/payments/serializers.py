from rest_framework import serializers
from django.utils import timezone
from .models import Payment
from orders.day_guard import ensure_day_not_closed


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = '__all__'

    def validate(self, attrs):
        ensure_day_not_closed(timezone.localdate())
        return attrs
