from django.http import JsonResponse, HttpResponseRedirect
from guardian.shortcuts import get_objects_for_user
from django.conf import settings
from geonode.layers.models import Layer
from django.views.generic import TemplateView
import json
from models import NJCMap, NJCMapAnnotation, NJCMapExpert, NJCMunicipality, NJCRole, NJCCounty, NJCRegionLevel
from django.core.urlresolvers import reverse
from django.contrib.auth.decorators import login_required
from django.utils import timezone
from django import template
from django.contrib.auth.models import Group
from django.db.models import Q
from django.contrib.auth.models import User
from itertools import chain
from datetime import datetime

from django.shortcuts import render, redirect
from .forms import SignUpForm
from .models import NJCUserMeta
from django import forms
from django.db import IntegrityError
from geonode.people.models import Profile
from django.utils import timezone
from django.core.mail import EmailMessage
from django.contrib.sites.shortcuts import get_current_site
from django.template.loader import render_to_string

from django.contrib import messages
from django.contrib.auth import update_session_auth_hash
from django.contrib.auth.forms import PasswordChangeForm
from django.shortcuts import render, redirect

'''
  This function is used to respond to ajax requests for which layers should be
  visible for a given user. Borrowed a lot of this from the GeoNode base code
  for the layer list view page that is provided by Geonode
'''
@login_required
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

        user = self.request.user
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
        #defaults
        context['home_latitude'] = "40.4417743"
        context['home_longitude'] = "-74.1298643"
        context['zoom_level'] = 14

        # get user's Municipality values
        try:
            muni = user.njcusermeta.municipality
            context['home_latitude'] = muni.home_latitude
            context['home_longitude'] = muni.home_longitude
            context['zoom_level'] = muni.zoom_level

        except:
            pass

        #get users
        #find groups I am in!
        groups = Group.objects.filter(user=self.request.user).exclude(name='anonymous')

        #get unique users in groups but exclude myself
        usersList = set()
        for group in groups:
            tempList = group.user_set.exclude(pk=self.request.user.pk)
            if tempList:
                for user in tempList:
                    print user
                    usersList.add(user.username)

        #send to client
        context['users_in_group'] = list(usersList)

        return context

class MapExpertTemplateView(TemplateView):
    template_name = 'map_expert.html'

    def get_context_data(self, **kwargs):
        context = super(MapExpertTemplateView, self).get_context_data(**kwargs)

        user = self.request.user
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
        #defaults
        context['home_latitude'] = "40.4417743"
        context['home_longitude'] = "-74.1298643"
        context['zoom_level'] = 14

        # get user's Municipality values
        try:
            muni = user.njcusermeta.municipality
            context['home_latitude'] = muni.home_latitude
            context['home_longitude'] = muni.home_longitude
            context['zoom_level'] = muni.zoom_level

        except:
            pass

        #quiery, select if I am the owner
        context['maps_for_user'] = NJCMap.objects.filter(owner = self.request.user)

        return context

'''
  Function view that simply creates a new object and then redirects the user to
  the proper map template view based on that new map object
'''
@login_required
def new_njc_map_view(request):
    # TODO: The user should have the option to name the map when they create it
    next_user_map_count = len(NJCMap.objects.filter(owner = request.user)) + 1
    map_object = NJCMap.objects.create(
        owner = request.user,
        name = "%s's Map #%d" % (request.user, next_user_map_count),
        description = 'NJ Coast auto-generated map for %s' % request.user
    )
    return HttpResponseRedirect(reverse('map_annotate', args=[map_object.id]))

'''
  API-ish view for annotation ajax calls from the map page.
'''
@login_required
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
        print "Action", request.POST['action']
        annotations_updated = 0

        #test action
        #save?
        if request.POST['action'] == 'save':
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
                if created:
                    annotations_updated += 1
                else:
                    if obj.owner == request.user:
                        #only update if the owner is the USER
                        obj.text = annotation['text']
                        obj.data = json.dumps(annotation['data'])
                        obj.save()
                        annotations_updated += 1

        #delete?
        elif request.POST['action'] == 'delete':
            print "In delete mode", request.POST['action']
            annotation_dict = json.loads(request.POST['data'])
            for annotation in annotation_dict['objects']:
                #delete object
                object_to_delete = NJCMapAnnotation.objects.get(leaflet_id = annotation['data']['id'], map_id = map_id)
                object_to_delete.delete()
                print "Deleted", annotation['data']['id']

        #unknown
        else:
            print "Action not recognized", request.POST['action']

        return JsonResponse({'saved': True, 'annotations' : annotations_updated})

