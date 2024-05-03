from collections import defaultdict
import json
import random
from base64 import b64decode
from datetime import datetime, timedelta
import uuid
from string import ascii_uppercase

SHOP_SERVICES = 66
SHOPS = 6
QUOTES=15
VEHICLES=30

IDX_START = 2

lorem = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus eu faucibus leo, quis consectetur turpis. Proin lobortis sem ligula, quis varius massa dapibus quis. Curabitur ac egestas nibh, et lobortis magna. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce sed neque nec purus posuere fermentum. Phasellus facilisis non ipsum at hendrerit. Cras porta, magna sit amet convallis mollis, mi nulla congue diam, non auctor neque ante non tortor. In eu sagittis lorem. Sed pharetra fermentum tempor. Ut luctus turpis laoreet porta tristique. Praesent scelerisque pellentesque est, a cursus magna faucibus non. Donec tempus lorem id neque sollicitudin, commodo venenatis massa maximus. Vestibulum lacinia libero et est scelerisque sollicitudin. In hac habitasse platea dictumst. Fusce pretium neque sem, nec venenatis nibh cursus sed.'.split(
    ' ')
with open('services.json', 'r') as f:
    services = json.load(f)
service_ids = [s['pk'] for s in services]

with open('../../accounts/fixtures/profiles.json') as f:
    accounts_data = json.load(f)
    employee_ids = [e['pk']
                    for e in accounts_data if e['model'] == 'accounts.employee']
    customer_ids = [e['pk']
                    for e in accounts_data if e['model'] == 'accounts.customer']
    owner_ids = [e['pk']
                 for e in accounts_data if e['model'] == 'accounts.shopowner']

def generate_shop_services():
    shop_services = []
    for i in range(1, SHOP_SERVICES+1):
        t = {
            "model": "shop.shopservice",
            'pk': i,
            'fields': {
                'service': random.randint(min(service_ids), max(service_ids)),
                'price': random.randint(50, 2500),
                'est_time': f'{random.randint(0,2):02}:{random.randint(5,60):02}:00'
            }}
        shop_services.append(t)

    with open('shop_services.json', 'w') as f:
        f.write(json.dumps(shop_services, indent=2))


