# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('account', '0005_auto_20150103_0026'),
    ]

    operations = [
        migrations.AlterField(
            model_name='subscription',
            name='stype',
            field=models.CharField(max_length=20, verbose_name=b'Subscription Type', choices=[(b'initiate', b'Initiate'), (b'padawan', b'Padawan'), (b'knight', b'Knight'), (b'master', b'Master'), (b'grand-master', b'Grand Master')]),
            preserve_default=True,
        ),
    ]
