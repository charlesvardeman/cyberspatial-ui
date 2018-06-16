# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('njcoast', '0035_njcmapexpert_sim_name'),
    ]

    operations = [
        migrations.AddField(
            model_name='njcmap',
            name='thumbnail',
            field=models.ImageField(null=True, upload_to=b'thumbnails/', blank=True),
        ),
    ]
