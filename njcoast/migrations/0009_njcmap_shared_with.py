# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('njcoast', '0008_njcmap_settings'),
    ]

    operations = [
        migrations.AddField(
            model_name='njcmap',
            name='shared_with',
            field=models.TextField(blank=True),
        ),
    ]
