# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('account', '0004_auto_20150103_0024'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='subscription',
            name='expires',
        ),
        migrations.AddField(
            model_name='subscription',
            name='stripe_id',
            field=models.CharField(max_length=255, null=True, blank=True),
            preserve_default=True,
        ),
    ]
