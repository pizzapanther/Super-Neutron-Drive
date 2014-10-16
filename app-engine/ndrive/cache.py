import django.core.cache.backends.memcached as django_memcached

class MemcachedCache (django_memcached.MemcachedCache):
  def __init__ (self, server, params):
    from google.appengine.api import memcache
    
    django_memcached.BaseMemcachedCache.__init__(
      self,
      server,
      params,
      library=memcache,
      value_not_found_exception=ValueError
    )