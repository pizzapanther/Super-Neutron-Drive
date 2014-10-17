from django import template

register = template.Library()

@register.filter
def filterNone (value):
  if value is None:
    return ''
    
  return value
  
@register.simple_tag(takes_context=True)
def target (context):
  if 'target' in context:
    return ' target="{}"'.format(context['target'])
    
  return ''
  