'''
  API-ish view for map data ajax calls from the map page.
'''
@login_required
def map_settings(request, map_id):
    ret_val = False
    if request.method == "GET":
        #get matching object
        map_objs = NJCMap.objects.filter(id=map_id).values() #removed owner = request.user,

        #get objects and update (should be unique so grab the first)
        if len(map_objs) > 0:
            if len(map_objs[0]['settings']) > 0:
                data_dict = json.loads(map_objs[0]['settings'])
                try:
                    data_dict['shared_with'] = json.loads(map_objs[0]['shared_with'])
                except:
                    data_dict['shared_with'] = []
            else:
                data_dict = {}

            data_dict['description'] = map_objs[0]['description']
            data_dict['name'] = map_objs[0]['name']

            #determine ownership
            if map_objs[0]['owner_id'] != request.user.id:
                data_dict['owner'] = 'other'
            else:
                data_dict['owner'] = 'me'

            #pop them into a dictionary and send them back to the caller as a JsonResponse
            return JsonResponse(data_dict)

    elif request.method == "POST":
        #get matching object
        map_objs = NJCMap.objects.filter(owner = request.user, id=map_id)

        #get objects and update (should be unique so grab the first)
        if len(map_objs) > 0:
            #settings?
            if request.POST['action'] == 'save':
                print "Settings ", map_objs[0].name, map_objs[0].id, map_id
                map_objs[0].settings = request.POST['settings']
                map_objs[0].save()

            elif request.POST['action'] == 'add_simulation': #or simulation to add
                #test if it is already there
                if request.POST['sim_id'] not in map_objs[0].settings:
                    #get settings
                    try:
                        settings = json.loads(map_objs[0].settings)
                    except:
                        settings = {}

                    #append new simulation to simulations
                    settings.setdefault('simulations', []).append(request.POST['sim_id'])

                    #append to layers?
                    settings.setdefault('layers_selected', []).append(request.POST['sim_id']+"_surge")

                    #save it
                    map_objs[0].settings = json.dumps(settings)
                    map_objs[0].save()

                    #print for posterity
                    print "Settings ", map_objs[0].name, request.POST['sim_id'], json.dumps(settings)
                else:
                    print request.POST['sim_id'], "already exists!"

            elif request.POST['action'] == 'remove_simulation': #remove simulation
                #test if it is already there
                if request.POST['sim_id'] in map_objs[0].settings:
                    #get settings
                    settings = json.loads(map_objs[0].settings)

                    #append new simulation to simulations
                    settings.setdefault('simulations', []).remove(request.POST['sim_id'])

                    #save it
                    map_objs[0].settings = json.dumps(settings)
                    map_objs[0].save()

                    #print for posterity
                    print "Removed ", map_objs[0].name, request.POST['sim_id'], json.dumps(settings)

            elif request.POST['action'] == 'share': #or sharing?
                print "Shared ", map_objs[0].name, map_objs[0].id, map_id
                map_objs[0].shared_with = request.POST['shares']
                map_objs[0].save()

            else:
                print "Action not defined!"

            #flag if actually updated
            ret_val = True

    return JsonResponse({'saved': ret_val})

'''
  API-ish view for expert simulation ajax calls from the map_expert page.
'''
@login_required
def map_expert_simulations(request):
    if request.method == "GET":
        #find required action
        if request.GET['action'] == 'get_sim_id_data':
            #get matching object
            sim_objs = NJCMapExpert.objects.filter(sim_id=request.GET['data']).values()

            #get objects and update (should be unique so grab the first)
            #for map_obj in map_objs:
            if len(sim_objs) > 0:
                print "user", sim_objs[0]['user_id'], request.GET['data'], request.user.get_full_name()

                return JsonResponse({'user_id': sim_objs[0]['user_id'], 'status': True, 'data': sim_objs[0]})

            return JsonResponse({'user_id': 0,'status': False})

        elif request.GET['action'] == 'get_my_data': #if getting all data
            #get the ordering
            order_by = request.GET['order_by']

            #if dates
            if len(request.GET['start_date']) > 0 and len(request.GET['end_date']) > 0:
                try:
                    start_date = datetime.strptime(request.GET['start_date'], '%m/%d/%Y')
                    end_date = datetime.strptime(request.GET['end_date'], '%m/%d/%Y')
                except:
                    return JsonResponse({'user_id': 0,'status': False})

                #get data from db
                db_data = NJCMapExpert.objects.filter(owner = request.user, modified__range=(start_date, end_date), description__contains=request.GET['text_search']).order_by(order_by)

            #or just belonging to user
            else:
                #get data from db
                db_data = NJCMapExpert.objects.filter(owner = request.user, description__contains=request.GET['text_search']).order_by(order_by)

            #parse out results
            output_array = []
            for dat in db_data:
                inner_dict = {}
                inner_dict['sim_id'] = dat.sim_id
                inner_dict['user_name'] = dat.user_name
                inner_dict['description'] = dat.description
                inner_dict['data'] = json.loads(dat.data)
                inner_dict['modified'] = dat.modified.strftime('%m/%d/%Y %H:%M')
                output_array.append(inner_dict)

            #send it back
            return JsonResponse({'user_id': 0,'status': True, 'data': output_array})

        else:
            return JsonResponse({'user_id': 0,'status': False})

    elif request.method == "POST":
        expert_dict = json.loads(request.POST['data'])
        print request.POST['data']
        print request.POST['sim_id'], request.user
        obj, created = NJCMapExpert.objects.get_or_create(
            sim_id = request.POST['sim_id'], owner = request.user,
            defaults = {
                'data' : request.POST['data'],
                'description' : request.POST['description'],
                'user_id': request.POST['user_id'],
                'user_name': request.user.get_full_name(),
                'modified': timezone.now()
            }
        )
        if created:
            print "Created"
        else:
            if obj.owner == request.user:
                #only update if the owner is the USER
                obj.data = request.POST['data']
                obj.description = request.POST['description']
                obj.user_id = request.POST['user_id']
                obj.modified = timezone.now()
                obj.save()

        return JsonResponse({'saved': True})

