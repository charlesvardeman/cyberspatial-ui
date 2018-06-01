# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('njcoast', '0029_auto_20180526_1653'),
    ]

    operations = [
        migrations.CreateModel(
            name='NJCRegionLevel',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(max_length=20)),
            ],
        ),
        migrations.AddField(
            model_name='njcusermeta',
            name='region_level',
            field=models.ForeignKey(blank=True, to='njcoast.NJCRegionLevel', null=True),
        ),
    ]
