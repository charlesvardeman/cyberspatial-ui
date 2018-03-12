from django.conf.urls import patterns, url
from django.views.generic import TemplateView

from geonode.urls import *
from .views import my_gis_layers, MapTemplateView

urlpatterns = patterns('',
                       url(r'^/?$', TemplateView.as_view(template_name='site_index.html'), name='home'),
                       url(r'^about/$', TemplateView.as_view(template_name='site_about.html'), name='about'),
                       url(r'^maps/$', MapTemplateView.as_view(), name='maps_browse'),
                       url(r'^api/my_layers/$', my_gis_layers, name='my_gis_layers'),
                       ) + urlpatterns
