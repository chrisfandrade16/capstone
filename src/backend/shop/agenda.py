from django.db import models
from django.utils.translation import gettext_lazy as _
from django_agenda.models import (AbstractAvailability,
                                  AbstractAvailabilityOccurrence,
                                  AbstractTimeSlot)
from django.core.exceptions import ValidationError
from django_agenda.models import AbstractBooking
from django_agenda.time_span import TimeSpan
from accounts.models import Employee, ShopOwner
from django.contrib.auth import get_user_model
from datetime import datetime, timedelta
from typing import List
from django.utils import timezone
from timezone_field import TimeZoneField
import uuid
import pytz

User = get_user_model()

class EmployeeAvailability(AbstractAvailability):
    timezone = TimeZoneField(default="EST")
    class AgendaMeta:
        verbose_name_plural = _("employee availabilities")
        schedule_model = Employee
        schedule_field = "employee"  # optional

    def __str__(self):
        return f"{self.employee}'s availability schedule"

    def get_timezone(self):
        # print(f'getting timezone for {self.employee} = {self.timezone}')
        if hasattr(self.timezone, 'localizer'):
            return self.timezone
        return pytz.timezone(str(self.timezone))


class EmployeeAvailabilityOccurrence(AbstractAvailabilityOccurrence):
    class AgendaMeta:
        availability_model = EmployeeAvailability
        schedule_model = Employee
        schedule_field = "employee"  # optional

class EmployeeTimeSlot(AbstractTimeSlot):
    class AgendaMeta:
        verbose_name_plural = _("employee timeslots")
        availability_model = EmployeeAvailability
        schedule_model = Employee
        booking_model = "EmployeeReservation" # booking class, more details shortly
        schedule_field = "employee"  # optional


class EmployeeReservation(AbstractBooking):
    class AgendaMeta:
        schedule_model = Employee
        schedule_field = "schedule"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4,editable=False)
    add_date = models.DateTimeField(auto_now_add=True)
    edit_date = models.DateTimeField(auto_now=True)

    duration = models.DurationField(default=timedelta(minutes=30))
    padding = models.DurationField(
        verbose_name=_("padding"), default=timedelta(minutes=0), blank=True
    )
    
    time = models.DateTimeField(
        verbose_name=_("primary time_slot"), blank=True, null=True, db_index=True
    )
    time_secondary = models.DateTimeField(
        verbose_name=_("secondary time_slot"), blank=True, null=True, db_index=True
    )

    STATE_UNCONFIRMED = "UNC"
    STATE_CONFIRMED = "CNF"
    STATE_DECLINED = "DCL"
    STATE_COMPLETED = "CMP"
    STATE_CANCELED = "CAN"
    # expired is for things that haven't been confirmed
    STATE_EXPIRED = "EXP"
    # missed means that it was confirmed, but nobody showed
    STATE_MISSED = "MIS"

    STATES = (
        (STATE_UNCONFIRMED, "Unconfirmed"),
        (STATE_DECLINED, "Declined"),
        (STATE_EXPIRED, "Expired"),
        (STATE_CONFIRMED, "Confirmed"),
        (STATE_COMPLETED, "Completed"),
        (STATE_CANCELED, "Canceled"),
        (STATE_MISSED, "Missed"),
    )
    # states in which the time slots stay reserved.
    RESERVED_STATES = (
        # STATE_UNCONFIRMED,
        STATE_CONFIRMED,
        STATE_COMPLETED,
        STATE_MISSED,
    )

    state = models.CharField(
        max_length=3, db_index=True, choices=STATES, default=STATE_UNCONFIRMED
    )
    def __str__(self):
        time = f'{self.time.strftime("%Y-%m-%d %H:%M:%S")}'# - secondary-time: {self.time2.strftime("%Y-%m-%d %H:%M:%S")}'
        return f"Reservation @({time}) [{self.state}] with {self.schedule}' schedule"
    
    def clean(self):
        super().clean()
        # check for duplicates
        # TODO: this is not working
        # dup_q = models.Q(schedule=self.schedule, state=self.state)
        # if self.id is not None:
        #     dup_q &= ~models.Q(id=self.id)

        # sub_q = models.Q()
        # if self.time is not None:
        #     sub_q |= models.Q(time=self.time) | models.Q(
        #         time_secondary=self.time
        #     )
        # if self.time_secondary is not None:
        #     sub_q |= models.Q(time_primary=self.time_secondary) | models.Q(
        #         time_secondary=self.time_secondary
        #     )
        # dup_q &= sub_q

        # if EmployeeReservation.objects.filter(dup_q).exists():
        #     raise ValidationError(_("Duplicate booking"))

    def get_padding(self):
        return self.padding

    def get_requested_times(self):
        for time in (self.time, self.time_secondary):
            if time is not None:
                yield time

    def get_reserved_spans(self):
        """
        Return a list of times that should be reserved
        """
        if self.state in self.RESERVED_STATES:
            for time in self.get_requested_times():
                yield TimeSpan(time, time + self.duration)

    # state change methods
    def cancel_with_reason(self, reason, reason_private):
        """
        Cancel a booking
        In order to cancel a booking it must be either in the unconfirmed
        or confirmed state. Bookings in other states have no need to be
        canceled.
        """
        # if self.__editor is None:
        #     raise RuntimeError(
        #         'You must embed cancel in a "with EmployeeReservation.set_editor()" call'
        #     )
        if self.state == EmployeeReservation.STATE_UNCONFIRMED:
            self.state = EmployeeReservation.STATE_DECLINED
        elif self.state == EmployeeReservation.STATE_CONFIRMED:
            self.state = EmployeeReservation.STATE_CANCELED
        else:
            raise ValidationError(
                "Only unconfirmed & unconfirmed bookings can be canceled"
            )
        self.state = EmployeeReservation.STATE_CANCELED
        self.rejected_reason_public = reason
        self.rejected_reason_private = reason_private
        # self.assignee = None

    def expire(self):
        if self.state != self.STATE_UNCONFIRMED:
            raise ValidationError("Booking must be unconfirmed")
        now = timezone.now()
        for dt in (self.time, self.time_secondary):
            if dt > now:
                raise ValidationError(
                    "A booking must be in the past before it can be expired"
                )

        self.state = self.STATE_EXPIRED

    def finish(self, has_happened: bool):
        if self.state != self.STATE_CONFIRMED:
            raise ValidationError("Booking must be confirmed")
        now = timezone.now()
        for slot in self.time_slots.all():
            if slot.start > now:
                raise ValidationError(
                    "A booking must have started before it can be finished"
                )

        if has_happened:
            self.state = self.STATE_COMPLETED
        else:
            self.state = self.STATE_MISSED

    def confirm(self, time: datetime):
        # if self.__editor is None:
        #     raise RuntimeError(
        #         'You must embed confirm in a "with EmployeeReservation.set_editor()" call'
        #     )
        # if self.assignee is not None and self.__editor != self.assignee:
        #     raise ValidationError("The other user has to confirm the booking")
        if time not in (self.time, self.time_secondary):
            raise ValidationError("Must confirm an existing requested time")
        self.time = time
        self.time_secondary = None
        self.state = EmployeeReservation.STATE_CONFIRMED
        # self.assignee = None

    def reschedule(self, new_times: List[datetime]):
        if len(new_times) < 1:
            raise ValidationError(
                "Must supply at least one time when rescheduling, "
                "otherwise just cancel"
            )
        if len(new_times) > 2:
            raise ValidationError("Only a maximum of 2 times is currently supported")

        if self.state == EmployeeReservation.STATE_CONFIRMED:
            self.state = EmployeeReservation.STATE_UNCONFIRMED
        elif self.state != EmployeeReservation.STATE_UNCONFIRMED:
            raise ValidationError("Only unconfirmed bookings can be rescheduled")

        if self.__editor is None:
            raise RuntimeError(
                "You must embed reschedule in a " '"with EmployeeReservation.set_editor()" call'
            )
        self.time = new_times[0]
        if len(new_times) > 1:
            self.time_secondary = new_times[1]
        # if self.__editor == self.guest:
        self.assignee = self.schedule
        # else:
        #     self.assignee = self.guest

    def can_book_unscheduled(self):
        """
        If this returns true, bookings will automatically create slots in
        unscheduled space.
        """
        return True #self.__editor == self.schedule


