# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('njcoast', '0034_auto_20180601_0823'),
    ]

    operations = [
        migrations.AddField(
            model_name='njcmapexpert',
            name='sim_name',
            field=models.CharField(max_length=50, blank=True),
        ),
    ]
