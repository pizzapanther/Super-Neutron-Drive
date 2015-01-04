import os
import sys

from fabric.api import (
    run,
    sudo,
    cd,
    hosts,
    settings as fabric_settings
)
from fabric.operations import get, prompt, local
from fabric.contrib.project import rsync_project

WEB_USER = "www"
WEB_HOST = 'super.neutrondrive.com'

@hosts(WEB_HOST)
def deploy():
  with cd('/home/www/Super-Neutron-Drive/'):
    sudo('git pull', user=WEB_USER)
    sudo('git submodule update', user=WEB_USER)
    
  with cd('/home/www/Super-Neutron-Drive/server/'):
    sudo('git rev-parse --short HEAD > release.txt', user=WEB_USER)
    sudo('su -c "pip install -r requirements.txt --user" {}'.format(WEB_USER))
    sudo('su -c "./manage.py migrate" {}'.format(WEB_USER))
    sudo('su -c "./manage.py collectstatic --noinput" {}'.format(WEB_USER))
    sudo('su -c "lessc /var/www/html/static/css/main.less /var/www/html/static/css/main.css" {}'.format(WEB_USER))
    
  sudo('supervisorctl restart snd')
  
@hosts(WEB_HOST)
def upgrade ():
  sudo('apt-get update')
  sudo('apt-get upgrade -y')
  sudo('reboot')
  