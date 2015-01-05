# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('account', '0011_subscription_stripe_subs'),
    ]

    operations = [
        migrations.AddField(
            model_name='subscription',
            name='paypal_id',
            field=models.CharField(max_length=255, null=True, blank=True),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='subscription',
            name='paypal_subs',
            field=models.CharField(max_length=255, null=True, blank=True),
            preserve_default=True,
        ),
        migrations.AlterField(
            model_name='subscription',
            name='stype',
            field=models.CharField(max_length=20, verbose_name=b'Subscription Type', choices=[(b'initiate', b'Initiate'), (b'padawan', b'Padawan'), (b'knight', b'Knight'), (b'master', b'Master'), (b'grand-master', b'Grand Master'), (b'special', b'Special')]),
            preserve_default=True,
        ),
    ]
