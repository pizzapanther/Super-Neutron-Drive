from django.db import models
from django.contrib.auth.models import AbstractUser

class User (AbstractUser):
  verified_email = models.EmailField('verified email address', null=True, blank=True)
  verified = models.BooleanField(default=False)
  newsletter = models.BooleanField('Subscribe to Newsletter', default=False)
  