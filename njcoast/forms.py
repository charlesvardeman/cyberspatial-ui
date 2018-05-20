from django import forms
from geonode.people.forms import ProfileCreationForm
from geonode.people.models import Profile
from django.contrib.auth.models import User

class SignUpForm(ProfileCreationForm):
    email = forms.EmailField(max_length=254, help_text='Required. Inform a valid email address.')
    municipality = forms.CharField(max_length=50, help_text='Enter municipality')

    class Meta:
        model = Profile
        fields = ('username', 'email', 'password1', 'password2', )