def generate_shops():
    shop_names = json.loads(b64decode(b'WyJNYXN0ZXIgTWVjaGFuaWMiLCAiVGhlIEF1dG8gQ2xpbmljIiwgIk1lY2hhbmljIG9uIENhbGwiLCAiTWVjaGFuaWMgSHViIiwgIk1lY2hhbmljIENlbnRyYWwiLCAiWmlwIFpvb20gTW9iaWxlIE1lY2hhbmljIiwgIlRoZSBIb25lc3QgTWVjaGFuaWMiLCAiQWNlIE1lY2hhbmljIiwgIkZhc3QgTGFuZSBNZWNoYW5pY3MiLCAiTXIuIE1lY2hhbmljIiwgIkFjZSBBdXRvIFdvcmtzIiwgIkF1dG9Qcm8iLCAiQXV0byBFeHByZXNzIiwgIkFjY3VyYXRlIEF1dG8iLCAiQXdlc29tZSBBdXRvbW90aXZlIiwgIk1vdG9yIE1lY2hhbmljIFdvcmtzaG9wIiwgIkF1dG8gQ2xpbmljIiwgIk1pZGFzIFRvdWNoIEF1dG8gU2hvcCIsICJGYXN0IExhbmVzIiwgIkF1dG8gV29ya3MiLCAiQW55dGltZSBBbnl3aGVyZSBHYXJhZ2UiLCAiQWR2YW5jZSBBdXRvIFpvbmUiLCAiSGlnaC1QZXJmb3JtYW5jZSBHYXJhZ2UiLCAiTWVjaGFuaWNcdTIwMTlzIFdvcmtzaG9wIiwgIkFibGUgQXV0byBSZXBhaXIiLCAiWW91ciBNZWNoYW5pYyBOb3chIiwgIkF1dG9tb3RpdmUgRWxlY3RyaWNpYW4iLCAiQWZ0ZXJtYXJrZXQgQ2FyIEVuZ2luZSBDb21wYW55IiwgIlNlbWkgVHJ1Y2sgTWVjaGFuaWNzIiwgIkNhciBGaXggVXAgU2hvcCIsICJBbWVyaWNhbiBBdXRvIE1lY2hhbmljcyBJbmMiLCAiQSZNIEF1dG8tQ2VudHJlIiwgIkFBQSBBdXRvbW90aXZlIFNvbHV0aW9ucyIsICJKaWZmeSBDYXIgQ2FyZSBTZXJ2aWNlcyIsICJGYWlyIEZpeCBBdXRvIGFuZCBUcnVjayBSZXBhaXIiLCAiQWJzb2x1dGUgQXV0byBSZXBhaXIiLCAiQXV0byAyNCBIb3VyIFRvd2luZyBhbmQgUmVwYWlyIiwgIkJpZyBSZWQgQ2FyIFNlcnZpY2UiLCAiSSBGaXggQWxsIiwgIkFmZm9yZGFibGUgQXV0b21vdGl2ZSBTb2x1dGlvbnMiLCAiMTIzIEF1dG9tb3RpdmUgUmVwYWlyIFNob3AiLCAiQWZmb3JkYWJsZSBBdXRvIFJlcGFpciIsICJUcnVzdHdvcnRoeSBDYXIgUmVwYWlyIiwgIkNhciBFbGVjdHJpY2lhbnMgUGx1cyIsICJWYW4gQmF0dGVyeSBTcGVjaWFsaXN0cyIsICJNZWNoYW5pYyBpbiBBIE1pbnV0ZSBTZXJ2aWNlIEluYy4iLCAiUXVpY2sgU3RvcCBPaWx5IE1lY2hhbmljIFNob3AiLCAiUHJlc3RpZ2UgQXV0b21vYmlsZXMiLCAiTW90b3JjeWNsZSBNZWNoYW5pYyBTaG9wIiwgIk1vYmlsZSBNZWNoYW5pY3MgRGVwb3QgTHRkLiIsICJBbGwgSGFuZCBBdXRvIENhcmUiLCAiQ2hlY2sgJiBUdW5lIEF1dG9tb3RpdmUiLCAiU3VyZSBTdG9wIEF1dG8gUmVwYWlyIiwgIkFmZm9yZGFibGUgJiBSZWxpYWJsZSBBdXRvIFJlcGFpciIsICJBY2VzIEF1dG8gJiBUcnVjayBSZXBhaXIgSW5jIiwgIkxlYWtpbmcgRml4ZXJzIiwgIkF1dG8gQm9keSBXb3JrcyIsICJBZG1pdCBPbmUgQ2FyIENhcmUgQ2VudGVyIiwgIkZhc3QgTGFuZSBUcmFuc21pc3Npb24iLCAiQXV0byBXb3JrIE9ubGluZSIsICJBdXRvIFBybyBNb2JpbGUgTWVjaGFuaWMiLCAiQWxsIERheSBFbmdpbmUgQ2FyZSIsICJEcml2ZXdheSBNZWRpY3MiLCAiU3BlZWR5IFNlcnZpY2UgU3RhdGlvbiwgSW5jLiIsICJZb3VyIE1lY2hhbmljIiwgIkF1dG8gRG9jIiwgIkNhciBDYXJlIENsaW5pYyIsICJZb3VyIEJyYWtlcyBCaWxsIE1lY2hhbmljIEx0ZCIsICJGYXN0IEZpeCBBdXRvbW90aXZlIFJlcGFpciIsICJBQkMgTW90b3JjeWNsZSBSZXBhaXJzIiwgIkF1dG8gUmVwYWlyIFNlcnZpY2VzIiwgIkVaIFR1bmV1cCIsICI0IFdoZWVsIFBhcnRzICYgU2VydmljZSBDZW50ZXIiLCAiTWludXRlIFJlcGFpcnMiLCAiQXdlc29tZSBNb2JpbGUgTWVjaGFuaWNzIiwgIlRoZSBGYXN0IEZpeCIsICJNci4gU2FmZSBUaXJlIiwgIkNhciBUcmFuc21pc3Npb24gUmVwYWlyIFNob3AiLCAiSm9obm55cyBBdXRvIFJlcGFpciBTaG9wIiwgIlByb21wdCBWZWhpY2xlIFJlcGFpciIsICJBbGwgRmFzdCBNZWNoYW5pY3MiLCAiVHJpcGxlIGEgUm9hZHNpZGUgQXNzaXN0YW5jZSIsICJQYXRpZW50IENhciBSZXBhaXIgU2hvcCIsICJUaGUgVm9sdm8gUmVwYWlyIFdvcmtzIiwgIkFjdXJhIEF1dG8iLCAiQUFBIEdhcmFnZSBEb29yIFJlcGFpciIsICJBdXRvIEdsYXNzIFJlcGxhY2VtZW50IFNlcnZpY2UiLCAiQWNlIEF1dG9tb3RpdmUiLCAiU3BlZWR5IFNlcnZpY2UiLCAiRGFuaWVsXHUyMDE5cyBEaWFnbm9zdGljcyIsICJBd2Vzb21lIENhciBGaXhlciIsICJBY2UgQXV0byBDYXJlIE1lY2hhbmljIiwgIkJvYlx1MjAxOXMgQnJha2VzICYgVGlyZXMiLCAiQXV0byBSaWdodCBBY2UiLCAiQ2FybWF4IFJlcGFpciBDZW50cmUiLCAiQWNlIEF1dG8gUmVwYWlyIiwgIkExIEF1dG8gUmVwYWlyIFNlcnZpY2UiLCAiQWxsLVdoZWVsIEFsaWdubWVudCIsICJVLVR1cm4gTWVjaGFuaWNzIiwgIkNoYXJtaW5nIENhciBDYXJlIENlbnRlciJd'.decode('utf-8')))
    shop_addresses = ['1225 Brant Street Burlington L7P1X7 Canada', '290 Bremner Boulevard Toronto M5V3L9 Canada', '100 City Centre Drive Mississauga L5B2N5 Canada', '845 King Street West Hamilton L8S4S6 Canada', '1349 Main Street West Hamilton L8S4M7 Canada', '237 Barton Street East Hamilton L8L2X2 Canada']
    latitudes = [43.3442365,43.6425637,43.5927596,43.262646,43.2576568,43.26231265]
    longitudes = [-79.8206644,-79.38708718320467,-79.64343657271567,-79.899495,-79.9215867,-79.85543245514329]
    # owners = random.sample(range(1, ), SHOPS)
    owner_set = set(owner_ids)

    shops_fixture = [
        {
            "model": "shop.shop",
            "pk": i,
            "fields": {
                "name": random.sample(shop_names, 1)[0],
                "address": shop_addresses.pop(),
                "description": " ".join(random.sample(lorem, 10)),
                "email": f"{''.join(random.sample(lorem, 2))}@email.com",
                "phone": "123-452-1231",
                "owner": owner_set.pop(),
                "services": sorted(random.sample(list(range(1, SHOP_SERVICES+1)), random.randint(1,66))),
                "employees": random.sample(employee_ids, 4),          
                "latitude": latitudes.pop(),
                "longitude": longitudes.pop()
            }
        }
        for i in range(1, SHOPS+1)
    ]
    with open('shops.json', 'w') as f:
        f.write(json.dumps(shops_fixture, indent=2))


