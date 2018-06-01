# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('njcoast', '0033_auto_20180531_2124'),
    ]

    operations = [
        migrations.AddField(
            model_name='njcusermeta',
            name='dca_approver',
            field=models.CharField(max_length=50, null=True, blank=True),
        ),
        migrations.AddField(
            model_name='njcusermeta',
            name='muni_approver',
            field=models.CharField(max_length=50, null=True, blank=True),
        ),
    ]
