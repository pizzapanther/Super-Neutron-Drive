#!/usr/bin/env python

import os
import socket
import subprocess

def run_gae ():
  basedir = os.path.dirname(__file__)
  os.chdir(basedir)
  
  kwargs = {
    'host': socket.getfqdn(),
  }
  
  #--enable_sendmail
  cmd = "dev_appserver.py --host {host} --port 8080 --admin_host {host} --admin_port 8888 app-engine/".format(**kwargs)
  status = subprocess.call(cmd, shell=True)
  
if __name__ == "__main__":
  run_gae()
  