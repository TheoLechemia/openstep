# Generated by Django 5.1 on 2024-08-15 10:19

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('step', '0010_rename_descriptions_step_description_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='step',
            name='date',
            field=models.DateField(),
            preserve_default=False,
        ),
    ]
