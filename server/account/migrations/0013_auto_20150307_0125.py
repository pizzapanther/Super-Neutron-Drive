# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('account', '0012_auto_20150104_2323'),
    ]

    operations = [
        migrations.AlterField(
            model_name='subscription',
            name='name',
            field=models.CharField(max_length=50, verbose_name=b'Display Name for Credits'),
            preserve_default=True,
        ),
    ]
