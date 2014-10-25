import os
import shutil
import base64

from nbeam.handlers import PostMixin, NeutronHandler
from nbeam.utils import is_text

class ListHandler (PostMixin, NeutronHandler):
  def post_request (self):
    dirs_only = 'dirs_only' in self.json and self.json['dirs_only']
    
    files = []
    dirs = []
    
    fdlist = os.listdir(self.path)
    fdlist.sort()
    for f in fdlist:
      fp = os.path.join(self.path, f)
      rp = os.path.join(self.basedir, f)
      
      if os.path.isdir(fp):
        dirs.append(dict(name=f, path=rp, id=self.hashstr(fp)))
        
      elif not dirs_only:
        files.append(dict(name=f, path=rp, id=self.hashstr(fp)))
        
    self.data = {
      'status': 'OK',
      'id': self.hashstr(self.path),
      'path': self.path,
      'name': os.path.basename(self.path),
      'files': files,
      'dirs': dirs,
    }
    
class FileHandler (PostMixin, NeutronHandler):
  def post_request (self):
    fh = open(self.path, 'rb')
    
    if is_text(fh.read(512)):
      fh.seek(0)
      
      self.data = {
        'status': 'OK',
        'path': self.path,
        'id': self.hashstr(self.path),
        'name': os.path.basename(self.path),
        'base64': base64.b64encode(fh.read())
      }
      
    else:
      self.data = {'status': 'binary-file'}
      
    fh.close()
    
class FileSaveHandler (PostMixin, NeutronHandler):
  def post_request (self):
    fh = open(self.path, 'w')
    
    content = base64.b64decode(self.json['base64'])
    fh.write(content)
    fh.close()
    
    self.data = {
      'status': 'OK',
      'path': self.path,
      'id': self.hashstr(self.path),
      'name': os.path.basename(self.path),
    }
    
class FileDeleteHandler (PostMixin, NeutronHandler):
  def post_request (self):
    if os.path.isdir(self.path):
      shutil.rmtree(self.path)
      
    else:
      os.remove(self.path)
      
    self.data = {
      'status': 'OK',
      'path': self.path,
      'id': self.hashstr(self.path),
      'name': os.path.basename(self.path),
    }
    
class FileNoobHandler (PostMixin, NeutronHandler):
  def post_request (self):
    name = self.json['name']
    fp = os.path.join(self.path, name)
    
    fp = os.path.normpath(fp)
    if fp.startswith(self.config['code_dir']) and not os.path.exists(fp):
      if self.json['dir']:
        os.mkdir(fp)
        
      else:
        fh = open(fp, 'w')
        fh.close()
        
      self.data = {
        'status': 'OK',
        'path': fp,
        'id': self.hashstr(fp),
        'name': name,
        'dir': self.json['dir']
      }
      
    else:
      self.data = {'status': 'invalid-path'}
      
class FileRenameHandler (PostMixin, NeutronHandler):
  def post_request (self):
    name = self.json['name']
    fp = os.path.join(os.path.dirname(self.path), name)
    
    fp = os.path.normpath(fp)
    if fp.startswith(self.config['code_dir']):
      shutil.move(self.path, fp)
      self.data = {
        'status': 'OK',
        'path': fp,
        'old_id': self.hashstr(self.path),
        'id': self.hashstr(fp),
        'name': name,
      }
      
    else:
      self.data = {'status': 'invalid-path'}
      