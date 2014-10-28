from django.contrib import admin

from .models import BeamApiKey, EKey

class BAdmin (admin.ModelAdmin):
  list_display = ('beam', 'user', 'generated')
  date_hierarchy = 'generated'
  raw_id_fields = ('user',)
  
  autocomplete_lookup_fields = {'fk': ['user']}
  
class EAdmin (admin.ModelAdmin):
  list_display = ('beam', 'user', 'created')
  date_hierarchy = 'created'
  raw_id_fields = ('user',)
  
  autocomplete_lookup_fields = {'fk': ['user']}
  
admin.site.register(EKey, EAdmin)
admin.site.register(BeamApiKey, BAdmin)
