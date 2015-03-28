from django import forms

class NameForm (forms.Form):
  name = forms.CharField(max_length=30)
  
class SupportForm (forms.Form):
  email = forms.EmailField()
  request = forms.CharField(max_length=1500, widget=forms.Textarea)
  