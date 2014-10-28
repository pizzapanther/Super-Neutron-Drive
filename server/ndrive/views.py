from django import http
from django.conf import settings
from django.template.response import TemplateResponse

def home (request):
  context = {}
  return TemplateResponse(request, 'pages/home.html', context)
  
def favicon (request):
  return http.HttpResponseRedirect('/static/favicon.png')
  
def gdrive_webview (request, index):
  return TemplateResponse(
    request,
    'gdrive_webview.html',
    {
      'index': index,
      'google_key': settings.GOOGLE_KEY,
      'google_client_id': settings.GOOGLE_CLIENT_ID,
    }
  )
  
def page_view (request, template=None):
  return TemplateResponse(request, template, {})
  