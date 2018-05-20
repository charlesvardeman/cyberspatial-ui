from django import forms
from geonode.people.forms import ProfileCreationForm
from geonode.people.models import Profile
from django.contrib.auth.models import User
from .models import NJCMunicipality

class SignUpForm(ProfileCreationForm):
    email = forms.EmailField(max_length=254, help_text='Required. Inform a valid email address.')
    municipality = forms.ModelChoiceField(queryset=NJCMunicipality.objects)

    class Meta:
        model = Profile
        fields = ('username', 'email', 'password1', 'password2', )
