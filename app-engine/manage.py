#!/usr/bin/env python

import re
import os
import sys
import subprocess

def do_manage (command=None, dev=True):
  os.environ.setdefault("DJANGO_SETTINGS_MODULE", "ndrive.settings")
  import fix_path
  
  if dev:
    os.environ["DBENV"] = "Dev"
    
  else:
    os.environ["DBENV"] = "Prod"
    
  pipe = subprocess.Popen("gcloud info", shell=True, stdout=subprocess.PIPE).stdout
  output = pipe.read()
  
  root_re = re.search("Installation Root: \[(.*)\]", output)
  if root_re:
    path = root_re.group(1)
    
    sys.path.insert(0, os.path.join(path, 'platform', 'google_appengine'))
    
  else:
    print("Can't find App Engine, is gcloud installed?")
    sys.exit(1)
    
  from django.core.management import execute_from_command_line
  
  if command:
    execute_from_command_line(command.split(' '))
    
  else:
    execute_from_command_line(sys.argv)
    
if __name__ == "__main__":
  do_manage(dev=True)
  