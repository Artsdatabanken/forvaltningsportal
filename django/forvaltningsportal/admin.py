from django.contrib import admin
from .models import *

class SublagInline(admin.StackedInline):
    model = Sublag

class KartlagAdmin(admin.ModelAdmin):
    inlines = [
        SublagInline,
    ]

admin.site.register(Tema)
admin.site.register(Kartlag,KartlagAdmin)
admin.site.register(Tag)
admin.site.register(Dataeier)
admin.site.register(Type)
