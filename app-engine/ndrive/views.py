from django import http
from django.conf import settings
from django.template.response import TemplateResponse

def hello (request):
  return http.HttpResponse("Hello", content_type="text/plain")
  
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
  