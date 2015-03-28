from django.contrib import admin

from .models import Feature

class FeatureAdmin (admin.ModelAdmin):
  list_display = ('title', 'desc', 'approved', 'closed', 'created')
  list_filter = ('approved', 'closed')
  search_fields = ('creator__email',)
  date_hierarchy = 'created'
  raw_id_fields = ('creator',)
  
  autocomplete_lookup_fields = {'fk': ['creator']}
  
admin.site.register(Feature, FeatureAdmin)
