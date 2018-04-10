# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('njcoast', '0010_auto_20180409_1725'),
    ]

    operations = [
        migrations.AddField(
            model_name='njcmapexpert',
            name='user_name',
            field=models.TextField(blank=True),
        ),
    ]