def generate_quote_requests():
    """
    [{
        "model": "shop.quoterequest", 
        "pk": 1, 
        "fields": {
            "customer": 5, 
            "description": "This is just a random description", 
            "vehicle": 1, 
            "created_at": "2022-11-13T18:22:09Z"
            }            
        }]
    """
    with open('vehicle.json') as f:
        vehicles = json.load(f)
        # vehicle and owner_id extracted
        vehicle_ids = {}
        for v in vehicles:
            if v['model'] == 'shop.vehicle':
                owner = v['fields']['owner']
                if owner in vehicle_ids:
                    vehicle_ids[owner].append(v['pk'])
                else:
                    vehicle_ids[owner] = [v['pk']]

    service_names = [s['fields']['name'] for s in services]
    customer_choices = [random.choice(customer_ids) for _ in range(QUOTES)]
    vehicle_choices = [random.choice(vehicle_ids[c]) for c in customer_choices]

    quote_requests_fixture = [
        {
            "model": "shop.quoterequest",
            "pk": i,
            "fields": {
                "customer": customer_choices[i-1],
                "description": random.choice(service_names),
                "vehicle": vehicle_choices[i-1],
            }
        }
        for i in range(1, QUOTES+1)
    ]
    with open('quoterequest.json', 'w') as f:
        f.write(json.dumps(quote_requests_fixture, indent=2))


