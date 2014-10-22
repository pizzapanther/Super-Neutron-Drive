import os
import json
import hashlib

from tornado.web import RequestHandler, StaticFileHandler, HTTPError
from tornado.escape import json_encode, json_decode

class NeutronHandler (RequestHandler):
  def __init__ (self, *args, **kwargs):
    self.config = args[0].config
    super(NeutronHandler, self).__init__(*args, **kwargs)
    
  def options (self):
    self.set_header('Access-Control-Allow-Origin', '*')
    self.set_header('Access-Control-Allow-Headers', 'X-CSRFToken')
    methods = ['OPTIONS']
    for m in ('post', 'get', 'put', 'delete'):
      if hasattr():
        methods.append(m.upper())
        
    self.set_header('Access-Control-Allow-Methods', ", ".join(methods))
    
  def start_request (self):
    self.set_header('Content-Type', 'application/json')
    self.set_header('Access-Control-Allow-Origin', '*')
    
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
      
    path, basedir = self.get_path()
    if path.startswith(self.config['code_dir']):
      return True
      
    else:
      self.data = {'status': 'invalid-path'}
      return False
      
    return False
    
  def decrypt (self, body):
    raise Exception("Not Implemented")
    
  def hashstr (self, path):
    return hashlib.sha256(path).hexdigest()
    
  def get_path (self):
    if 'path' in self.json:
      path = os.path.normpath(os.path.join(self.config['code_dir'], self.json['path']))
      basedir = self.json['path']
      
    else:
      path = os.path.normpath(self.config['code_dir'])
      basedir = ''
      
    return path, basedir
    
class ListHandler (NeutronHandler):
  def post (self):
    self.start_request()
    self.get_headers()
    if self.valid_request():
      path, basedir = self.get_path()
      
      dirs_only = 'dirs_only' in self.json and self.json['dirs_only']
      
      files = []
      dirs = []
      
      fdlist = os.listdir(path)
      fdlist.sort()
      for f in fdlist:
        fp = os.path.join(path, f)
        rp = os.path.join(basedir, f)
        
        if os.path.isdir(fp):
          dirs.append(dict(name=f, path=rp, id=self.hashstr(fp)))
          
        elif not dirs_only:
          files.append(dict(name=f, path=rp, id=self.hashstr(fp)))
          
      self.data = {
        'status': 'OK',
        'id': self.hashstr(path),
        'path': path,
        'files': files,
        'dirs': dirs,
      }
      
    self.finish_request()
    
class FileHandler (NeutronHandler):
  def post (self):
    self.start_request()
    self.get_headers()
    if self.valid_request():
      self.data = {'status': 'OK'}
      
    self.finish_request()
    