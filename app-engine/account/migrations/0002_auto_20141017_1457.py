# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('account', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='newsletter',
            field=models.BooleanField(default=False, verbose_name=b'Subscribe to Newsletter'),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='user',
            name='verified',
            field=models.BooleanField(default=False),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='user',
            name='verified_email',
            field=models.EmailField(max_length=75, null=True, verbose_name=b'verified email address', blank=True),
            preserve_default=True,
        ),
    ]
