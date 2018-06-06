import logging

from django import template
from django.contrib.auth.models import Group

register = template.Library()
logger = logging.getLogger(__name__)

@register.filter(name='has_group')
def has_group(user, group_name):
    try:
        group =  Group.objects.get(name=group_name)
        return group in user.groups.all()
    except Group.DoesNotExist:
        logger.info("Attempted to test if missing group existed - %s", group_name)
        return False
