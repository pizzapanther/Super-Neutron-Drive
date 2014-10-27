# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import datetime


class Migration(migrations.Migration):

    dependencies = [
        ('editor', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='beamapikey',
            name='generated',
            field=models.DateTimeField(default=datetime.datetime(2014, 10, 27, 21, 21, 53, 422642), auto_now=True),
            preserve_default=False,
        ),
    ]
