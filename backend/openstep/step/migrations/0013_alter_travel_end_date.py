# Generated by Django 5.1 on 2024-08-15 14:07

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('step', '0012_alter_travel_main_photo'),
    ]

    operations = [
        migrations.AlterField(
            model_name='travel',
            name='end_date',
            field=models.DateField(blank=True, null=True),
        ),
    ]
