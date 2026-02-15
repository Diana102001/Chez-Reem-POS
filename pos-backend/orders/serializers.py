from rest_framework import serializers
from .models import Order, OrderItem
from products.models import Product
from payments.models import Payment

class OrderItemSerializer(serializers.ModelSerializer):
    product = serializers.PrimaryKeyRelatedField(queryset=Product.objects.all())

    class Meta:
        model = OrderItem
        fields = ['product', 'quantity', 'price', 'subtotal']
        read_only_fields = ['price', 'subtotal']


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True)
    payment_method = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = Order
        fields = ['id', 'created_at', 'status', 'total', 'items', 'payment_method']
        read_only_fields = ['id', 'created_at', 'total', 'status']

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        payment_method = validated_data.pop('payment_method', None)
        
        # Create Order
        order = Order.objects.create(**validated_data)
        
        # Create Items
        for item_data in items_data:
            OrderItem.objects.create(order=order, **item_data)
            
        # Refresh to get updated total from OrderItem.save() logic
        order.refresh_from_db()
        
        # Create Payment if method provided
        if payment_method:
            Payment.objects.create(
                order=order,
                method=payment_method.lower(),
                amount=order.total
            )
            # Update status to paid
            order.status = 'paid'
            order.save()
            
        return order
