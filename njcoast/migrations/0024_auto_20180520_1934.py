# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('njcoast', '0023_njcmunicipality_code'),
    ]

    operations = [
        migrations.AddField(
            model_name='njcusermeta',
            name='dca_approval_date',
            field=models.DateTimeField(null=True, blank=True),
        ),
        migrations.AddField(
            model_name='njcusermeta',
            name='muni_approval_date',
            field=models.DateTimeField(null=True, blank=True),
        ),
        migrations.AddField(
            model_name='njcusermeta',
            name='notes',
            field=models.TextField(null=True, blank=True),
        ),
    ]
