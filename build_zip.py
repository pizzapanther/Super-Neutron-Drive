#!/usr/bin/env python

import os
import json
import subprocess

exclude_files = ()
exclude_dirs = ()

if __name__ == "__main__":
  os.chdir('chrome-app')
  
  print("Generating extension in super-neutron.zip\n")
  
  ziplist = ''
  for root, dirs, files in os.walk('./'):
    for file in files:
      skip = False
      path = os.path.join(root, file)
      
      if file in exclude_files:
        skip = True
        
      for d in exclude_dirs:
        if '/' + d + '/' in path:
          skip = True
          
      if skip:
        continue
        
      ziplist += ' ' + path
      
  subprocess.call("rm ../super-neutron.zip", shell=True)
  subprocess.call("zip -r ../super-neutron.zip" + ziplist, shell=True)
  
  print("\nSo long and thanks for all the fish!")
  