# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('njcoast', '0022_njcusermeta_position'),
    ]

    operations = [
        migrations.AddField(
            model_name='njcmunicipality',
            name='code',
            field=models.PositiveIntegerField(default=0),
            preserve_default=False,
        ),
    ]
