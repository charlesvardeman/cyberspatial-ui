# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('njcoast', '0028_auto_20180524_0850'),
    ]

    operations = [
        migrations.AlterField(
            model_name='njcusermeta',
            name='zip',
            field=models.CharField(max_length=20, null=True, blank=True),
        ),
    ]