class DashboardTemplateView(TemplateView):
    template_name = 'dashboard.html'

    def get_context_data(self, **kwargs):
        context = super(DashboardTemplateView, self).get_context_data(**kwargs)

        #quiery, select if I am the owner
        context['maps_for_user'] = NJCMap.objects.filter(owner = self.request.user)

        #quiery, select if I an in the list of shared_with__contains
        context['shared_maps_for_user'] = NJCMap.objects.filter(shared_with__contains = self.request.user)

        #get users groups
        current_user = self.request.user
        group_name = current_user.njcusermeta.role.group_name + "-" + current_user.njcusermeta.municipality.group_name
        print "GN",group_name
        group = Group.objects.get(name=group_name)
        tempList = group.user_set.exclude(pk=self.request.user.pk)
        context['main_group_membership_len'] = len(tempList) + 1
        context['main_group_membership'] = tempList

        #admin?
        if current_user.groups.filter(name='dca_administrators').exists():
            dcausers = current_user.groups.get(name='dca_administrators').user_set.exclude(pk=self.request.user.pk)
            context['dca_group_membership_len'] = len(dcausers) + 1
            context['dca_group_membership'] = dcausers

        if current_user.groups.filter(name='municipal_administrators').exists():
            muniusers = current_user.groups.get(name='municipal_administrators').user_set.exclude(pk=self.request.user.pk)
            context['muni_group_membership_len'] = len(muniusers) + 1
            context['muni_group_membership'] = muniusers


        #context['dca_group_membership'] = len(Group.objects.all())
        return context

class ExploreTemplateView(TemplateView):
    template_name = 'explore_simulations.html'

    def get_context_data(self, **kwargs):
        context = super(ExploreTemplateView, self).get_context_data(**kwargs)

        #quiery, select if I am the owner
        context['maps_for_user'] = NJCMap.objects.filter(owner = self.request.user)

        return context

#signup new users.
def signup(request):
    if request.method == 'POST':
        form = SignUpForm(request.POST)
        try:
            if form.is_valid():
                #create user/profile
                user = form.save(commit=False)

                #force inactive as we need to approve
                user.is_active = False

                #save Profile so that we append the NJC additional parameters
                user.save()

                #now we can populate the additional fields
                #user.njcusermeta.is_dca_approved = True
                user.njcusermeta.role = NJCRole.objects.get(name=form.cleaned_data.get('role'))
                user.njcusermeta.justification = form.cleaned_data.get('justification')
                user.njcusermeta.position = form.cleaned_data.get('position')

                #new additions for region Level
                region_level = form.cleaned_data.get('region_level')
                user.njcusermeta.region_level = NJCRegionLevel.objects.get(name=region_level)

                #save dependent models
                #print region_level, form.cleaned_data.get('county'), form.cleaned_data.get('municipality')
                if form.cleaned_data.get('county'):
                    print "County",form.cleaned_data.get('county')
                    user.njcusermeta.county = NJCCounty.objects.get(name=form.cleaned_data.get('county'))
                if form.cleaned_data.get('municipality'):
                    print "Muni", form.cleaned_data.get('municipality')
                    user.njcusermeta.municipality = NJCMunicipality.objects.get(name=form.cleaned_data.get('municipality'))
                else:
                    #if not muni then skip muni approval
                    user.njcusermeta.is_muni_approved = True
                    user.njcusermeta.muni_approval_date = timezone.now()

                #now save everything
                user.save()

                #if has a muni
                #send email
                if user.njcusermeta.municipality:
                    #first find admin to approve
                    muni_admins = Profile.objects.exclude(is_active=False).exclude(username='admin').exclude(username='AnonymousUser').filter(groups__name='municipal_administrators').filter(njcusermeta__municipality__name=user.njcusermeta.municipality.name).order_by('last_name')

                    if muni_admins:
                        for muni_admin in muni_admins:
                            #actual email part
                            current_site = get_current_site(request)
                            subject = 'Account created on NJcoast'
                            message = render_to_string('account_created_email.html', {
                                'user': muni_admin.first_name+" "+muni_admin.last_name,
                                'domain': current_site.domain,
                                'municipality': user.njcusermeta.municipality.name,
                            })

                            #send it
                            try:
                                muni_admin.email_user(subject, message)
                            except:
                                pass
                else:
                    #send email to dca admins
                    #first find admin to approve
                    dca_admins = Profile.objects.exclude(is_active=False).exclude(username='admin').exclude(username='AnonymousUser').filter(groups__name='dca_administrators').order_by('last_name')

                    if dca_admins:
                        for dca_admin in dca_admins:
                            #actual email part
                            current_site = get_current_site(request)
                            subject = 'Account created on NJcoast'
                            message = render_to_string('account_created_email.html', {
                                'user': dca_admin.first_name+" "+dca_admin.last_name,
                                'domain': current_site.domain,
                                'municipality': '',
                            })

                            #send it
                            try:
                                dca_admin.email_user(subject, message)
                            except:
                                pass

                #back home, or flag that save was successful
                #messages.success(request, 'Account created successfully')
                #return redirect('home')
                return render(request, 'account_created.html')

        except KeyError as e:
            print "Username already in use!",e.message

            return render(request, 'signup.html', {'form': form, 'error_data': 'User exists, please select an alternative!'})

        except IntegrityError as e:
            print "Email address already in use!",e.message
            #delete user if created with duplicate email
            user.delete()

            return render(request, 'signup.html', {'form': form, 'error_data': 'Email exists, please select an alternative!'})

        except:
            print "Undefined error!"

    else:
        form = SignUpForm()
    return render(request, 'signup.html', {'form': form, 'error_data': ''})

