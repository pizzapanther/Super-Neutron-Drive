from django.db import models

class Feature (models.Model):
  creator = models.ForeignKey('account.User')
  
  title = models.CharField(max_length=120)
  desc = models.TextField('Description')
  
  approved = models.BooleanField(default=False)
  closed = models.BooleanField(default=False)
  
  votes = models.IntegerField(default=0)
  
  created = models.DateTimeField(auto_now_add=True)
  
  def __unicode__ (self):
    return self.title
    