import os
import sys

from setuptools import setup, find_packages

my_dir = os.path.dirname(__file__)
versionpy = os.path.join('nbeam', 'version.py')

exec(open(versionpy).read())

setup(
    name = "neutron-beam",
    version = __version__,
    description = "Client to beam files to and from Super Neutron Drive.",
    url = "https://github.com/pizzapanther/Super-Neutron-Drive/tree/master/neutron-beam",
    author = "Paul Bailey",
    author_email = "paul@neutrondrive.com",
    license = "MIT",
    packages = ['nbeam'],
    install_requires = [
      'tornado==4.0.2',
      'begins==0.9',
      'python-daemon==1.5.5',
      'cryptography==0.6.1',
      'PyJWT==0.3.0',
      'pycrypto',
      'requests==2.4.3'
    ],
    entry_points = {
        "console_scripts": [
            "nbeam = nbeam.run:main.start",
        ],
    },
)