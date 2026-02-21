from django.db import models

# Create your models here.

class Category(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name


class Product(models.Model):
    name = models.CharField(max_length=150)
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    details = models.TextField(blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    is_available = models.BooleanField(default=True)

    def __str__(self):
        return self.name


class CategoryOption(models.Model):
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name="options")
    name = models.CharField(max_length=100)
    price_change = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)

    def __str__(self):
        return f"{self.category.name} - {self.name}"


class ProductOption(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="options")
    name = models.CharField(max_length=100) # e.g. "Size" or "Toppings"
    choices = models.JSONField(
        default=list, 
        help_text='Store choices as a list of name/price pairs, e.g. [{"name": "Large", "price": 3.00}]'
    )

    def __str__(self):
        return f"{self.product.name} - {self.name}"
