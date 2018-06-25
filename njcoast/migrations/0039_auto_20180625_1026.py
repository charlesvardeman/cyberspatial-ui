# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('njcoast', '0038_auto_20180625_1010'),
    ]

    operations = [
        migrations.RenameField(
            model_name='njcusermeta',
            old_name='additional_muni_reqest',
            new_name='additional_muni_request',
        ),
    ]
