#!/usr/bin/env python

import os
import subprocess

def run ():
  mydir = os.path.dirname(__file__)
  basedir = os.path.join(mydir, '..')
  os.chdir(basedir)
  
  if not os.path.exists('app-engine/lib'):
    os.makedirs('app-engine/lib')
    
  subprocess.call('rm -rf app-engine/lib/*', shell=True)
  subprocess.call('pip install -r app-engine/requirements.txt -t app-engine/lib', shell=True)
  os.chdir('pytz')
  subprocess.call('rm -rf pytz', shell=True)
  subprocess.call('./build.py all', shell=True)
  subprocess.call('mv pytz ../app-engine/lib/', shell=True)
  
if __name__ == "__main__":
  run()
  