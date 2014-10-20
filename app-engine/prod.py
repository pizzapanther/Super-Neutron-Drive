#!/usr/bin/env python

from manage import do_manage

if __name__ == "__main__":
  while 1:
    ans = raw_input('Are you sure you want to run prod? [y/n] ')
    if ans.lower() in ('y' , 'n'):
      break
      
  if ans.lower() == 'y':
    do_manage(dev=False)
    