import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireUser } from "@/server/lib/auth";
import { AppError, toApiResponse } from "@/server/lib/response";

export const listReminders = createServerFn({ method: "GET" }).handler(async () =>
  toApiResponse(async () => {
    const { supabase, user } = await requireUser();
    const { data, error } = await supabase
      .from("reminders")
      .select()
      .eq("user_id", user.id)
      .order("reminder_time", { ascending: true });
    if (error) throw new AppError(error.message, 500);
    return data;
  }),
);

const reminderInputSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  reminderTime: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, "Use HH:MM time format"),
  daysOfWeek: z.array(z.string()).default([]),
});

/** reminderService.createReminder */
export const createReminder = createServerFn({ method: "POST" })
  .validator(reminderInputSchema)
  .handler(async ({ data }) =>
    toApiResponse(async () => {
      const { supabase, user } = await requireUser();
      const { data: reminder, error } = await supabase
        .from("reminders")
        .insert({
          user_id: user.id,
          title: data.title,
          description: data.description,
          reminder_time: data.reminderTime,
          days_of_week: data.daysOfWeek,
        })
        .select()
        .single();
      if (error) throw new AppError(error.message, 500);
      return reminder;
    }),
  );

export const setReminderActive = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string().uuid(), isActive: z.boolean() }))
  .handler(async ({ data }) =>
    toApiResponse(async () => {
      const { supabase, user } = await requireUser();
      const { error } = await supabase
        .from("reminders")
        .update({ is_active: data.isActive })
        .match({ id: data.id, user_id: user.id });
      if (error) throw new AppError(error.message, 500);
      return { ok: true };
    }),
  );

export const deleteReminder = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data }) =>
    toApiResponse(async () => {
      const { supabase, user } = await requireUser();
      const { error } = await supabase
        .from("reminders")
        .delete()
        .match({ id: data.id, user_id: user.id });
      if (error) throw new AppError(error.message, 500);
      return { ok: true };
    }),
  );
