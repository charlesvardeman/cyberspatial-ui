# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('njcoast', '0032_auto_20180530_2148'),
    ]

    operations = [
        migrations.AddField(
            model_name='njccounty',
            name='code',
            field=models.PositiveIntegerField(default=0),
        ),
        migrations.AddField(
            model_name='njccounty',
            name='home_latitude',
            field=models.CharField(default=b'', max_length=20),
        ),
        migrations.AddField(
            model_name='njccounty',
            name='home_longitude',
            field=models.CharField(default=b'', max_length=20),
        ),
        migrations.AddField(
            model_name='njccounty',
            name='zoom_level',
            field=models.PositiveIntegerField(default=0),
        ),
    ]
