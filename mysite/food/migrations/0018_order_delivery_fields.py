from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('food', '0017_surge_pricing_rule'),
    ]

    operations = [
        migrations.AddField(
            model_name='order',
            name='delivery_boy',
            field=models.ForeignKey(
                blank=True, null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='assigned_orders',
                to='food.deliveryboy',
            ),
        ),
        migrations.AddField(
            model_name='order',
            name='delivery_lat',
            field=models.FloatField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='order',
            name='delivery_lng',
            field=models.FloatField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='order',
            name='batch_id',
            field=models.CharField(blank=True, default='', max_length=20),
        ),
    ]
