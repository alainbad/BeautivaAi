import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";
import type { Reminder } from "@/lib/supabase/types";

const WEEKDAY_TO_CAPACITOR: Record<string, number> = {
  Sunday: 1,
  Monday: 2,
  Tuesday: 3,
  Wednesday: 4,
  Thursday: 5,
  Friday: 6,
  Saturday: 7,
};

/** Stable 31-bit id so re-scheduling the same reminder updates instead of duplicating. */
function reminderNotificationId(reminderId: string): number {
  let hash = 0;
  for (let i = 0; i < reminderId.length; i++) {
    hash = (hash * 31 + reminderId.charCodeAt(i)) & 0x7fffffff;
  }
  return hash;
}

export async function requestNotificationPermission() {
  if (!Capacitor.isNativePlatform()) return false;
  const { display } = await LocalNotifications.requestPermissions();
  return display === "granted";
}

/** Mirrors the `reminders` table into scheduled iOS local notifications. */
export async function syncReminderNotifications(reminders: Reminder[]) {
  if (!Capacitor.isNativePlatform()) return;

  const active = reminders.filter((r) => r.is_active);

  await LocalNotifications.cancel({
    notifications: reminders.map((r) => ({ id: reminderNotificationId(r.id) })),
  });

  const toSchedule = active.flatMap((reminder) => {
    const [h, m] = reminder.reminder_time.split(":").map(Number);
    const days = reminder.days_of_week.length
      ? reminder.days_of_week
      : Object.keys(WEEKDAY_TO_CAPACITOR);
    return days.map((day) => ({
      id: reminderNotificationId(`${reminder.id}-${day}`),
      title: "BeautyAI",
      body: reminder.title,
      schedule: {
        on: { weekday: WEEKDAY_TO_CAPACITOR[day] ?? 1, hour: h, minute: m },
        allowWhileIdle: true,
      },
    }));
  });

  if (toSchedule.length) {
    await LocalNotifications.schedule({ notifications: toSchedule });
  }
}
