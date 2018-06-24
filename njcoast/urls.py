from django.conf.urls import patterns, url
from django.views.generic import TemplateView
from django.contrib.auth.decorators import login_required

from geonode.urls import urlpatterns
from .views import my_gis_layers, MapTemplateView, DashboardTemplateView, MapExpertTemplateView, ExploreTemplateView, DCADashboardTemplateView, ExploreMapsTemplateView, ExploreLayersTemplateView
from njcoast.views import map_annotations, njc_map_utilities, map_expert_simulations, map_settings, signup, user_approval, change_password, municipalities_in_county

from django.conf import settings
from django.conf.urls.static import static

urlpatterns = patterns('',
                       url(r'^/?$', TemplateView.as_view(template_name='site_index.html'), name='home'),
                       url(r'^about/$', TemplateView.as_view(template_name='site_about.html'), name='about'),
                       url(r'^resources-faq/$', TemplateView.as_view(template_name='site_resources_faq.html'), name='faq'),
                       url(r'^resources-shp/$', TemplateView.as_view(template_name='site_resources_shp.html'), name='shp'),
                       url(r'^explore/$', login_required(ExploreTemplateView.as_view()), name='explore'),
                       url(r'^explore-maps/$', login_required(ExploreMapsTemplateView.as_view()), name='explore-maps'),
                       url(r'^explore-layers/$', login_required(ExploreLayersTemplateView.as_view()), name='explore-layers'),
                       url(r'^maps/$', login_required(MapTemplateView.as_view()), name='maps_browse'),
                       url(r'^expert/$', login_required(MapExpertTemplateView.as_view()), name='maps_expert'),
                       url(r'^store/$', map_expert_simulations, name='map_expert_simulations_api'),
                       url(r'^dashboard/$', login_required(DashboardTemplateView.as_view()), name='dashboard'),
                       url(r'^dca_dashboard/$', login_required(DCADashboardTemplateView.as_view()), name='dca_dashboard'),
                       #overwrite the Geonone new map
                       url(r'^maps/new$', njc_map_utilities, name='njc_map_utilities'),
                       url(r'^maps/new/$', njc_map_utilities, name='njc_map_utilities'),
                       url(r'^map/(?P<map_id>[a-zA-Z0-9_]+)/$', login_required(MapTemplateView.as_view()), name='map_annotate'),
                       url(r'^map/(?P<map_id>[a-zA-Z0-9_]+)/settings/$', map_settings, name='map_settings_api'),
                       url(r'^map/(?P<map_id>[a-zA-Z0-9_]+)/annotations/$', map_annotations, name='map_annotations_api'),
                       url(r'^api/my_layers/$', my_gis_layers, name='my_gis_layers'),
                       url(r'^signup/$', signup, name='signup'),
                       url(r'^user/settings/$', user_approval, name='user_approval'),
                       url(r'^password/$', change_password, name='change_password'),
                       url(r'^municipalities_in_county/$', municipalities_in_county, name='municipalities_in_county'),
                       ) + urlpatterns

#if settings.DEBUG:
#    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
