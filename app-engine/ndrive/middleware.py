
from django import http
from django.conf import settings

class Secure (object):
  def process_response (self, request, response):
    if not settings.DEV and not request.is_secure():
      url = request.build_absolute_uri().replace('http://', 'https://')
      return http.HttpResponseRedirect(url)
      
    return response
    