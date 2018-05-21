# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('njcoast', '0018_auto_20180520_1225'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='njcusermeta',
            name='role',
        ),
        migrations.DeleteModel(
            name='NJCRoles',
        ),
    ]
