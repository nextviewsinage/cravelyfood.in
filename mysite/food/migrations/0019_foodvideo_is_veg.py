from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('food', '0018_order_delivery_fields'),
    ]

    operations = [
        migrations.AddField(
            model_name='foodvideo',
            name='is_veg',
            field=models.BooleanField(default=True),
        ),
    ]
