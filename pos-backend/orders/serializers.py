from rest_framework import serializers
from .models import Order, OrderItem
from products.models import Product
from payments.models import Payment

class OrderItemSerializer(serializers.ModelSerializer):
    product = serializers.PrimaryKeyRelatedField(queryset=Product.objects.all())
    product_name = serializers.ReadOnlyField(source='product.name')

    class Meta:
        model = OrderItem
        fields = ['product', 'product_name', 'quantity', 'price', 'subtotal', 'choices']
        read_only_fields = ['price', 'subtotal']


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True)
    payment_method = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = Order
        fields = ['id', 'created_at', 'status', 'total', 'items', 'payment_method']
        read_only_fields = ['id', 'created_at', 'total']

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        payment_method = validated_data.pop('payment_method', None)
        
        # Create Order
        order = Order.objects.create(**validated_data)
        
        # Create Items
        for item_data in items_data:
            OrderItem.objects.create(order=order, **item_data)
            
        # Refresh to get updated total
        order.refresh_from_db()
        
        if payment_method:
            Payment.objects.create(
                order=order,
                method=payment_method.lower(),
                amount=order.total
            )
            order.status = 'paid'
            order.save()
            
        return order

    def update(self, instance, validated_data):
        items_data = validated_data.pop('items', None)
        payment_method = validated_data.pop('payment_method', None)

        # Update order basic fields (status, etc.)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Update items if provided
        if items_data is not None:
            # Simple approach: clear and recreate
            instance.items.all().delete()
            for item_data in items_data:
                OrderItem.objects.create(order=instance, **item_data)
            
        instance.refresh_from_db()

        # Handle payment if provided during update
        if payment_method:
            Payment.objects.create(
                order=instance,
                method=payment_method.lower(),
                amount=instance.total
            )
            instance.status = 'paid'
            instance.save()

        return instance
