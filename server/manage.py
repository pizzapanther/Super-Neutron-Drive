#!/usr/bin/env python

import re
import os
import sys
import subprocess

def do_manage (command=None, dev=True):
  os.environ.setdefault("DJANGO_SETTINGS_MODULE", "ndrive.settings")
  
  if dev:
    os.environ["DBENV"] = "Dev"
    
  else:
    os.environ["DBENV"] = "Prod"
    
  from django.core.management import execute_from_command_line
  
  if command:
    execute_from_command_line(command.split(' '))
    
  else:
    execute_from_command_line(sys.argv)
    
if __name__ == "__main__":
  do_manage(dev=True)
  