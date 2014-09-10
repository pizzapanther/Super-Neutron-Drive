#!/usr/bin/env python

import os
import json
import types
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
        
      if file == 'manifest.json':
        fh = open(path, 'r')
        manifest = json.loads(fh.read())
        fh.close()
        
        remove_perm = []
        for i in range(0, len(manifest['permissions'])):
          perm = manifest['permissions'][i]
          if type(perm) in types.StringTypes:
            if 'http://' in perm:
              remove_perm.append(perm)
              
        for perm in remove_perm:
          manifest['permissions'].remove(perm)
          
        del manifest['server_url']
        
        fh = open('/tmp/manifest.json', 'w')
        fh.write(json.dumps(manifest, indent=2))
        fh.close()
        
      else:
        ziplist += ' ' + path
        
  subprocess.call("rm ../super-neutron.zip", shell=True)
  subprocess.call("zip -r ../super-neutron.zip" + ziplist, shell=True)
  subprocess.call("zip -r ../super-neutron.zip -j /tmp/manifest.json", shell=True)
  subprocess.call("rm /tmp/manifest.json", shell=True)
  
  print("\nSo long and thanks for all the fish!")
  