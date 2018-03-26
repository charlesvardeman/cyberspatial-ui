# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('njcoast', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='njcmapannotation',
            name='owner',
            field=models.ForeignKey(blank=True, to=settings.AUTH_USER_MODEL, null=True),
        ),
        migrations.AlterField(
            model_name='njcmapannotation',
            name='text',
            field=models.CharField(max_length=250, null=True, blank=True),
        ),
    ]
