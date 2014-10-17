from django.conf import settings
from django.db import models
from django.contrib.auth.models import AbstractUser

import jwt

class User (AbstractUser):
  verified_email = models.EmailField('verified email address', null=True, blank=True)
  verified = models.BooleanField(default=False)
  newsletter = models.BooleanField('Subscribe to Newsletter', default=False)
  
  def chrome_token (self, session):
    return jwt.encode({'session': session.session_key}, settings.SECRET_KEY)
    