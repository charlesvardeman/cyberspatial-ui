from django.http import JsonResponse
from guardian.shortcuts import get_objects_for_user
from django.conf import settings
from geonode.layers.models import Layer
from django.views.generic import TemplateView
import json
from models import NJCMap, NJCMapAnnotation

'''
  This function is used to respond to ajax requests for which layers should be
  visible for a given user. Borrowed a lot of this from the GeoNode base code
  for the layer list view page that is provided by Geonode
'''
def my_gis_layers(request):

    # get all object (django-guardian) that the user is allowed to see
    permitted_ids = get_objects_for_user(
        request.user,
        'base.view_resourcebase').values('id')

    # filter it down to layers so that we know that they will have the right
    # object properties
    permitted_layers = Layer.objects.filter(id__in=permitted_ids)

    layers_dictionary = {"layers":[]}
    for object in permitted_layers:
        try:
            layers_dictionary["layers"].append(
            {"id": "layer__" + str(object.layer.id),
             "name": object.layer.title,
             "group": object.layer.category.gn_description,
             "layer_link": settings.GEOSERVER_PUBLIC_LOCATION + "wms?",
             "layer": object.layer.typename
            }
            )
        except:
            # simply ignore layers without categories assigned and continue on with the loop
            pass


    return JsonResponse(layers_dictionary)



'''
  Template View that injects some parameters about starting map position based on user keywords
  This should be reworked at some point to be more elegantly tied to user's Groups
  and values controlled by GeoNode
'''
class MapTemplateView(TemplateView):
    template_name = 'map.html'

    def get_context_data(self, **kwargs):
        context = super(MapTemplateView, self).get_context_data(**kwargs)

        keywords = self.request.user.keywords

        # map_object, created = NJCMap.objects.get_or_create(
        #         owner = request.user, is_default=True,
        #         defaults = {
        #             'name' : "%s's Default Map" % request.user,
        #             'description' : 'NJ Coast auto-generated starter map for %s' % request.user
        #         }
        # )
        # context['map_id'] = map_object.id



        # no keywords assigned OR both Keansburg + Berkeley will start the user
        # at Keansburg, as well as the obvious case of just having keansburg
        if keywords.filter(name="keansburg").exists() or len(keywords.all()) == 0:
            context['home_latitude'] = "40.4417743"
            context['home_longitude'] = "-74.1298643"
            context['zoom_level'] = 14
        elif keywords.filter(name="berkeley").exists():
            context['home_latitude'] = "39.9051846"
            context['home_longitude'] = "-74.1808381"
            context['zoom_level'] = 13
        return context

def map_annotations(request, map_id):
    if request.method == "GET":
        # Get all of the annotations for a given map
        annotations = NJCMapAnnotation.objects.filter(map_id=map_id).values()
        annotations_dict = {'objects': []}

        for annotation in annotations:
            data_dict = json.loads(annotation['data'])

            annotations_dict['objects'].append({
                'myid' : map_id,
                'text' : annotation['text'],
                'type' : annotation['type'],
                'data' : data_dict,
                'owner': annotation['owner_id']
            })
        #pop them into a dictionary and send them back to the caller as a JsonResponse
        return JsonResponse(annotations_dict)

    elif request.method == "POST":
        annotations_updated = 0
        annotation_dict = json.loads(request.POST['data'])
        # print request.POST['data']
        # print annotation_dict
        for annotation in annotation_dict['objects']:
            obj, created = NJCMapAnnotation.objects.get_or_create(
                leaflet_id = annotation['data']['id'], map_id = map_id,
                defaults = {
                    'type' : annotation['type'],
                    'text' : annotation['text'],
                    'data' : json.dumps(annotation['data']),
                    'owner' : request.user
                }
            )
            if not created:
                if obj.owner is request.user:
                    #only update if the owner is the USER
                    obj.text = annotation['text']
                    obj.data = json.dumps(annotation['data'])
                    obj.save()
                    annotations_updated += 1
            else:
                annotations_updated += 1


        return JsonResponse({'saved': True, 'annotations' : annotations_updated})
