# Generated by Django 3.0.7 on 2020-10-29 08:12

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('forvaltningsportal', '0011_sublag_faktaark'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='kartlag',
            name='klikktekst',
        ),
        migrations.RemoveField(
            model_name='kartlag',
            name='klikktekst2',
        ),
        migrations.RemoveField(
            model_name='kartlag',
            name='klikkurl',
        ),
        migrations.RemoveField(
            model_name='kartlag',
            name='testkoordinater',
        ),
        migrations.RemoveField(
            model_name='sublag',
            name='erSynlig',
        ),
    ]
