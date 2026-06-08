# Generated for openstep: add uuid and is_public to Travel

import uuid

from django.db import migrations, models


def populate_uuids(apps, schema_editor):
    """Assign a fresh uuid to every existing travel."""
    Travel = apps.get_model("step", "Travel")
    for travel in Travel.objects.all():
        travel.uuid = uuid.uuid4()
        travel.save(update_fields=["uuid"])


def noop(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('step', '0023_alter_step_date'),
    ]

    operations = [
        # Le champ uuid doit être introduit en trois temps. Ajouter directement
        # un UUIDField unique sur une table déjà peuplée échoue : toutes les
        # lignes existantes recevraient la MÊME valeur par défaut au niveau SQL,
        # ce qui viole la contrainte d'unicité. On (1) l'ajoute nullable et non
        # unique, ...
        migrations.AddField(
            model_name='travel',
            name='uuid',
            field=models.UUIDField(default=uuid.uuid4, editable=False, null=True),
        ),
        # ... (2) on remplit un uuid distinct par ligne existante, ...
        migrations.RunPython(populate_uuids, noop),
        # ... (3) puis on impose l'unicité et l'index une fois chaque ligne valuée.
        migrations.AlterField(
            model_name='travel',
            name='uuid',
            field=models.UUIDField(default=uuid.uuid4, editable=False, unique=True, db_index=True),
        ),
        migrations.AddField(
            model_name='travel',
            name='is_public',
            field=models.BooleanField(default=True, verbose_name='Public'),
        ),
    ]
