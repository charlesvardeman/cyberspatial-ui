# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('njcoast', '0027_njcmunicipality_county'),
    ]

    operations = [
        migrations.AddField(
            model_name='njcusermeta',
            name='address_line_1',
            field=models.CharField(max_length=50, null=True, blank=True),
        ),
        migrations.AddField(
            model_name='njcusermeta',
            name='address_line_2',
            field=models.CharField(max_length=50, null=True, blank=True),
        ),
        migrations.AddField(
            model_name='njcusermeta',
            name='city',
            field=models.CharField(max_length=50, null=True, blank=True),
        ),
        migrations.AddField(
            model_name='njcusermeta',
            name='zip',
            field=models.PositiveIntegerField(null=True, blank=True),
        ),
    ]
