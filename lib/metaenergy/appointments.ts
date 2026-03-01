import type { SupabaseClient } from "@supabase/supabase-js";
import { addDays, format, getDay, startOfDay } from "date-fns";
import { calcCashPaid, calcMaxRedeemablePoints } from "./calculations";

export type MentorRecord = {
  id: string;
  display_name: string;
  headline: string | null;
  bio: string | null;
  specialties: string[] | null;
  suitable_for: string | null;
  location_type: "online" | "offline" | "both";
  location_note: string | null;
  languages: string[] | null;
  avatar_url: string | null;
};

export type MentorServiceRecord = {
  id: string;
  mentor_id: string;
  name: string;
  duration_min: number;
  price_total: number;
  deposit_amount: number;
  allow_points: boolean;
  active: boolean;
};

type AvailabilityRuleRecord = {
  id: string;
  mentor_id: string;
  weekday: number;
  start_time: string;
  end_time: string;
  slot_interval_min: number;
  timezone: string;
  active: boolean;
};

type AvailabilityExceptionRecord = {
  id: string;
  mentor_id: string;
  date: string;
  is_available: boolean;
  start_time: string | null;
  end_time: string | null;
  note: string | null;
};

type AppointmentConflictRecord = {
  id: string;
  start_at: string;
  end_at: string;
  status: string;
};

export type AppointmentQuote = {
  priceTotal: number;
  maxPointsUsable: number;
  pointsUsed: number;
  cashDue: number;
  depositAmount: number;
};

export type BookableSlot = {
  startAt: string;
  endAt: string;
  dateKey: string;
  dateLabel: string;
  timeLabel: string;
};

function toOffsetIso(dateKey: string, timeValue: string) {
  const time = timeValue.slice(0, 8);
  return `${dateKey}T${time}+08:00`;
}

function normalizeNumber(value: number | string | null | undefined) {
  return Number(value ?? 0);
}

export function buildAppointmentQuote(service: Pick<MentorServiceRecord, "price_total" | "deposit_amount" | "allow_points">, pointsBalance: number, requestedPoints: number): AppointmentQuote {
  const maxPointsUsable = service.allow_points ? calcMaxRedeemablePoints(service.price_total, pointsBalance) : 0;
  const pointsUsed = Math.min(Math.max(0, Math.floor(requestedPoints)), maxPointsUsable);
  const cashDue = calcCashPaid(service.price_total, pointsUsed);

  return {
    priceTotal: normalizeNumber(service.price_total),
    maxPointsUsable,
    pointsUsed,
    cashDue,
    depositAmount: normalizeNumber(service.deposit_amount)
  };
}

export async function getMentorService(admin: SupabaseClient, mentorId: string, serviceId: string) {
  const [{ data: mentor, error: mentorError }, { data: service, error: serviceError }] = await Promise.all([
    admin
      .from("mentors")
      .select("id,display_name,headline,bio,specialties,suitable_for,location_type,location_note,languages,avatar_url")
      .eq("id", mentorId)
      .eq("is_active", true)
      .single(),
    admin
      .from("mentor_services")
      .select("id,mentor_id,name,duration_min,price_total,deposit_amount,allow_points,active")
      .eq("id", serviceId)
      .eq("mentor_id", mentorId)
      .eq("active", true)
      .single()
  ]);

  if (mentorError || !mentor) throw mentorError ?? new Error("Mentor not found.");
  if (serviceError || !service) throw serviceError ?? new Error("Service not found.");

  return {
    mentor: {
      ...mentor,
      specialties: Array.isArray(mentor.specialties) ? mentor.specialties : [],
      languages: Array.isArray(mentor.languages) ? mentor.languages : []
    } as MentorRecord,
    service: {
      ...service,
      price_total: normalizeNumber(service.price_total),
      deposit_amount: normalizeNumber(service.deposit_amount)
    } as MentorServiceRecord
  };
}

