#!/bin/sh
python manage.py wait_for_db
# python manage.py makemigrations
python manage.py migrate
python manage.py shell < scripts/create_superuser.py
python manage.py loaddata profiles services shop_services shops vehicle employee_availability quoterequest quotes 
python manage.py collectstatic --noinput