#DCA admin dashboard
class DCADashboardTemplateView(TemplateView):
    template_name = 'dca_dashboard.html'

    def get_context_data(self, **kwargs):
        context = super(DCADashboardTemplateView, self).get_context_data(**kwargs)

        #get current user
        current_user = self.request.user
        current_muni = current_user.njcusermeta.municipality.name
        is_dca = current_user.groups.filter(name='dca_administrators').exists()
        is_muni = current_user.groups.filter(name='municipal_administrators').exists()

        print "User", current_user.username, is_dca, is_muni

        #get users
        if is_dca:
            users = Profile.objects.exclude(username='admin').exclude(username='AnonymousUser').filter(njcusermeta__is_muni_approved=True).order_by('last_name')
        elif is_muni:
            users = Profile.objects.exclude(username='admin').exclude(username='AnonymousUser').exclude(groups__name='municipal_administrators').exclude(groups__name='dca_administrators').filter(njcusermeta__municipality__name=current_muni).order_by('last_name')

        total_users = len(users)
        count_requests = 0
        for user in users:
            print user.username, user.voice, user.username
            #find number to be approved
            if not user.is_active and not user.njcusermeta.is_dca_approved:
                count_requests = count_requests + 1

        #print data and add to context
        print count_requests, total_users
        context['number_to_be_approved'] = count_requests
        context['total_users'] = total_users

        #quiery, select all users
        context['users'] = users

        #get municipalities
        municipalities = NJCMunicipality.objects.exclude(name='Statewide').order_by('name')

        munis_without_admin = []
        for municipality in municipalities:
            print municipality.name
            munis_without_admin.append(municipality)

        #full list
        context['municipalities'] = NJCMunicipality.objects.order_by('name') #exclude(name='Statewide').

        if is_dca:
            #and muni admins
            muni_admins = Profile.objects.filter(groups__name='municipal_administrators').order_by('last_name')
            print "Muni admins",len(muni_admins)
            context['muni_admins'] = muni_admins

            #get definative list of munis without admins
            for muni_admin in muni_admins:
                try:
                    munis_without_admin.remove(muni_admin.njcusermeta.municipality)
                except:
                    pass
            context['munis_without_admin'] = munis_without_admin

        #get counties
        context['counties'] = NJCCounty.objects.all().order_by('name')

        #get roles
        context['roles'] = NJCRole.objects.all().order_by('name').order_by('name')

        #Get admin Municipality
        context['admin_municipality'] = current_muni

        return context

