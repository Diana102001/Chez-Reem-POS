# Generated manually to remove product stock quantity

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('products', '0005_category_description'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='product',
            name='quantity',
        ),
    ]
