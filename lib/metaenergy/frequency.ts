import { format, startOfWeek } from "date-fns";

type FrequencyBand = "initiator" | "builder" | "harmonizer" | "analyst";

export type FrequencyReport = {
  birthday: string;
  lifePath: number;
  focus: number;
  yearEnergy: number;
  profileBand: FrequencyBand;
  summary: string;
  mantra: string;
  themes: string[];
  strengths: string[];
  watchouts: string[];
  guidance: {
    work: string;
    relationships: string;
    wellbeing: string;
  };
  actionPlan: string[];
};

export type WeeklyReminder = {
  weekStart: string;
  headline: string;
  focusTheme: string;
  priorityList: string[];
  boundaryNote: string;
  reflectionPrompt: string;
  weeklyContext: {
    orderCount: number;
    personalCashSpent: number;
    referredOrderCount: number;
  };
  content: string;
};

export type WeeklyReminderContext = {
  orderCount: number;
  personalCashSpent: number;
  referredOrderCount: number;
};

function sumDigits(value: string) {
  return value
    .replace(/\D/g, "")
    .split("")
    .reduce((total, digit) => total + Number(digit), 0);
}

function reduceDigit(value: number) {
  let current = value;
  while (current > 9) {
    current = String(current)
      .split("")
      .reduce((total, digit) => total + Number(digit), 0);
  }
  return current;
}

function getBand(lifePath: number, focus: number): FrequencyBand {
  const combined = lifePath + focus;
  if (combined <= 5) return "initiator";
  if (combined <= 10) return "builder";
  if (combined <= 14) return "harmonizer";
  return "analyst";
}

function getBandContent(band: FrequencyBand) {
  switch (band) {
    case "initiator":
      return {
        summary: "You carry fast-moving pioneer energy. Momentum comes when you choose a direction early and commit before doubt multiplies.",
        mantra: "Start clearly, then stay consistent.",
        themes: ["fresh starts", "visible action", "creative courage"],
        strengths: ["quick activation", "clear communication", "ability to break inertia"],
        watchouts: ["scattered focus", "unfinished tasks", "chasing novelty over results"],
        guidance: {
          work: "Pick one lead priority and finish it before opening three more tabs or offers.",
          relationships: "Say what you actually need instead of assuming others can infer your pace.",
          wellbeing: "Protect sleep and hydration so your energy does not spike and crash."
        },
        actionPlan: [
          "Choose one revenue move to complete this week.",
          "Limit yourself to one major new commitment.",
          "Close at least one lingering task before Friday."
        ]
      };
    case "builder":
      return {
        summary: "Your frequency is strongest when structure is respected. Stability, systems, and repetition turn your effort into reliable results.",
        mantra: "Order creates power.",
        themes: ["discipline", "reliability", "steady output"],
        strengths: ["operational consistency", "grounded judgment", "long-term follow-through"],
        watchouts: ["rigidity", "overwork", "mistaking busyness for progress"],
        guidance: {
          work: "Use repeatable routines and track numbers instead of relying on mood.",
          relationships: "Make room for warmth, not just responsibility and logistics.",
          wellbeing: "Schedule recovery the same way you schedule obligations."
        },
        actionPlan: [
          "Review weekly numbers before adding anything new.",
          "Tighten one process that currently wastes time.",
          "Create one protected recovery block in your calendar."
        ]
      };
    case "harmonizer":
      return {
        summary: "Your field is relational and balancing. You do best when your environment, commitments, and emotional load are aligned.",
        mantra: "Alignment before expansion.",
        themes: ["partnership", "care leadership", "balanced pacing"],
        strengths: ["empathy", "calming influence", "ability to hold people together"],
        watchouts: ["people pleasing", "taking on other people's chaos", "avoiding hard conversations"],
        guidance: {
          work: "Protect your bandwidth or supportive energy turns into invisible overload.",
          relationships: "Healthy honesty matters more than keeping everyone comfortable.",
          wellbeing: "Reduce overstimulation and build quieter transitions into the day."
        },
        actionPlan: [
          "Name one boundary you will enforce this week.",
          "Support others only after your top commitments are secured.",
          "Have one honest conversation you have been postponing."
        ]
      };
    case "analyst":
      return {
        summary: "Your energy deepens through reflection and selective action. You create value by seeing patterns other people miss, then acting with precision.",
        mantra: "Depth, then decision.",
        themes: ["strategy", "inner clarity", "high-signal choices"],
        strengths: ["pattern recognition", "discernment", "thoughtful pacing"],
        watchouts: ["over-analysis", "withdrawal", "waiting too long to act"],
        guidance: {
          work: "Do not confuse a long planning cycle with real movement; convert insight into one measurable output.",
          relationships: "Share more of your internal process so people do not read distance as disinterest.",
          wellbeing: "Protect solitude, but do not let it turn into disengagement."
        },
        actionPlan: [
          "Turn one insight into a concrete deliverable this week.",
          "Share one decision earlier than feels comfortable.",
          "Block uninterrupted focus time and a separate social reset."
        ]
      };
  }
}

