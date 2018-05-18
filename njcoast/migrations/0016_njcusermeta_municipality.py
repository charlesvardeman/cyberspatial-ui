# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('njcoast', '0015_njcmunicipality'),
    ]

    operations = [
        migrations.AddField(
            model_name='njcusermeta',
            name='municipality',
            field=models.ForeignKey(blank=True, to='njcoast.NJCMunicipality', null=True),
        ),
    ]
