# Create your models here.
from django.db import models
from django.conf import settings
from geonode.layers.models import Layer
from geonode.people.models import Profile

class NJCUserMeta(models.Model):
    user = models.OneToOneField(Profile)
    is_dca_approved = models.BooleanField(default=False)

class NJCMap(models.Model):
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
    )
    name = models.CharField(max_length=50)
    description = models.TextField(blank=True)
    settings = models.TextField(blank=True)
    shared_with = models.TextField(blank=True)
    # layers = models.ManyToManyField(Layer, blank=True)
    is_default = models.BooleanField(default=False)

    def __str__(self):
        return self.name

class NJCMapAnnotation(models.Model):
    leaflet_id = models.CharField(max_length=50)
    type = models.CharField(max_length=50)
    text = models.TextField(blank=True, null=True)
    data = models.TextField()
    map = models.ForeignKey(NJCMap, on_delete=models.CASCADE)
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        blank=True,
        null=True
    )

    def __str__(self):
        return "%s - %s - %s" % (self.map, self.type, self.text)

class NJCMapExpert(models.Model):
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        blank=True,
        null=True
    )
    sim_id = models.CharField(max_length=20)
    user_id = models.CharField(max_length=10)
    catagory = models.CharField(max_length=20, blank=True)
    type = models.CharField(max_length=20, blank=True)
    user_name = models.TextField(blank=True)
    description = models.TextField(blank=True)
    data = models.TextField(blank=True)
    modified    = models.DateTimeField()

    def __str__(self):
        return self.sim_id

class NJCMunicipality(models.Model):
    name = models.CharField(max_length=20)
    home_latitude = models.CharField(max_length=20)
    home_longitude = models.CharField(max_length=20)
    zoom_level = models.PositiveIntegerField()

    def __str__(self):
        return self.name