def generate_quotes():
    """
    [{
        "model": "shop.quote", 
        "pk": 1, 
        "fields": {
            "shop": 2, 
            "customer": 4, 
            "status": "booked", 
            "priority": "low", 
            "buid": "2927af38-35bd-4e01-8282-79d30e1327ef", 
            "message": "this is a random message", 
            "preferred_date": "2022-11-13", 
            "created_at": "2022-11-13T08:59:22Z", 
            "vehicle": 9, 
            "services": [4]
            }
            }]
    """
    generate_quote_requests()
    quotes_fixture = [
        {
            "model": "shop.quote",
            "pk": i,
            "fields": {
                "shop": random.randint(1, SHOPS),
                "quote_request": random.randint(1, QUOTES),
                "status": random.choice(['pending', 'canceled', 'booked']),
                "priority": random.choice(['low', 'medium', 'high']),
                "buid": str(uuid.uuid4()),
                "message":  " ".join(random.sample(lorem, 10)),
                "created_at": datetime.now().isoformat()[:-3] + 'Z',
                # random.sample(list(range(1, SHOP_SERVICES+1)), random.randint(2,5)),
                "services": sorted(random.sample(list(range(1, SHOP_SERVICES+1)), random.randint(1,66))),
            }} 
        for i in range(1, QUOTES+1)
    ]
    with open('quotes.json', 'w') as f:
        f.write(json.dumps(quotes_fixture, indent=2))


def generate_vehicles():
    with open('makes_and_models.json') as f:
        data = json.load(f)

    makes = []
    models = []
    cust_vehicles = []
    j = 1
    for i, maker in enumerate(data, 1):
        name, slug = maker['make_name'], maker['make_slug']
        maker_models = maker['models']
        makes_obj = {
            "model": "shop.make",
            "pk": i,
            "fields": {
                "name": name,
                "slug": slug,
                "models": []
            }
        }
        for k, m in maker_models.items():
            if m['vehicle_type'] not in ('car', 'motorcycle', 'truck', 'bus', 'trailer'):
                continue
            model_obj = {
                "model": "shop.vehiclemodel",
                "pk": j,
                "fields": {
                    "name": m['model_name'],
                    "vehicle_type": m['vehicle_type'],
                    "years": str(m['years'])
                }
            }
            makes_obj['fields']['models'].append(j)
            models.append(model_obj)
            j += 1
        makes.append(makes_obj)

    make_ids = [x['pk'] for x in makes if x['fields']['models']]
    # for i in range(1, VEHICLES+1):
    customer_set = set(customer_ids)
    for i in range(1, len(customer_ids)+1):
        make = random.choice(make_ids)
        ml = makes[make-1]['fields']['models']
        # print(make, ml)
        model = random.choice(ml)
        cust_vehicles.append({
            "model": "shop.vehicle",
            "pk": i,
            "fields": {
                "make": make,
                "model": model,
                "year": random.randint(1980, 2022),
                'vin': "".join(random.sample(ascii_uppercase + '1234567890', 15)),
                'plate_number': f"{''.join(random.sample(ascii_uppercase + '1234567890', 4))} {''.join(random.sample(ascii_uppercase + '1234567890', 3))}",
                'owner': customer_set.pop(),
            }
        })
    for i in range(len(customer_ids)+1, VEHICLES+1):
        make = random.choice(make_ids)
        ml = makes[make-1]['fields']['models']
        # print(make, ml)
        model = random.choice(ml)
        cust_vehicles.append({
            "model": "shop.vehicle",
            "pk": i,
            "fields": {
                "make": make,
                "model": model,
                "year": random.randint(1980, 2022),
                'vin': "".join(random.sample(ascii_uppercase + '1234567890', 15)),
                'plate_number': f"{''.join(random.sample(ascii_uppercase + '1234567890', 4))} {''.join(random.sample(ascii_uppercase + '1234567890', 3))}",
                'owner': random.choice(customer_ids),
            }
        })
        
    vehicles = makes + models + cust_vehicles
    print(len(vehicles), len(makes), len(models), len(cust_vehicles))
    with open('vehicle.json', 'w') as f:
        json.dump(vehicles, f, indent=2)


