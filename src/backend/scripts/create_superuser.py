import os
from django.contrib.auth import get_user_model
from accounts.fixtures.generate import USER_SET
import random, string

randomword = lambda len: ''.join(random.choice(list(string.ascii_uppercase)) for _ in range(len))

User = get_user_model()

DJANGO_SUPERUSER_USERNAME = os.environ.get('DJANGO_SUPERUSER_USERNAME')
DJANGO_SUPERUSER_EMAIL = os.environ.get('DJANGO_SUPERUSER_EMAIL')
DJANGO_SUPERUSER_PASSWORD = os.environ.get('DJANGO_SUPERUSER_PASSWORD')

if User.objects.filter(username=DJANGO_SUPERUSER_USERNAME).exists():
    print("Superuser is already initialized!")
else:
    print("Initializing superuser...")
    try:
        superuser = User.objects.create_superuser(
            username=DJANGO_SUPERUSER_USERNAME,
            email=DJANGO_SUPERUSER_EMAIL,
            password=DJANGO_SUPERUSER_PASSWORD,
            first_name= 'Admin',
            last_name= 'Admin'
            )
        superuser.save()
        print("Superuser initialized!")
    except Exception as e:
        print(e)

# Temporary user account generation for each type

def users_iterator():
    first_names = ['John', 'Jane', 'Bob', 'Alice', 'Mike', 'Marry', 'Tom', 'Jerry', 'Sally',]
    last_names = ['Smith', 'Doe', 'Brown', 'White', 'Black', 'Green', 'Blue', 'Red', 'Yellow',]
    
    for utype, num in USER_SET.items():
        for j in range(num):
            # uname = f'{randomword(4)}.{utype}' if j != 0 else utype
            uname = f'{utype}{j}'
            fname = random.choice(first_names)
            lname = random.choice(last_names)
            print(f'Creating users account for {uname}')
            is_superuser = utype == 'shopowner'
            user = User.objects.create_user(
            # user = User(
                is_staff=is_superuser,
                is_superuser=is_superuser,
                username=f'{uname}',
                email=f'{lname[0].lower()}_{fname.lower()}@example.com',
                first_name= f'{fname}',
                last_name= f'{lname}',
                role=utype,
                password=f'{utype}'
            )
            user.save()
            # yield user

if not User.objects.filter(username='shopowner').exists():
    users_iterator()
    # User.objects.bulk_create(iter(users_iterator()))