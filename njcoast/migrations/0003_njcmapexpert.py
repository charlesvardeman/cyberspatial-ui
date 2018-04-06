# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('njcoast', '0002_auto_20180326_1429'),
    ]

    operations = [
        migrations.CreateModel(
            name='NJCMapExpert',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('sim_id', models.CharField(max_length=20)),
                ('description', models.TextField(blank=True)),
                ('data', models.TextField(blank=True)),
                ('owner', models.ForeignKey(to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
