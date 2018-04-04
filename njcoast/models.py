# Create your models here.
from django.db import models
from django.conf import settings
from geonode.layers.models import Layer

class NJCMap(models.Model):
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
    )
    name = models.CharField(max_length=50)
    description = models.TextField(blank=True)
    # layers = models.ManyToManyField(Layer, blank=True)
    is_default = models.BooleanField(default=False)

    def __str__(self):
        return self.name

class NJCMapAnnotation(models.Model):
    leaflet_id = models.CharField(max_length=50)
    type = models.CharField(max_length=50)
    text = models.CharField(max_length=250, blank=True, null=True)
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
    )
    sim_id = models.CharField(max_length=20)
    user_id = models.CharField(max_length=10)
    description = models.TextField(blank=True)
    data = models.TextField(blank=True)
    modified    = models.DateTimeField()

    def __str__(self):
        return self.sim_id
