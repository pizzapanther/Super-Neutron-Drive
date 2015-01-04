from django import forms
from django.db.models import Q

from account.models import User

class SignUpForm (forms.ModelForm):
  cont = forms.CharField(widget=forms.HiddenInput, required=False)
  
  class Meta:
    model = User
    fields = (
      'username',
      'email',
      'password',
      'newsletter',
    )
    widgets = {
      'password': forms.PasswordInput(),
    }
    
class ResetForm (forms.Form):
  username = forms.CharField()
  
  def clean (self):
    cleaned_data = super(ResetForm, self).clean()
    
    if 'username' in cleaned_data:
      username = cleaned_data['username']
      qs = User.objects.filter(Q(username__iexact=username) | Q(email__iexact=username))
      if qs.count() == 0:
        raise forms.ValidationError("Username/E-Mail \"{}\" is not found.".format(username))
        
      else:
        cleaned_data['qs'] = qs
        
    return cleaned_data
    
class PasswordForm (forms.Form):
  token = forms.CharField(widget=forms.HiddenInput)
  email = forms.EmailField(widget=forms.HiddenInput)
  
  new_password = forms.CharField(label='New Password', widget=forms.PasswordInput, max_length=128)
  confirm = forms.CharField(label='Confirm Password', widget=forms.PasswordInput, max_length=128)
  
  def clean (self):
    cleaned_data = super(PasswordForm, self).clean()
    
    if 'new_password' in cleaned_data and 'confirm' in cleaned_data:
      if cleaned_data['new_password'] != cleaned_data['confirm']:
        raise forms.ValidationError("Passwords do not match")
        
    return cleaned_data
    