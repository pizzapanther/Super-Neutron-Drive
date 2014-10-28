# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('editor', '0003_auto_20141027_2124'),
    ]

    operations = [
        migrations.CreateModel(
            name='EKey',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('beam', models.CharField(max_length=255)),
                ('ekey', models.CharField(max_length=255)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('user', models.ForeignKey(to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'Encryption Key',
            },
            bases=(models.Model,),
        ),
        migrations.AlterUniqueTogether(
            name='ekey',
            unique_together=set([('user', 'ekey')]),
        ),
    ]