export function buildFrequencyReport(birthday: string): FrequencyReport {
  const lifePath = reduceDigit(sumDigits(birthday));
  const focus = reduceDigit(sumDigits(`${birthday}${new Date().getFullYear()}`));
  const yearEnergy = reduceDigit(sumDigits(`${birthday}${new Date().getFullYear()}${new Date().getMonth() + 1}`));
  const profileBand = getBand(lifePath, focus);
  const content = getBandContent(profileBand);

  return {
    birthday,
    lifePath,
    focus,
    yearEnergy,
    profileBand,
    summary: content.summary,
    mantra: content.mantra,
    themes: content.themes,
    strengths: content.strengths,
    watchouts: content.watchouts,
    guidance: content.guidance,
    actionPlan: content.actionPlan
  };
}

export function buildWeeklyReminder(
  report: Partial<FrequencyReport>,
  context: WeeklyReminderContext
): WeeklyReminder {
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const band = getBand(report.lifePath ?? 5, report.focus ?? 5);
  const content = getBandContent(band);
  const headline =
    band === "initiator"
      ? "Lead with decisive action"
      : band === "builder"
        ? "Protect structure and follow-through"
        : band === "harmonizer"
          ? "Hold alignment and boundaries"
          : "Move from insight into execution";

  const contextualTheme =
    context.orderCount === 0
      ? "This week needs activation: no paid orders have been recorded yet, so momentum must come from one concrete revenue move."
      : context.personalCashSpent < 50
        ? "Your weekly cashflow is still light. Focus on direct follow-through and personal conversion, not passive planning."
        : context.referredOrderCount > 0
          ? "Referral activity is present this week. Protect execution quality so relationship momentum turns into stable repeat sales."
          : report.summary ?? content.summary;

  const priorityList = [...content.actionPlan];
  if (context.orderCount === 0) {
    priorityList[0] = "Create one paid order this week before adding any new experiments.";
  }
  if (context.personalCashSpent < 50) {
    priorityList[1] = "Prioritize one direct personal sale to keep your cash activity healthy.";
  }
  if (context.referredOrderCount > 0) {
    priorityList[2] = "Follow up with active downlines while their buying intent is still warm.";
  }

  const boundaryNote =
    band === "harmonizer"
      ? "Do not accept extra emotional load before your own priorities are complete."
      : band === "builder"
        ? "Do not let routine become an excuse to avoid the highest-value task."
        : band === "initiator"
          ? "Do not split attention across too many starts."
          : "Do not wait for perfect clarity before acting.";
  const contextualBoundary =
    context.personalCashSpent < 50
      ? `${boundaryNote} Also, do not confuse admin work with actual revenue-producing action.`
      : boundaryNote;
  const reflectionPrompt =
    band === "analyst"
      ? "What one insight must become a visible result this week?"
      : band === "builder"
        ? "Which routine is producing outcomes, and which is only producing motion?"
        : band === "harmonizer"
          ? "Where do you need truth more than comfort right now?"
          : "What would simplify your next move immediately?";
  const contextualReflection =
    context.referredOrderCount > 0
      ? `${reflectionPrompt} Which downline relationship needs immediate follow-up?`
      : reflectionPrompt;

  return {
    weekStart: format(weekStart, "yyyy-MM-dd"),
    headline,
    focusTheme: contextualTheme,
    priorityList,
    boundaryNote: contextualBoundary,
    reflectionPrompt: contextualReflection,
    weeklyContext: context,
    content: `${headline}. ${contextualTheme} Priorities: ${priorityList.join("; ")}. Boundary: ${contextualBoundary} Reflection: ${contextualReflection}`
  };
}
