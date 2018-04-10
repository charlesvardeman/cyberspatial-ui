# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('njcoast', '0012_auto_20180410_0826'),
    ]

    operations = [
        migrations.AlterField(
            model_name='njcmapannotation',
            name='text',
            field=models.TextField(null=True, blank=True),
        ),
    ]
