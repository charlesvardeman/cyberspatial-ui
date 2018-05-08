# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('njcoast', '0011_njcmapexpert_user_name'),
    ]

    operations = [
        migrations.AddField(
            model_name='njcmapexpert',
            name='catagory',
            field=models.CharField(max_length=20, blank=True),
        ),
        migrations.AddField(
            model_name='njcmapexpert',
            name='type',
            field=models.CharField(max_length=20, blank=True),
        ),
    ]
