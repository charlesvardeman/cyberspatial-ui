# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('njcoast', '0014_njcusermeta'),
    ]

    operations = [
        migrations.CreateModel(
            name='NJCMunicipality',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(max_length=20)),
                ('home_latitude', models.CharField(max_length=20)),
                ('home_longitude', models.CharField(max_length=20)),
                ('zoom_level', models.PositiveIntegerField()),
            ],
        ),
    ]
