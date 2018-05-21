# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('njcoast', '0021_njcusermeta_justification'),
    ]

    operations = [
        migrations.AddField(
            model_name='njcusermeta',
            name='position',
            field=models.TextField(null=True, blank=True),
        ),
    ]
