# Generated by Django 5.1 on 2024-08-14 21:05

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('step', '0006_alter_step_descriptions'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='media',
            name='path',
        ),
        migrations.AddField(
            model_name='media',
            name='media_file',
            field=models.FileField(default='la', upload_to='media', verbose_name='File'),
            preserve_default=False,
        ),
    ]
