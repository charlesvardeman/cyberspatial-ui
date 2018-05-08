# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('njcoast', '0007_remove_njcmapexpert_created'),
    ]

    operations = [
        migrations.AddField(
            model_name='njcmap',
            name='settings',
            field=models.TextField(blank=True),
        ),
    ]
