# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
import datetime


class Migration(migrations.Migration):

    dependencies = [
        ('njcoast', '0004_njcmapexpert_user_id'),
    ]

    operations = [
        migrations.AddField(
            model_name='njcmapexpert',
            name='created_at',
            field=models.DateTimeField(default=datetime.datetime(2018, 4, 3, 19, 18, 34, 994084), auto_now_add=True),
            preserve_default=False,
        ),
    ]
