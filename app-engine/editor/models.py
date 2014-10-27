import base64

from django.db import models
from django.utils.crypto import get_random_string

class BeamApiKey (models.Model):
  user = models.ForeignKey('account.User')
  beam = models.CharField(max_length=255)
  akey = models.CharField(max_length=255)
  
  generated = models.DateTimeField(auto_now=True)
  
  class Meta:
    unique_together = (('user', 'akey'),)
    verbose_name = 'Beam API Key'
    
  def __unicode__ (self):
    return self.beam
    
  @staticmethod
  def get_or_create (user, beam):
    try:
      return BeamApiKey.objects.get(user=user, beam=beam)
      
    except BeamApiKey.DoesNotExist:
      bkey = BeamApiKey(user=user, beam=beam, akey=BeamApiKey.gen_key())
      bkey.save()
      
      return bkey
      
  @staticmethod
  def gen_key ():
    chars = 'abcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*(-_=+)'
    akey = get_random_string(50, chars)
    akey = base64.urlsafe_b64encode(akey)
    return akey
    
  def regen (self):
    self.akey = BeamApiKey.gen_key()
    self.save()
    