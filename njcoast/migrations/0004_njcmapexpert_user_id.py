# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('njcoast', '0003_njcmapexpert'),
    ]

    operations = [
        migrations.AddField(
            model_name='njcmapexpert',
            name='user_id',
            field=models.CharField(default=0, max_length=10),
            preserve_default=False,
        ),
    ]
