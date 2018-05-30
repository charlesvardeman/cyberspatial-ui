# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('njcoast', '0030_auto_20180530_1307'),
    ]

    operations = [
        migrations.AddField(
            model_name='njcusermeta',
            name='county',
            field=models.ForeignKey(blank=True, to='njcoast.NJCCounty', null=True),
        ),
    ]
