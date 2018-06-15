# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('njcoast', '0031_njcusermeta_county'),
    ]

    operations = [
        migrations.AddField(
            model_name='njccounty',
            name='group_name',
            field=models.CharField(default=b'', max_length=20),
        ),
        migrations.AddField(
            model_name='njcregionlevel',
            name='group_name',
            field=models.CharField(default=b'', max_length=20),
        ),
    ]
