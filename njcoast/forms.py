from django import forms
from geonode.people.forms import ProfileCreationForm
from geonode.people.models import Profile
from django.contrib.auth.models import User
from .models import NJCMunicipality, NJCRole

class SignUpForm(ProfileCreationForm):
    email = forms.EmailField(max_length=254, help_text='Required. Inform a valid email address.')
    first_name = forms.CharField(max_length=30, required=True, help_text='Required.')
    last_name = forms.CharField(max_length=30, required=True, help_text='Required.')
    municipality = forms.ModelChoiceField(queryset=NJCMunicipality.objects)
    role = forms.ModelChoiceField(queryset=NJCRole.objects)
    justification = forms.CharField(widget=forms.Textarea(attrs={'cols' : "25", 'rows': "2", }),max_length=254, help_text='Required. Please write a justification for your request.')
    position = forms.CharField(max_length=80, help_text='Required. Please describe your position.')

    class Meta:
        model = Profile
        fields = ('username', 'first_name', 'last_name', 'email', 'password1', 'password2', 'municipality', 'role', 'justification', 'position', )
