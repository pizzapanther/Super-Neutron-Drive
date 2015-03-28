from django import template
from django import forms

register = template.Library()

@register.filter
def filterNone (value):
  if value is None:
    return ''
    
  return value
  
@register.simple_tag(takes_context=True)
def target (context):
  if 'target' in context:
    return ' target="{}" '.format(context['target'])
    
  return ''
  
@register.filter
def isCheckbox (field):
  if isinstance(field.field, forms.BooleanField):
    return True
    
  return False
  
@register.filter
def isPassword (field):
  if isinstance(field.field.widget, forms.PasswordInput):
    return True
    
  return False
  
@register.filter
def isTextArea (field):
  if isinstance(field.field.widget, forms.Textarea):
    return True
    
  return False
  
@register.filter
def dollars (value):
  return value / 100
  