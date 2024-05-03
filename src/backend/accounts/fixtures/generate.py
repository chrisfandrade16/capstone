import json, secrets
import random
from datetime import datetime


USER_SET = {
    'shopowner': 6,
    'employee': 8,
    'customer': 10
    }

FIELD_SET= {
    'shopowner': ['earnings'],
    'employee': ['salary'],
    'customer': ['payment_id']
    }

profiles = [{
    "model": "accounts.profile",
    "pk": 1,
    "fields": {
        "created_at": datetime.now().isoformat()[:-3]+'Z', #"2022-10-19T00:17:40.779Z",
        "user": 1,
        "phone": "123-134-1245",
    }
}]
count = 2
for u, num in USER_SET.items():
    for _ in range(num):
        profiles += [{
            "model": "accounts.profile",
            "pk": count,
            "fields": {
                "created_at": datetime.now().isoformat()[:-3]+'Z', #"2022-10-19T00:17:40.779Z",
                "user": count,
                "phone": "123-134-1245",
            }
        }]
        count += 1

count = 2
for u, num in USER_SET.items():
    for _ in range(num):
        profiles += [{
            'model': f'accounts.{u}',
            'pk': count,
            'fields':{
                k: 0 if not k.endswith('id') else 'null' for k in FIELD_SET[u]
            }
        }]
        count += 1

profiles += [{
    "model": "accounts.customer",
    "pk": 1,
    "fields": {FIELD_SET['customer'][0]:'null'}
}]

if __name__ == '__main__':
    with open('profiles.json', 'w') as f:
        f.write(json.dumps(profiles, indent=2))
