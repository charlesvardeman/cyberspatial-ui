from django.contrib import admin

# Register your models here.
from .models import NJCMap, NJCMapAnnotation, NJCMapExpert

admin.site.register(NJCMap)
admin.site.register(NJCMapAnnotation)
admin.site.register(NJCMapExpert)
