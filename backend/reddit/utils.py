import zoneinfo
import datetime as dt

from croniter import croniter, CroniterError


def calculate_next_run(cron_schedule_str: str, user_timezone: str = "UTC") -> dt.datetime:
    if not cron_schedule_str:
        return None

    try:
        tz = zoneinfo.ZoneInfo(user_timezone)
        now = dt.datetime.now(tz)

        cron = croniter(cron_schedule_str, now)
        next_run = cron.get_next(dt.datetime)
        next_run_utc = next_run.astimezone(dt.timezone.utc)
        return next_run_utc
    except (CroniterError, ValueError, Exception) as e:
        print(f"Error calculating next run time for '{cron_schedule_str}': {e}")
        return None
