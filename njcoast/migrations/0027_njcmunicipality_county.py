# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('njcoast', '0026_auto_20180520_1943'),
    ]

    operations = [
        migrations.AddField(
            model_name='njcmunicipality',
            name='county',
            field=models.ForeignKey(blank=True, to='njcoast.NJCCounty', null=True),
        ),
    ]
