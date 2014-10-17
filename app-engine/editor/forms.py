from django import forms
from django.contrib.auth import authenticate

from account.models import User

class LoginForm (forms.ModelForm):
  def clean (self):
    cleaned_data = super(LoginForm, self).clean()
    
    user = None
    if 'username' in cleaned_data and 'password' in cleaned_data:
      user = authenticate(
        username=cleaned_data['username'],
        password=cleaned_data['password']
      )
      
    if user is not None:
      if not user.is_active:
        raise forms.ValidationError("Your account has been disabled. Login is not allowed.")
        
    else:
      raise forms.ValidationError("Your password or username does not match our records.")
      
    cleaned_data['user'] = user
    
    return cleaned_data
    
  class Meta:
    model = User
    fields = ('username', 'password')
    