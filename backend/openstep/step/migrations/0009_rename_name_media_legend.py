# Generated by Django 5.1 on 2024-08-14 21:17

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('step', '0008_remove_step_medias_media_step'),
    ]

    operations = [
        migrations.RenameField(
            model_name='media',
            old_name='name',
            new_name='legend',
        ),
    ]
