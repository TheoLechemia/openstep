# Generated by Django 5.1 on 2024-08-11 20:55

import django.contrib.gis.db.models.fields
import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Media',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField()),
                ('path', models.CharField()),
            ],
        ),
        migrations.CreateModel(
            name='Travel',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=200)),
                ('description', models.CharField()),
                ('start_date', models.DateTimeField()),
                ('end_date', models.DateTimeField()),
                ('main_photo', models.CharField()),
            ],
        ),
        migrations.CreateModel(
            name='Step',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField()),
                ('location', django.contrib.gis.db.models.fields.PointField(srid=4326, verbose_name='Location')),
                ('descriptions', models.CharField()),
                ('medias', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='step.media')),
            ],
        ),
    ]