def recreate_time_slots(start=None, end=None):
    """Remove all the time slots and start from scratch
    New time slots are created between start & end inclusive
    """
    if start is None:
        start = timezone.now()
    if end is None:
        end = start + timedelta(days=100)

    for availability in EmployeeAvailability.objects.all():
        availability.recreate_occurrences(start, end)


class WorkBay(models.Model):
    name = models.CharField(max_length=100)
    shop = models.ForeignKey('Shop', on_delete=models.CASCADE)
    capacity = models.IntegerField(null=True)

class WorkBayAvailability(AbstractAvailability):
    class AgendaMeta:
        verbose_name_plural = _("workbay availabilities")
        schedule_model = WorkBay 
        schedule_field = "workbay"  # optional

class WorkBayAvailabilityOccurrence(AbstractAvailabilityOccurrence):
    class AgendaMeta:
        availability_model = WorkBayAvailability
        schedule_model = WorkBay
        schedule_field = "workbay"  # optional

class WorkBayTimeSlot(AbstractTimeSlot):
    class AgendaMeta:
        verbose_name_plural = _("workbay timeslots")
        availability_model = WorkBayAvailability
        schedule_model = WorkBay
        booking_model = "WorkBayReservation" # booking class, more details shortly
        schedule_field = "workbay"  # optional


class WorkBayReservation(AbstractBooking):
    class AgendaMeta:
        
        schedule_model = WorkBay
    
    auto_id = models.AutoField(primary_key=True)
    bookee = models.ForeignKey(
        to=ShopOwner,
        on_delete=models.CASCADE,
        related_name="workbay_reservation",
    )
    start_time = models.DateTimeField(db_index=True)
    end_time = models.DateTimeField(db_index=True)
    approved = models.BooleanField(default=False)

    def get_reserved_spans(self):
        # we only reserve the time if the reservation has been approved
        if self.approved:
            yield TimeSpan(self.start_time, self.end_time)