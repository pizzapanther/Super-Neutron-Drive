from django.conf import settings

def site_context (request):
  c = {
    'site_name': settings.SITE_NAME
  }
  
  return c
  