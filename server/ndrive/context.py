from django.conf import settings

def site_context (request):
  c = {
    'site_name': settings.SITE_NAME,
    'DEV': settings.DEBUG,
    'STRIPE_KEY': settings.STRIPE_KEY,
    'MEMBER_EMAIL': settings.MEMBER_EMAIL,
  }
  
  return c
  