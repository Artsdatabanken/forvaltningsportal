# Generated by Django 3.0.4 on 2020-03-12 14:29

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('forvaltningsportal', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='kartlag',
            name='tema',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='forvaltningsportal.Tema'),
        ),
        migrations.AlterField(
            model_name='kartlag',
            name='type',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='forvaltningsportal.Type'),
        ),
    ]