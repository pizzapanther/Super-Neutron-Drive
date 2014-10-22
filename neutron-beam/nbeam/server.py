from __future__ import print_function

import os
import time
import signal
import logging
import multiprocessing

import daemon

import tornado.autoreload
from tornado.ioloop import IOLoop
from tornado.web import Application
from tornado.options import options
from tornado.log import enable_pretty_logging

import nbeam.handlers

def run (config):
  if config['foreground']:
    server(config)
    
  else:
    with daemon.DaemonContext():
      server(config)
      
def started (*args):
  logging.info('Neutron Beam Started')
  
def server (config):
  os.umask(022)
  
  fh = open(config['pid_file'], 'w')
  fh.write('{}'.format(os.getpid()))
  fh.close()
  
  options.logging = 'debug'
  if not config['foreground']:
    options.log_file_prefix = str(config['log_file'])
    
  enable_pretty_logging(options=options)
  
  app = Application([
    #(r"/\S+/public/(.*)", StaticHandler, {'path': config['dir']}),
    (r"/list/", nbeam.handlers.ListHandler),
    (r"/file/", nbeam.handlers.FileHandler),
  ])
  
  app.config = config
  app.listen(config['port'])
  
  if config['auto_reload']:
    tornado.autoreload.start()
    
    w = None
    class reload_hook (object):
      def __init__ (self, w):
        self.w = w
        
      def run (self):
        pass
        #self.w.terminate()
        
    tornado.autoreload.add_reload_hook(reload_hook(w).run)
    
  def stopme (s, f):
    #w.terminate()
    loop.stop()
    logging.info('Neutron Beam Stopped')
    
  loop = IOLoop.instance()
  signal.signal(signal.SIGTERM, stopme)
  
  loop.add_callback(started)
  try:
    loop.start()
    
  except (KeyboardInterrupt, SystemExit):
    #w.terminate()
    logging.info('Neutron Beam Stopped')
    
  finally:
    try:
      raise
      
    except:
      pass
      