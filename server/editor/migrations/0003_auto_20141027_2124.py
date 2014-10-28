# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('editor', '0002_beamapikey_generated'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='beamapikey',
            options={'verbose_name': 'Beam API Key'},
        ),
    ]
