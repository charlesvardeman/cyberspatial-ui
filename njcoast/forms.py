from django import forms
from geonode.people.forms import ProfileCreationForm
from geonode.people.models import Profile
from django.contrib.auth.models import User
from .models import NJCMunicipality, NJCRole

class SignUpForm(ProfileCreationForm):
    email = forms.EmailField(max_length=254, help_text='Required. Inform a valid email address.')
    municipality = forms.ModelChoiceField(queryset=NJCMunicipality.objects)
    role = forms.ModelChoiceField(queryset=NJCRole.objects)

    class Meta:
        model = Profile
        fields = ('username', 'email', 'password1', 'password2', 'municipality', 'role', )
