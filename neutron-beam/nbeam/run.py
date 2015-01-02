#!/usr/bin/env python

from __future__ import print_function

import os
import sys
import json
import time
import errno
import logging
import signal
import begin

import nbeam.version
import nbeam.server

DEFAULT_CONFIG_PATH = os.path.join(os.environ['HOME'], '.config', 'neutron-beam')

DEFAULTS = {
  'config_dir': DEFAULT_CONFIG_PATH,
  'auto_reload': False,
  'api_key': None,
  'port': 32828,
  'foreground': False,
  'view_timeout': 30,
  'server': 'super.neutrondrive.com',
  'ssl': True,
  'code_dir': None,
  'username': None,
  'pid_file': None,
  'log_file': None,
  'encrypt': True,
  'allowed_files': None,
}

def LOAD_DEFAULTS ():
  config_dir = DEFAULTS['config_dir']
  if '--config-dir' in sys.argv:
    i = sys.argv.index('--config-dir')
    config_dir = sys.argv[i + 1]
    
  json_config = os.path.join(config_dir, 'config.json')
  if os.path.exists(json_config):
    fh = open(json_config, 'r')
    config = json.loads(fh.read())
    fh.close()
    
    for key, value in config.items():
      DEFAULTS[key] = value
      
LOAD_DEFAULTS()

def get_config (config_dir, **config):
  if not os.path.exists(config_dir):
    os.makedirs(config_dir)
    
  for key, value in DEFAULTS.items():
    if key not in config:
      config[key] = value
      
  json_config = os.path.join(config_dir, 'config.json')
  
  write = False
  if config['code_dir'] is None:
    config['code_dir'] = raw_input('Enter your code directory: ')
    write = True
    
  if config['username'] is None:
    config['username'] = raw_input('Enter your Neutron Drive username: ')
    write = True
    
  if config['api_key'] is None:
    config['api_key'] = raw_input('Enter your Beam API Key (Leave blank for no encryption): ')
    write = True
    
  if config['pid_file'] is None:
    config['pid_file'] = os.path.join(config_dir, 'nbeam.pid')
    write = True
    
  if config['log_file'] is None:
    config['log_file'] = os.path.join(config_dir, 'nbeam.log')
    write = True
    
  if config['allowed_files'] is None:
    config['allowed_files'] = ('\.(zip|js|json|css|less|map|txt|x?html?|pdf|wav|mp3|mp4|m4v|mov|webm|webp|gif|jpe?g|png|ttf|woff|eot|otf|ogg|ogv|bmp|xml|flv|swf|svg)$',)
    write = True
    
  if write or not os.path.exists(json_config):
    fh = open(json_config, 'w')
    fh.write(json.dumps(config, indent=2))
    fh.close()
    
  return config
  
@begin.subcommand
def version ():
  "Print Neutron Beam version"
  print("Version: {}".format(nbeam.__version__))
  
@begin.subcommand
@begin.convert(_automatic=True)
def start (
    config_dir=DEFAULTS['config_dir'],
    auto_reload=DEFAULTS['auto_reload'],
    port=DEFAULTS['port'],
    foreground=DEFAULTS['foreground'],
    view_timeout=DEFAULTS['view_timeout'],
    ssl=DEFAULTS['ssl'],
    server=DEFAULTS['server'],
    code_dir=DEFAULTS['code_dir'],
    username=DEFAULTS['username'],
    pid_file=DEFAULTS['pid_file'],
    log_file=DEFAULTS['log_file'],
    encrypt=DEFAULTS['encrypt'],
    api_key=DEFAULTS['api_key'],
  ):
  "Start Neutron Beam"
  
  config = get_config(
    config_dir,
    auto_reload=auto_reload,
    port=port,
    foreground=foreground,
    view_timeout=view_timeout,
    ssl=ssl,
    server=server,
    code_dir=code_dir,
    username=username,
    log_file=log_file,
    pid_file=pid_file,
    encrypt=encrypt,
    api_key=api_key,
  )
  
  if not config['foreground']:
    print("Starting Neutron Beam")
    
  nbeam.server.run(config)
  
def send_kill (pid):
  while is_running(pid):
    os.kill(pid, signal.SIGTERM)
    time.sleep(1)
    
def is_running (pid):
  try:
    os.kill(pid, 0)
    
  except OSError, err:
    if err.errno == errno.ESRCH:
      return False
      
    else:
      raise
    
  else:
    return True
    
def get_pid (config):
  try:
    fh = open(config['pid_file'], 'r')
    
  except:
    print("Error reading pid file: {}".format(config['pid_file']))
    sys.exit(1)
    
  else:
    pid = int(fh.read())
    return pid
    
@begin.subcommand
def stop (config_dir=DEFAULT_CONFIG_PATH, pid_file=DEFAULTS['pid_file']):
  "Stop Neutron Beam"
  
  config = get_config(config_dir, pid_file=pid_file)
  
  print('Stopping Neutron Beam ...')
  pid = get_pid(config)
  
  if not is_running(pid):
    print('Neutron Beam is not running')
    
  else:
    send_kill(pid)
    print('Neutron Beam Stopped')
    
@begin.subcommand
@begin.convert(_automatic=True)
def restart (
    config_dir=DEFAULTS['config_dir'],
    auto_reload=DEFAULTS['auto_reload'],
    port=DEFAULTS['port'],
    foreground=DEFAULTS['foreground'],
    view_timeout=DEFAULTS['view_timeout'],
    ssl=DEFAULTS['ssl'],
    server=DEFAULTS['server'],
    code_dir=DEFAULTS['code_dir'],
    username=DEFAULTS['username'],
    pid_file=DEFAULTS['pid_file'],
    log_file=DEFAULTS['log_file'],
    encrypt=DEFAULTS['encrypt'],
    api_key=DEFAULTS['api_key'],
  ):
  "Restart Neutron Beam"
  
  stop(config_dir)
  start(
    config_dir,
    auto_reload=auto_reload,
    port=port,
    foreground=foreground,
    view_timeout=view_timeout,
    ssl=ssl,
    server=server,
    code_dir=code_dir,
    username=username,
    log_file=log_file,
    pid_file=pid_file,
    encrypt=encrypt,
    api_key=api_key,
  )
  
@begin.subcommand
def config (config_dir=DEFAULT_CONFIG_PATH):
  "Print Neutron Beam configuration"
  
  config = get_config(config_dir)
  print(json.dumps(config, indent=2))
  
@begin.subcommand
def running (config_dir=DEFAULT_CONFIG_PATH, pid_file=DEFAULTS['pid_file']):
  "Print whether Neutron Beam is running"
  
  config = get_config(config_dir, pid_file=pid_file)
  
  pid = get_pid(config)
  
  if is_running(pid):
    print('Neutron Beam is running, pid: {}'.format(pid))
    
  else:
    print('Neutron Beam is not running.')
    
@begin.start
def main ():
  "Neutron Beam, a daemon to connect your development server to the Neutron Drive editor."
  