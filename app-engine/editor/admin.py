from django.contrib import admin

from .models import BeamApiKey

class BAdmin (admin.ModelAdmin):
  list_display = ('beam', 'user', 'generated')
  date_hierarchy = 'generated'
  raw_id_fields = ('user',)
  
  autocomplete_lookup_fields = {'fk': ['user']}
  
admin.site.register(BeamApiKey, BAdmin)
