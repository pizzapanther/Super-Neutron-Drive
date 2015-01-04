# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import datetime
from django.utils.timezone import utc


class Migration(migrations.Migration):

    dependencies = [
        ('account', '0007_subscription_active'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='subscription',
            name='active',
        ),
        migrations.AddField(
            model_name='subscription',
            name='expires',
            field=models.DateTimeField(default=datetime.datetime(2015, 1, 3, 4, 10, 23, 394829, tzinfo=utc)),
            preserve_default=False,
        ),
    ]
