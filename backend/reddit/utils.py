import datetime as dt

from croniter import croniter, CroniterError


def calculate_next_run(cron_schedule_str: str) -> dt.datetime:
    if not cron_schedule_str:
        return None

    now = dt.datetime.now()
    try:
        cron = croniter(cron_schedule_str, now)
        next_run = cron.get_next(dt.datetime)
        timestamp = next_run.timestamp()
        next_run_utc = dt.datetime.fromtimestamp(timestamp, dt.timezone.utc)
        return next_run_utc
    except (CroniterError, ValueError) as e:
        print(f"Error calculating next run time for '{cron_schedule_str}': {e}")
        return None
