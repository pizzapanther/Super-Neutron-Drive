from django import forms

from account.models import User

class SignUpForm (forms.ModelForm):
  email = forms.EmailField(label="E-Mail")
  
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