
# fastapi_app/django_setup.py
import os
import django
import warnings
warnings.filterwarnings("ignore", category=RuntimeWarning, module="django.db.models.base")

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "my_project.settings")  
# replace `my_project` with your actual Django project folder name

django.setup()