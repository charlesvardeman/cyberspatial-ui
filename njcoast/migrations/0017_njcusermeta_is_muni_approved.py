# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('njcoast', '0016_njcusermeta_municipality'),
    ]

    operations = [
        migrations.AddField(
            model_name='njcusermeta',
            name='is_muni_approved',
            field=models.BooleanField(default=False),
        ),
    ]