#Parse out user object to dictionary
def user_to_dictionary(user):
    #convert user data
    user_dict = {}
    user_dict['username'] = user.username
    user_dict['name'] = user.first_name + " " + user.last_name
    user_dict['email'] = user.email
    user_dict['active'] = user.is_active
    user_dict['date_joined'] = user.date_joined

    #additional user fields for NJC
    user_dict['municipality'] = user.njcusermeta.municipality.name
    user_dict['position'] = user.njcusermeta.position
    user_dict['code'] = user.njcusermeta.municipality.code
    user_dict['justification'] = user.njcusermeta.justification
    user_dict['voice'] = user.voice
    user_dict['notes'] = user.njcusermeta.notes
    user_dict['role'] = user.njcusermeta.role.name
    user_dict['rolesf'] = "".join(item[0].upper() for item in user.njcusermeta.role.name.split())
    if user_dict['rolesf'] == "P":
        user_dict['rolesf'] = "PL"
    user_dict['is_dca_approved'] = user.njcusermeta.is_dca_approved
    user_dict['is_muni_approved'] = user.njcusermeta.is_muni_approved
    user_dict['dca_approval_date'] = user.njcusermeta.dca_approval_date.__str__()
    user_dict['muni_approval_date'] = user.njcusermeta.muni_approval_date.__str__()

    #mailing address data
    user_dict['address_line_1'] = user.njcusermeta.address_line_1
    user_dict['address_line_2'] = user.njcusermeta.address_line_2
    user_dict['city'] = user.njcusermeta.city
    user_dict['zip'] = user.njcusermeta.zip

    #get muni approver username
    muni_approvers = Profile.objects.exclude(username='admin').exclude(username='AnonymousUser').filter(groups__name='municipal_administrators').filter(njcusermeta__municipality__name=user.njcusermeta.municipality).order_by('last_name')

    #grab the first if OK
    if muni_approvers:
        user_dict['muni_approver'] = muni_approvers[0].username
    else:
        user_dict['muni_approver'] = ""

    #Return
    return user_dict

