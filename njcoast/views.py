from django.http import JsonResponse
from guardian.shortcuts import get_objects_for_user
from django.conf import settings
from geonode.layers.models import Layer

def my_gis_layers(request):

    permitted_ids = get_objects_for_user(
        request.user,
        'base.view_resourcebase').values('id')

    permitted_layers = Layer.objects.filter(id__in=permitted_ids)

    layers_dictionary = {"layers":[]}
    for object in permitted_layers:
        layers_dictionary["layers"].append(
        {"id": "layer__" + str(object.layer.id),
         "name": object.layer.title,
         "group": object.layer.category.description,
         "layer_link": settings.GEOSERVER_PUBLIC_LOCATION + "wms?",
         "layer": object.layer.typename
        }
        )

    return JsonResponse(layers_dictionary)
        
#    return JsonResponse({
#  "layers": [
#    {
#      "id": "natural2015",
#      "name": "Natural Imagery 2015",
#      "group": "Base Mapping",
#      "layer_link": "http://192.168.33.10:8080/geoserver/wms?",
#      "layer": "geonode:Natural2015"
#    },
#    {
#      "id": "flowdirection",
#      "name": "Flow Direction",
#      "group": "Base Mapping",
#      "layer_link": "https://services.nationalmap.gov/arcgis/services/nhd/MapServer/WMSServer?",
#      "layer": "9"
#    },
#    {
#      "id": "waterbody",
#      "name": "Waterbody - Small Scale",
#      "group": "Base Mapping",
#      "layer_link": "https://services.nationalmap.gov/arcgis/services/nhd/MapServer/WMSServer?",
#      "layer": "8"
#    },
#    {
#      "id": "line",
#      "name": "Line - Small Scale",
#      "group": "Base Mapping",
#      "layer_link": "https://services.nationalmap.gov/arcgis/services/nhd/MapServer/WMSServer?",
#      "layer": "2"
#    }
#  ]
#    })
