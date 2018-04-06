# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('njcoast', '0006_auto_20180403_1925'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='njcmapexpert',
            name='created',
        ),
    ]
