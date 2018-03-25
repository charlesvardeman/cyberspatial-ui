from django.contrib import admin

# Register your models here.
from .models import NJCMap, NJCMapAnnotation

admin.site.register(NJCMap)
admin.site.register(NJCMapAnnotation)
