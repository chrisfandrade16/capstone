from django.contrib import admin
from . import models as m
from . import agenda as a

# Register your models here.

admin.site.register(m.Shop)
admin.site.register(m.ShopService)
admin.site.register(m.Service)
admin.site.register(m.Quote)
admin.site.register(m.Vehicle)
admin.site.register(m.QuoteRequest)
admin.site.register(m.Notification)
admin.site.register(m.Appointment)
admin.site.register(m.WorkOrder)
admin.site.register(m.Message)
admin.site.register(m.Conversation)
admin.site.register(m.ImageQuote)
admin.site.register(a.EmployeeAvailability)
admin.site.register(a.EmployeeReservation)
admin.site.register(a.EmployeeTimeSlot)
admin.site.register(a.WorkBayAvailability)
admin.site.register(a.WorkBayReservation)
admin.site.register(a.WorkBayTimeSlot)
