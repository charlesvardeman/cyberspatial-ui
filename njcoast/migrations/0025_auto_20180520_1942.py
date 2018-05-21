# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('njcoast', '0024_auto_20180520_1934'),
    ]

    operations = [
        migrations.CreateModel(
            name='NJCCounty',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(max_length=20)),
                ('group_name', models.CharField(default=b'', max_length=20)),
            ],
        ),
        migrations.AddField(
            model_name='njcmunicipality',
            name='group_name',
            field=models.CharField(default=b'', max_length=20),
        ),
    ]
