
from django.conf import settings

class Secure (object):
  def process_response(self, request, response):
    if not settings.DEV and not request.is_secure():
      response['Strict-Transport-Security'] = 'max-age=15768000'
      
    return response
    