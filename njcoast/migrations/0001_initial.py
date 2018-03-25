# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='NJCMap',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(max_length=50)),
                ('description', models.TextField(blank=True)),
                ('is_default', models.BooleanField(default=False)),
                ('owner', models.ForeignKey(to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='NJCMapAnnotation',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('leaflet_id', models.CharField(max_length=50)),
                ('type', models.CharField(max_length=50)),
                ('text', models.CharField(max_length=250)),
                ('data', models.TextField()),
                ('map', models.ForeignKey(to='njcoast.NJCMap')),
            ],
        ),
    ]
