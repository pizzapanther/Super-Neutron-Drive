import os
import json
import hashlib

from tornado.web import RequestHandler, StaticFileHandler, HTTPError
from tornado.escape import json_encode, json_decode

import nbeam.version

class NeutronHandler (RequestHandler):
  def __init__ (self, *args, **kwargs):
    self.config = args[0].config
    super(NeutronHandler, self).__init__(*args, **kwargs)
    
  def options (self):
    self.set_header('Access-Control-Allow-Origin', '*')
    self.set_header('Access-Control-Allow-Headers', 'Content-Type')
    
    methods = ['OPTIONS']
    for m in ('post', 'get', 'put', 'delete'):
      if hasattr(self, m):
        methods.append(m.upper())
        
    self.set_header('Access-Control-Allow-Methods', ", ".join(methods))
    
  def start_request (self):
    self.set_header('Content-Type', 'application/json')
    self.set_header('Access-Control-Allow-Origin', '*')
    self.set_header('Neutron-Beam-Version', nbeam.version.__version__)
    
    self.data = {'status': 'invalid-request'}
    
  def get_headers (self):
    self.set_header('Cache-Control', 'no-cache, no-store, must-revalidate')
    self.set_header('Pragma', 'no-cache')
    self.set_header('Expires', '0')
    
  def finish_request (self):
    j = json_encode(self.data)
    self.write(j)
    self.finish()
    
  def valid_request (self):
    body = self.request.body
    if self.config['encrypt']:
      body = self.decrypt(body)
      
    try:
      self.json = json.loads(body)
      
    except ValueError:
      self.json = {}
      
    self.get_path()
    if self.path.startswith(self.config['code_dir']):
      return True
      
    else:
      self.data = {'status': 'invalid-path'}
      return False
      
    return False
    
  def decrypt (self, body):
    raise Exception("Not Implemented")
    
  def hashstr (self, path):
    return 'nbeam-' + hashlib.sha256(path).hexdigest()
    
  def get_path (self):
    if 'path' in self.json:
      path = os.path.normpath(os.path.join(self.config['code_dir'], self.json['path']))
      basedir = self.json['path']
      
    else:
      path = os.path.normpath(self.config['code_dir'])
      basedir = ''
      
    self.path = path
    self.basedir = basedir
    
class PostMixin (object):
  def post (self):
    self.start_request()
    if self.valid_request():
      self.post_request()
      
    self.finish_request()
    