# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('editor', '0005_auto_20141028_2047'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='ekey',
            options={'get_latest_by': 'created', 'verbose_name': 'Encryption Key'},
        ),
    ]
