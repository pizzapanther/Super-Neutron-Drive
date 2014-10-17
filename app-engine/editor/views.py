from django.template.response import TemplateResponse

from .forms import LoginForm

def login_view (request):
  form = LoginForm(request.POST or None)
  if request.POST:
    if form.is_valid():
      pass
      #create token and redirect
      
  context = {
    'form': form
  }
  return TemplateResponse(request, 'editor/login.html', context)
  