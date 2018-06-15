# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('njcoast', '0025_auto_20180520_1942'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='njccounty',
            name='group_name',
        ),
        migrations.AddField(
            model_name='njcrole',
            name='group_name',
            field=models.CharField(default=b'', max_length=20),
        ),
    ]