def generate_services():
    with open('services_descriptions.json') as f:
        data = json.load(f)

    services = []
    i = 2
    for cat, svcs in data.items():
        print(cat, len(svcs))
        for s in svcs:
            services.append({
                'pk': i,
                'model': 'shop.service',
                'fields': s
            })
            i += 1
    with open('services_test.json', 'w') as f:
        json.dump(services, f, indent=2)


def generate_employee_availabilites():
    """
    [{"model": "shop.employeeavailability", "pk": 1, "fields": {"start_date": "2023-02-08", "start_time": "06:00:00", "end_time": "18:00:00",
                                                                "recurrence": "RRULE:FREQ=WEEKLY;COUNT=30", "created_at": "2023-02-08T07:17:13.770Z", "updated_at": "2023-02-08T07:17:13.770Z", "timezone": "Canada/Eastern", "employee": 5}}]
"""
    employee_availabilities = []
    count = 1
    for i in employee_ids:
        employee_availabilities.append({
            "model": "shop.employeeavailability",
            "pk": count,
            "fields": {
                "start_date": datetime.today().strftime('%Y-%m-%d'),
                "start_time": "06:00:00",
                "end_time": "18:00:00",
                "recurrence": "RRULE:FREQ=WEEKLY;COUNT=30",
                "created_at": datetime.now().isoformat()[:-3] + 'Z',
                "updated_at": datetime.now().isoformat()[:-3] + 'Z',
                "timezone": "Canada/Eastern",
                "employee": i
            }
        })
        count += 1

    reservation_ids = []
    for i in employee_ids:
        reserv_id =  str(uuid.uuid4())
        reservation_ids.append(reserv_id)
        employee_availabilities.append({
            "model": "shop.employeereservation",
            "pk": reserv_id,
            "fields": {
                "add_date": datetime.now().isoformat()[:-3] + 'Z',
                "edit_date": datetime.now().isoformat()[:-3] + 'Z',
                "duration": f"00:{random.randrange(10,59)}:00",
                "padding": "",
                "time": datetime.now().isoformat()[:-3] + 'Z',
                # "time2": (datetime.now() + timedelta(days=1)).isoformat()[:-3] + 'Z',
                "state": "UNC",
                "schedule": i
            }
        })


    for i, r in enumerate(reservation_ids, 1):
        appointment = {
            'model': 'shop.appointment',
            'pk': str(i),
            'fields': {
              "created_at": datetime.now().isoformat()[:-3] + 'Z',
              "quote": random.randrange(1, QUOTES+1), 
              "title": f"A job {i*'long '}"[:100],
              "description": "Stuff",
              "time_estimate": "01:00:00", 
              "price_estimate": str(random.randrange(100, 1000)), 
              "message": "Hello?", 
              "reservation": r
            }
        }
        employee_availabilities.append(appointment)

    with open('employee_availability.json', 'w') as f:
        json.dump(employee_availabilities, f, indent=2)


if __name__ == '__main__':
    # generate_services()
    # generate_vehicles()
    # generate_shops()
    # generate_shop_services()
    generate_quotes()
    generate_employee_availabilites()