export async function getBookableSlots(
  admin: SupabaseClient,
  mentorId: string,
  serviceDuration: number,
  startDate = new Date(),
  days = 14
) {
  const rangeStart = startOfDay(startDate);
  const rangeEnd = addDays(rangeStart, days);
  const fromKey = format(rangeStart, "yyyy-MM-dd");
  const toKey = format(rangeEnd, "yyyy-MM-dd");

  const [{ data: rules, error: rulesError }, { data: exceptions, error: exceptionsError }, { data: conflicts, error: conflictsError }] =
    await Promise.all([
      admin
        .from("mentor_availability_rules")
        .select("id,mentor_id,weekday,start_time,end_time,slot_interval_min,timezone,active")
        .eq("mentor_id", mentorId)
        .eq("active", true),
      admin
        .from("mentor_availability_exceptions")
        .select("id,mentor_id,date,is_available,start_time,end_time,note")
        .eq("mentor_id", mentorId)
        .gte("date", fromKey)
        .lte("date", toKey),
      admin
        .from("appointments")
        .select("id,start_at,end_at,status")
        .eq("mentor_id", mentorId)
        .in("status", ["pending", "confirmed", "completed"])
        .gte("start_at", rangeStart.toISOString())
        .lt("start_at", rangeEnd.toISOString())
    ]);

  if (rulesError) throw rulesError;
  if (exceptionsError) throw exceptionsError;
  if (conflictsError) throw conflictsError;

  const rulesByWeekday = new Map<number, AvailabilityRuleRecord[]>();
  for (const rule of (rules ?? []) as AvailabilityRuleRecord[]) {
    const existing = rulesByWeekday.get(rule.weekday) ?? [];
    existing.push(rule);
    rulesByWeekday.set(rule.weekday, existing);
  }

  const exceptionsByDate = new Map<string, AvailabilityExceptionRecord>(
    ((exceptions ?? []) as AvailabilityExceptionRecord[]).map((entry) => [entry.date, entry])
  );
  const activeConflicts = ((conflicts ?? []) as AppointmentConflictRecord[]).map((entry) => ({
    start: new Date(entry.start_at),
    end: new Date(entry.end_at)
  }));

  const slots: BookableSlot[] = [];

  for (let offset = 0; offset < days; offset += 1) {
    const day = addDays(rangeStart, offset);
    const dateKey = format(day, "yyyy-MM-dd");
    const weekday = getDay(day);
    const exception = exceptionsByDate.get(dateKey);

    const windows = exception
      ? exception.is_available && exception.start_time && exception.end_time
        ? [{ start_time: exception.start_time, end_time: exception.end_time, slot_interval_min: 30 }]
        : []
      : (rulesByWeekday.get(weekday) ?? []).map((rule) => ({
          start_time: rule.start_time,
          end_time: rule.end_time,
          slot_interval_min: rule.slot_interval_min
        }));

    for (const window of windows) {
      const windowStart = new Date(toOffsetIso(dateKey, window.start_time));
      const windowEnd = new Date(toOffsetIso(dateKey, window.end_time));

      for (
        let slotStart = new Date(windowStart);
        slotStart.getTime() + serviceDuration * 60_000 <= windowEnd.getTime();
        slotStart = new Date(slotStart.getTime() + window.slot_interval_min * 60_000)
      ) {
        const slotEnd = new Date(slotStart.getTime() + serviceDuration * 60_000);
        const overlaps = activeConflicts.some(
          (conflict) => slotStart < conflict.end && slotEnd > conflict.start
        );

        if (overlaps) continue;

        slots.push({
          startAt: slotStart.toISOString(),
          endAt: slotEnd.toISOString(),
          dateKey,
          dateLabel: format(slotStart, "EEE, d MMM"),
          timeLabel: `${format(slotStart, "HH:mm")} - ${format(slotEnd, "HH:mm")}`
        });
      }
    }
  }

  return slots;
}

export async function ensureAppointmentSlotAvailable(
  admin: SupabaseClient,
  mentorId: string,
  startAt: string,
  endAt: string
) {
  const { data: conflict, error } = await admin
    .from("appointments")
    .select("id")
    .eq("mentor_id", mentorId)
    .in("status", ["pending", "confirmed", "completed"])
    .lt("start_at", endAt)
    .gt("end_at", startAt)
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (conflict) {
    throw new Error("This slot is no longer available.");
  }
}
