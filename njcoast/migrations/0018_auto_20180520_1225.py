# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('njcoast', '0017_njcusermeta_is_muni_approved'),
    ]

    operations = [
        migrations.CreateModel(
            name='NJCRoles',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(max_length=20)),
            ],
        ),
        migrations.AddField(
            model_name='njcusermeta',
            name='role',
            field=models.ForeignKey(blank=True, to='njcoast.NJCRoles', null=True),
        ),
    ]
