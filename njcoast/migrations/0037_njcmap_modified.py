# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
import datetime


class Migration(migrations.Migration):

    dependencies = [
        ('njcoast', '0036_njcmap_thumbnail'),
    ]

    operations = [
        migrations.AddField(
            model_name='njcmap',
            name='modified',
            field=models.DateTimeField(default=datetime.datetime.now, blank=True),
        ),
    ]
