# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('njcoast', '0020_auto_20180520_1234'),
    ]

    operations = [
        migrations.AddField(
            model_name='njcusermeta',
            name='justification',
            field=models.TextField(null=True, blank=True),
        ),
    ]
