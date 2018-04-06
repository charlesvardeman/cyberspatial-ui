# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
import datetime


class Migration(migrations.Migration):

    dependencies = [
        ('njcoast', '0005_njcmapexpert_created_at'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='njcmapexpert',
            name='created_at',
        ),
        migrations.AddField(
            model_name='njcmapexpert',
            name='created',
            field=models.DateTimeField(default=datetime.datetime(2018, 4, 3, 19, 24, 55, 845827), editable=False),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='njcmapexpert',
            name='modified',
            field=models.DateTimeField(default=datetime.datetime(2018, 4, 3, 19, 25, 1, 133599)),
            preserve_default=False,
        ),
    ]
