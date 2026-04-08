from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('food', '0016_add_phone_otp'),
    ]

    operations = [
        migrations.CreateModel(
            name='SurgePricingRule',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('trigger', models.CharField(choices=[
                    ('peak_lunch', 'Peak Lunch (12–2 PM)'),
                    ('peak_dinner', 'Peak Dinner (7–10 PM)'),
                    ('late_night', 'Late Night (11 PM–5 AM)'),
                    ('weekend', 'Weekend'),
                    ('rain', 'Rainy Weather'),
                    ('high_demand', 'High Demand (orders/hr)'),
                    ('custom_time', 'Custom Time Window'),
                ], max_length=20)),
                ('multiplier', models.DecimalField(decimal_places=2, default=1.2, help_text='e.g. 1.20 = 20% surge, 1.50 = 50% surge', max_digits=4)),
                ('label', models.CharField(default='Surge Pricing Active', help_text='Shown to user, e.g. "🌧️ Rain Surge +20%"', max_length=80)),
                ('emoji', models.CharField(default='⚡', max_length=5)),
                ('start_hour', models.PositiveSmallIntegerField(blank=True, help_text='0–23', null=True)),
                ('end_hour', models.PositiveSmallIntegerField(blank=True, help_text='0–23', null=True)),
                ('demand_threshold', models.PositiveIntegerField(default=50, help_text='Orders per hour to trigger')),
                ('is_active', models.BooleanField(default=True)),
                ('priority', models.PositiveSmallIntegerField(default=10, help_text='Lower = evaluated first')),
            ],
            options={
                'ordering': ['priority'],
            },
        ),
    ]
