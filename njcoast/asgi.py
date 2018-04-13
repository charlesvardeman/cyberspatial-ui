"""
ASGI entrypoint. Configures Django and then runs the application
defined in the ASGI_APPLICATION setting.
"""

import os
import django
import channels.routing
print dir(channels.routing)
from channels.routing import get_default_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "njcoast.settings")
django.setup()
application = get_default_application()