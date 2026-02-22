from django.utils import timezone
from rest_framework.exceptions import ValidationError

from .models import DailyClosing


def ensure_day_not_closed(target_date=None):
    day = target_date or timezone.localdate()
    is_closed = DailyClosing.objects.filter(
        report_date=day,
        closing_time__isnull=False,
    ).exists()
    if is_closed:
        raise ValidationError("Day is closed. No new orders or payments are allowed.")