'''
  Ajax calls to approve or modify users from DCA dashboard.
'''
@login_required
def user_approval(request):
    #get current user
    current_user = request.user
    current_muni = current_user.njcusermeta.municipality.name
    is_dca = current_user.groups.filter(name='dca_administrators').exists()
    is_muni = current_user.groups.filter(name='municipal_administrators').exists()

    #do we have permissions?
    if not (is_muni or is_dca):
        return JsonResponse({'updated': False});

    ####GET section of the API##################################################
    if request.method == "GET":
        print "Action", request.GET['action']
        #~~~~find required action, get user?~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        if request.GET['action'] == 'get_user':
            user = Profile.objects.get(username=request.GET['user'])
            #test we got them
            if user:
                #flag OK and return data
                return JsonResponse({'updated': True, 'data': user_to_dictionary(user), 'is_muni': is_muni, 'is_dca': is_dca, 'current_muni':current_muni})

        #~~~~find munis in county~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        elif request.GET['action'] == 'load_munis_in_county':
            #get county if set
            county = request.GET['county']

            #get municipalities
            if county == "" or county == "All":
                municipalities = NJCMunicipality.objects.exclude(name='Statewide').order_by('name')
            else:
                municipalities = NJCMunicipality.objects.exclude(name='Statewide').filter(county__name=county).order_by('name')

            #test we got them
            if municipalities:
                munis_in_county = []
                for municipality in municipalities:
                    print municipality.name
                    munis_in_county.append({'name': municipality.name})

                #flag OK and return data
                return JsonResponse({'updated': True, 'data': munis_in_county})

        #~~~~get users data~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        elif request.GET['action'] == 'get_users':
            #sorting?
            if request.GET['sortby'] != '':
                sortby = request.GET['sortby']
            else:
                sortby = 'last_name'
            print "Sort", sortby

            #get users
            if is_dca:
                users = Profile.objects.exclude(username='admin').exclude(username='AnonymousUser').filter(njcusermeta__is_muni_approved=True).order_by(sortby,'last_name')
            elif is_muni:
                users = Profile.objects.exclude(username='admin').exclude(username='AnonymousUser').exclude(groups__name='municipal_administrators').exclude(groups__name='dca_administrators').filter(njcusermeta__municipality__name=current_muni).order_by(sortby,'last_name')
            else:
                print "Not a valid user!"

            #test we got them
            if users:
                #county/municipality filters if DCA
                if is_dca:
                    if request.GET['filter_county'] != 'All':
                        users = users.filter(njcusermeta__municipality__county__name=request.GET['filter_county'])

                    if request.GET['filter_municipality'] != 'All':
                        users = users.filter(njcusermeta__municipality__name=request.GET['filter_municipality'])
                #role filters for dca and muni
                role_array = json.loads(request.GET['filter_roles'])
                if len(role_array) > 0:
                    for role in role_array:
                        print "Role",role
                        users = users.exclude(njcusermeta__role__name=role)

                output_array = []

                #get each user
                for user in users:
                    output_array.append(user_to_dictionary(user))

                #flag OK and return data
                return JsonResponse({'updated': True, 'data': output_array, 'is_muni': is_muni, 'is_dca': is_dca})

        #~~~~get list of users to be approved~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        elif request.GET['action'] == 'get_approvers':
            #get users
            if is_dca:
                users = Profile.objects.exclude(username='admin').exclude(username='AnonymousUser').filter(njcusermeta__is_muni_approved=True, is_active=False, njcusermeta__is_dca_approved=False).order_by('last_name')
            elif is_muni:
                users = Profile.objects.exclude(username='admin').exclude(username='AnonymousUser').exclude(groups__name='municipal_administrators').exclude(groups__name='dca_administrators').filter(njcusermeta__municipality__name=current_muni, is_active=False, njcusermeta__is_muni_approved=False).order_by('last_name')
            else:
                print "Not a valid user!"

            #test we got them
            output_array = []

            if users:
                #get each user
                for user in users:
                    output_array.append(user_to_dictionary(user))

                #flag OK and return data
                return JsonResponse({'updated': True, 'data': output_array, 'is_muni': is_muni, 'is_dca': is_dca})
            else:
                #flag OK and return data
                return JsonResponse({'updated': True, 'data': output_array, 'is_muni': is_muni, 'is_dca': is_dca})

        #~~~~get the muni administrators~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        elif request.GET['action'] == 'get_muni_admins':
            #sorting?
            if request.GET['sortby'] != '':
                sortby = request.GET['sortby']
            else:
                sortby = 'last_name'
            print "Sort", sortby

            #do we need to sort municipalities?
            muni_sort = 'name'
            if sortby == '-njcusermeta__municipality__name':
                muni_sort = '-name'
            elif sortby == 'njcusermeta__municipality__code':
                muni_sort = 'code'
            elif sortby == '-njcusermeta__municipality__code':
                muni_sort = '-code'

            #get county if set
            county = request.GET['county']

            #get municipalities
            if county == "" or county == "All":
                municipalities = NJCMunicipality.objects.exclude(name='Statewide').order_by(muni_sort)
            else:
                municipalities = NJCMunicipality.objects.exclude(name='Statewide').filter(county__name=county).order_by(muni_sort)

            if municipalities:
                munis_without_admin = []
                for municipality in municipalities:
                    print municipality.name
                    munis_without_admin.append({'name': municipality.name, 'code': municipality.code})

                #and muni admins
                if county == "" or county == "All":
                    muni_admins = Profile.objects.exclude(is_active=False).filter(groups__name='municipal_administrators').order_by(sortby,'last_name')
                else:
                    muni_admins = Profile.objects.exclude(is_active=False).filter(njcusermeta__municipality__county__name=county).filter(groups__name='municipal_administrators').order_by(sortby,'last_name')

                if muni_admins:
                    print "Muni admins",len(muni_admins)

                    #get definative list of munis without admins
                    output_array = []
                    for muni_admin in muni_admins:
                        output_array.append(user_to_dictionary(muni_admin))
                        try:
                            munis_without_admin.remove({'name': muni_admin.njcusermeta.municipality.name, 'code': muni_admin.njcusermeta.municipality.code})
                        except:
                            pass

                    #flag OK and return data
                    return JsonResponse({'updated': True, 'data': output_array, 'munis': munis_without_admin})

        #~~~~get the DCA administrators~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        elif request.GET['action'] == 'get_dca_admins':
            #get dca admins
            dca_admins = Profile.objects.exclude(is_active=False).filter(groups__name='dca_administrators').order_by('last_name')
            if dca_admins:
                print "DCA admins",len(dca_admins)

                output_array = []

                #get each user
                for dca_admin in dca_admins:
                    output_array.append(user_to_dictionary(dca_admin))

                #flag OK and return data
                return JsonResponse({'updated': True, 'data': output_array})

        else:
            print "Action not recognized", request.GET['action']

    ####POST section of the API#################################################
    elif request.method == "POST":
        print "Action", request.POST['action']

        #test action
        #~~~~approve?~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        if request.POST['action'] == 'approve':
            #load user
            user = Profile.objects.get(username=request.POST['user'])

            #test we got them
            if user:
                print "Approve",user.username
                #approve according to my rights
                if is_dca:
                    #set dca approved
                    user.njcusermeta.is_dca_approved = True
                    user.njcusermeta.dca_approval_date = timezone.now()
                    #set Active
                    user.is_active = True

                    #add to groups
                    #create group name
                    if user.njcusermeta.municipality:
                        #muni based groups
                        group_name = user.njcusermeta.role.group_name + '-' + user.njcusermeta.municipality.group_name
                        group, created = Group.objects.get_or_create(name=group_name)
                        if group:
                            group.user_set.add(user)
                        #if created:                        

                if is_muni:
                    #set muni approved
                    user.njcusermeta.is_muni_approved = True
                    user.njcusermeta.muni_approval_date = timezone.now()

                #set notes
                user.njcusermeta.notes = request.POST['notes']

                #save results
                user.save()

                # send email to DCA approver once approved
                if is_muni:
                    #send email
                    #first find admin to approve
                    dca_admins = Profile.objects.exclude(is_active=False).exclude(username='admin').exclude(username='AnonymousUser').filter(groups__name='dca_administrators').order_by('last_name')

                    if dca_admins:
                        for dca_admin in dca_admins:
                            #actual email part
                            current_site = get_current_site(request)
                            subject = 'Account created on NJcoast'
                            message = render_to_string('muni_approved_email.html', {
                                'user': dca_admin.first_name+" "+dca_admin.last_name,
                                'domain': current_site.domain,
                                'municipality': user.njcusermeta.municipality.name,
                            })

                            #send it
                            try:
                                dca_admin.email_user(subject, message)
                            except:
                                pass

                # send email to user once approved by DCA
                if is_dca:
                    #actual email part
                    current_site = get_current_site(request)
                    subject = 'Account created on NJcoast'
                    message = render_to_string('dca_approved_email.html', {
                        'user': user.first_name+" "+user.last_name,
                        'domain': current_site.domain,
                        'municipality': user.njcusermeta.municipality.name,
                    })

                    #send it
                    try:
                        user.email_user(subject, message)
                    except:
                        pass

                #flag OK
                return JsonResponse({'updated': True})

        #~~~~update notes and role?~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        elif request.POST['action'] == 'update_role':
            #load user
            user = Profile.objects.get(username=request.POST['user'])

            #test we got them
            if user:
                print "Role update",user.username
                #set notes
                user.njcusermeta.notes = request.POST['notes']

                #role
                user.njcusermeta.role = NJCRole.objects.get(name=request.POST['role'])

                #save results
                user.save()

                #flag OK
                return JsonResponse({'updated': True})

        #~~~~update all?~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        elif request.POST['action'] == 'update_all':
            #load user
            user = Profile.objects.get(username=request.POST['user'])

            #test we got them
            if user:
                print "Update all",user.username, request.POST['role'], request.POST['municipality']

                #fields to update
                namesplit = request.POST['name'].rsplit(' ',1)
                if len(namesplit) == 2:
                    #print namesplit[0], ",", namesplit[1]
                    user.first_name = namesplit[0]
                    user.last_name = namesplit[1]

                #name
                user.email = request.POST['email']
                user.voice = request.POST['voice']
                user.njcusermeta.role = NJCRole.objects.get(name=request.POST['role'])
                user.njcusermeta.municipality = NJCMunicipality.objects.get(name=request.POST['municipality'])
                user.njcusermeta.address_line_1 = request.POST['address_line_1']
                user.njcusermeta.address_line_2 = request.POST['address_line_2']
                user.njcusermeta.city = request.POST['city']
                user.njcusermeta.zip = request.POST['zip']
                user.njcusermeta.position = request.POST['position']

                #save results
                user.save()

                #flag OK
                return JsonResponse({'updated': True})

        #~~~~update all?~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        elif request.POST['action'] == 'update_profile':
            #load user
            user = Profile.objects.get(username=request.POST['user'])

            #test we got them
            if user:
                print "Update profile",user.username

                #fields to update
                namesplit = request.POST['name'].rsplit(' ',1)
                if len(namesplit) == 2:
                    #print namesplit[0], ",", namesplit[1]
                    user.first_name = namesplit[0]
                    user.last_name = namesplit[1]

                #name
                user.email = request.POST['email']
                user.voice = request.POST['voice']
                user.njcusermeta.address_line_1 = request.POST['address_line_1']
                user.njcusermeta.address_line_2 = request.POST['address_line_2']
                user.njcusermeta.city = request.POST['city']
                user.njcusermeta.zip = request.POST['zip']
                user.njcusermeta.position = request.POST['position']

                #save results
                user.save()

                #flag OK
                return JsonResponse({'updated': True})

        #~~~~create muni admin?~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        elif request.POST['action'] == 'create_muni_admin':
            #check user not exist
            if Profile.objects.filter(username=request.POST['user']).exists():
                return JsonResponse({'updated': False, 'error': 'user exists'})

            #check email exists
            exist_count = Profile.objects.filter(email = request.POST['email']).count()
            if exist_count >= 1:
                return JsonResponse({'updated': False, 'error': 'email exists'})

            #generate random password
            password = Profile.objects.make_random_password()

            #create user
            user = Profile.objects.create_user(username=request.POST['user'],
                                 email=request.POST['email'],
                                 password=password)
            if user:
                print "Created", request.POST['user']

                #fields to update
                namesplit = request.POST['name'].rsplit(' ',1)
                if len(namesplit) == 2:
                    print namesplit[0], ",", namesplit[1]
                    user.first_name = namesplit[0]
                    user.last_name = namesplit[1]

                #populate
                user.voice = request.POST['voice']
                user.njcusermeta.role = NJCRole.objects.get(name=request.POST['role'])
                user.njcusermeta.municipality = NJCMunicipality.objects.get(name=request.POST['municipality'])
                user.njcusermeta.address_line_1 = request.POST['address_line_1']
                user.njcusermeta.address_line_2 = request.POST['address_line_2']
                user.njcusermeta.city = request.POST['city']
                user.njcusermeta.zip = request.POST['zip']
                user.njcusermeta.position = request.POST['position']
                user.njcusermeta.is_dca_approved = True
                user.njcusermeta.is_muni_approved = True
                user.njcusermeta.muni_approval_date = timezone.now()
                user.njcusermeta.dca_approval_date = timezone.now()

                #save updates
                user.save()

                #add user to group
                muni_admin_group = Group.objects.get(name='municipal_administrators')

                if muni_admin_group:
                    muni_admin_group.user_set.add(user)

                    #send email
                    current_site = get_current_site(request)
                    subject = 'Account created on NJcoast'
                    message = render_to_string('muni_admin_account_created_email.html', {
                        'user': request.POST['name'],
                        'username': user.username,
                        'domain': current_site.domain,
                        'password': password,
                        'municipality': user.njcusermeta.municipality.name,
                    })

                    #actual send
                    try:
                        user.email_user(subject, message)
                    except:
                        pass

                    #email = EmailMessage(subject, message, to=[request.POST['email']])
                    #email.send()

                    #flag OK
                    return JsonResponse({'updated': True})
                else:
                    #flag error
                    return JsonResponse({'updated': False})

        #~~~~create dca admin?~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        elif request.POST['action'] == 'create_dca_admin':
            #check user not exist
            if Profile.objects.filter(username=request.POST['user']).exists():
                return JsonResponse({'updated': False, 'error': 'user exists'})

            #check email exists
            exist_count = Profile.objects.filter(email = request.POST['email']).count()
            if exist_count >= 1:
                return JsonResponse({'updated': False, 'error': 'email exists'})

            #generate random password
            password = Profile.objects.make_random_password()

            #create user
            user = Profile.objects.create_user(username=request.POST['user'],
                                 email=request.POST['email'],
                                 password=password)
            if user:
                print "Created", request.POST['user']

                #fields to update
                namesplit = request.POST['name'].rsplit(' ',1)
                if len(namesplit) == 2:
                    print namesplit[0], ",", namesplit[1]
                    user.first_name = namesplit[0]
                    user.last_name = namesplit[1]

                #populate
                user.voice = request.POST['voice']
                user.njcusermeta.role = NJCRole.objects.get(name=request.POST['role'])
                user.njcusermeta.municipality = NJCMunicipality.objects.get(name=request.POST['municipality'])
                user.njcusermeta.address_line_1 = request.POST['address_line_1']
                user.njcusermeta.address_line_2 = request.POST['address_line_2']
                user.njcusermeta.city = request.POST['city']
                user.njcusermeta.zip = request.POST['zip']
                user.njcusermeta.position = request.POST['position']
                user.njcusermeta.is_dca_approved = True
                user.njcusermeta.is_muni_approved = True
                user.njcusermeta.muni_approval_date = timezone.now()
                user.njcusermeta.dca_approval_date = timezone.now()

                #save updates
                user.save()

                #add user to group
                dca_admin_group = Group.objects.get(name='dca_administrators')

                if dca_admin_group:
                    dca_admin_group.user_set.add(user)

                    #send email
                    current_site = get_current_site(request)
                    subject = 'Account created on NJcoast'
                    message = render_to_string('dca_admin_account_created_email.html', {
                        'user': request.POST['name'],
                        'username': user.username,
                        'domain': current_site.domain,
                        'password': password,
                    })

                    #actual send
                    try:
                        user.email_user(subject, message)
                    except:
                        pass

                    #flag OK
                    return JsonResponse({'updated': True})
                else:
                    #flag error
                    return JsonResponse({'updated': False})

        #~~~~decline?~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        elif request.POST['action'] == 'decline':
            #load user
            user = Profile.objects.get(username=request.POST['user'])

            #test we got them
            if user:
                print "Decline",user.username
                #set notes
                user.njcusermeta.notes = request.POST['notes']

                #set dca approved/is_muni_approved, with not active this means INACTIVE
                user.njcusermeta.is_dca_approved = True
                user.njcusermeta.is_muni_approved = True

                #save results
                user.save()

                #send email to tell user our decision
                current_site = get_current_site(request)
                subject = 'Account rejected for NJcoast'
                message = render_to_string('account_rejected_email.html', {
                    'user': user.first_name+" "+user.last_name,
                    'municipality': user.njcusermeta.municipality.name,
                    'notes': user.njcusermeta.notes,
                })

                #actual send
                try:
                    user.email_user(subject, message)
                except:
                    pass

                #flag OK
                return JsonResponse({'updated': True})

        #delete?
        elif request.POST['action'] == 'delete':
            #load user
            user = Profile.objects.get(username=request.POST['user'])

            #test we got them
            if user:
                print "Delete",user.username

                user.is_active = False

                #save results
                user.save()

                #flag OK
                return JsonResponse({'updated': True})
        #~~~~Action not recognized~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        else:
            print "Action not recognized", request.POST['action']

        return JsonResponse({'updated': False})

'''
    Change password form
'''
def change_password(request):
    if request.method == 'POST':
        form = PasswordChangeForm(request.user, request.POST)
        if form.is_valid():
            user = form.save()
            update_session_auth_hash(request, user)  # Important!
            messages.success(request, 'Your password was successfully updated!')
            return redirect('dashboard')
        else:
            messages.error(request, 'Please correct the error below.')
    else:
        form = PasswordChangeForm(request.user)
    return render(request, 'change_password.html', {
        'form': form
    })
