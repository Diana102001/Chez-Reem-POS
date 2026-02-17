from .models import Category, Product, CategoryOption, ProductOption
from rest_framework import serializers


class CategoryOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = CategoryOption
        fields = ['id', 'name', 'price_change']


class CategorySerializer(serializers.ModelSerializer):
    options = CategoryOptionSerializer(many=True, required=False)

    class Meta:
        model = Category
        fields = ['id', 'name', 'description', 'options']

    def create(self, validated_data):
        options_data = validated_data.pop('options', [])
        category = Category.objects.create(**validated_data)
        for option_data in options_data:
            option_data.pop('id', None) # Remove ID if present
            CategoryOption.objects.create(category=category, **option_data)
        return category

    def update(self, instance, validated_data):
        options_data = validated_data.pop('options', None)
        instance.name = validated_data.get('name', instance.name)
        instance.description = validated_data.get('description', instance.description)
        instance.save()

        if options_data is not None:
            instance.options.all().delete()
            for option_data in options_data:
                option_data.pop('id', None)
                CategoryOption.objects.create(category=instance, **option_data)
        return instance


class ProductOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductOption
        fields = ['id', 'name', 'choices']


class ProductSerializer(serializers.ModelSerializer):
    options = ProductOptionSerializer(many=True, required=False)

    class Meta:
        model = Product
        fields = ['id', 'name', 'category', 'price', 'details', 'description', 'quantity', 'is_available', 'options']

    def create(self, validated_data):
        options_data = validated_data.pop('options', [])
        product = Product.objects.create(**validated_data)
        for option_data in options_data:
            option_data.pop('id', None)
            ProductOption.objects.create(product=product, **option_data)
        return product

    def update(self, instance, validated_data):
        options_data = validated_data.pop('options', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if options_data is not None:
            instance.options.all().delete()
            for option_data in options_data:
                option_data.pop('id', None)
                ProductOption.objects.create(product=instance, **option_data)
        return instance
