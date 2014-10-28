import base64
import urllib
import logging
import types

import requests

from django.conf import settings
from django.template.loader import render_to_string

EMAIL_STYLE = {
  'headerBg': '#e6e6e6'
}

class MailError (Exception):
  pass
  
def email_context (context):
  context.setdefault('site_name', settings.SITE_NAME)
  
  if 'request' in context and 'scheme' not in context:
    context['scheme'] = 'http'
    if context['request'].is_secure():
      context['scheme'] = 'https'
      
  if 'request' in context:
    abs_base_url = '{}://{}'.format(context['scheme'], context['request'].get_host())
    
  else:
    abs_base_url = settings.BASE_URL
    
  context.setdefault('abs_base_url', abs_base_url)
  
  context.setdefault('style', EMAIL_STYLE)
  return context
  
def send_mail (subject, to, template, context={}, from_address=settings.DEFAULT_FROM):
  context = email_context(context)
  text = render_to_string(template + '.txt', context)
  html = render_to_string(template + '.html', context)
  
  if type(to) not in (types.TupleType, types.ListType):
    to = [to]
    
  data = {
    'from': from_address,
    'subject': subject.format(**context),
    'to': ','.join(to),
    'text': text,
    'html': html,
  }
  
  if settings.DEV:
    data['to'] = settings.DEV_EMAIL
    data['subject'] = '[Dev] ' + data['subject']
    
  result = requests.post(
    'https://api.mailgun.net/v2/neutrondrive.com/messages',
    data=data,
    auth=('api', settings.MAILGUN),
    timeout=20
  )
  
  if result.status_code == 200:
    return result.text
    
  logging.error(result.text)
  raise MailError('Mail API Error: {}'.format(result.status_code))
  