# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('njcoast', '0037_njcmap_modified'),
    ]

    operations = [
        migrations.AddField(
            model_name='njcusermeta',
            name='additional_muni_approved',
            field=models.TextField(null=True, blank=True),
        ),
        migrations.AddField(
            model_name='njcusermeta',
            name='additional_muni_reqest',
            field=models.TextField(null=True, blank=True),
        ),
    ]
