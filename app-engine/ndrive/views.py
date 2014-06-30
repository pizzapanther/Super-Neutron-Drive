from django import http

def hello (request):
  return http.HttpResponse("Hello", content_type="text/plain")
  