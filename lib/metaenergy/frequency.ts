import { format, startOfWeek } from "date-fns";
import type { Language } from "../i18n/shared";

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

function getBandContent(band: FrequencyBand, language: Language = "en") {
  const content = {
    en: {
      initiator: {
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
      },
      builder: {
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
      },
      harmonizer: {
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
      },
      analyst: {
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
      }
    },
    zh: {
      initiator: {
        summary: "你带着快速启动的开创能量。越早选定方向，越早投入行动，动能就越容易稳定下来。",
        mantra: "先清楚开始，再稳定持续。",
        themes: ["新的开始", "可见行动", "创造勇气"],
        strengths: ["启动速度快", "表达直接", "能打破停滞"],
        watchouts: ["注意力分散", "事情收尾不足", "为了新鲜感而偏离结果"],
        guidance: {
          work: "先完成一个最重要的工作重点，不要一边开很多标签，一边分散执行。",
          relationships: "直接说出你真正需要的东西，不要假设别人自然能跟上你的节奏。",
          wellbeing: "顾好睡眠与补水，避免能量一下冲高、一下下坠。"
        },
        actionPlan: [
          "本周先完成一个与收入有关的动作。",
          "限制自己只接受一个新的重大承诺。",
          "在周五前收掉至少一件拖延中的事情。"
        ]
      },
      builder: {
        summary: "当结构被尊重时，你的频率最稳定。稳定、系统与重复，会把你的努力变成可靠结果。",
        mantra: "秩序，会带来力量。",
        themes: ["纪律", "可靠", "稳定输出"],
        strengths: ["执行稳定", "判断踏实", "长期跟进能力强"],
        watchouts: ["过度僵化", "过劳", "把忙碌误当成进展"],
        guidance: {
          work: "依靠可重复的流程和数据，而不是当天情绪来推进事情。",
          relationships: "除了责任和安排，也要刻意留一点温度。",
          wellbeing: "把恢复安排得像工作一样具体。"
        },
        actionPlan: [
          "先回看本周数字，再决定要不要新增事情。",
          "修正一个正在浪费时间的流程。",
          "在行程里保留一段明确的恢复时间。"
        ]
      },
      harmonizer: {
        summary: "你的频率更偏向关系与平衡。当环境、承诺与情绪负荷一致时，你会表现得最好。",
        mantra: "先对齐，再扩张。",
        themes: ["合作关系", "照顾型领导", "平衡节奏"],
        strengths: ["同理心", "安定他人的能力", "维系关系的能力"],
        watchouts: ["过度讨好", "接住太多别人的混乱", "回避困难对话"],
        guidance: {
          work: "先保护好自己的带宽，否则支持别人会变成无形透支。",
          relationships: "真诚比让所有人舒服更重要。",
          wellbeing: "减少过度刺激，让一天里多一点安静转换。"
        },
        actionPlan: [
          "说清楚一个这周必须守住的边界。",
          "先完成自己的重点，再去支持别人。",
          "进行一次你一直延后的诚实对话。"
        ]
      },
      analyst: {
        summary: "你的能量通过反思和选择性行动而加深。你擅长看见别人忽略的模式，然后精准行动。",
        mantra: "先深入，再决定。",
        themes: ["策略", "内在清晰", "高质量选择"],
        strengths: ["模式辨识", "判断力", "节奏谨慎而稳"],
        watchouts: ["分析过度", "抽离过头", "等待太久才行动"],
        guidance: {
          work: "不要把长时间规划误当成真正推进，把洞察转成一个可衡量成果。",
          relationships: "多分享一点你的内在过程，别人就不会把距离感误读成冷淡。",
          wellbeing: "保留独处，但不要让独处变成脱离。"
        },
        actionPlan: [
          "把一个洞察转成一个实际可交付的结果。",
          "比自己舒服的节奏更早一点做出一次决定。",
          "安排一段完整专注时间，也安排一段社交后的恢复时间。"
        ]
      }
    }
  } as const;

  return content[language][band];
}

export function buildFrequencyReport(birthday: string, language: Language = "en"): FrequencyReport {
  const lifePath = reduceDigit(sumDigits(birthday));
  const focus = reduceDigit(sumDigits(`${birthday}${new Date().getFullYear()}`));
  const yearEnergy = reduceDigit(sumDigits(`${birthday}${new Date().getFullYear()}${new Date().getMonth() + 1}`));
  const profileBand = getBand(lifePath, focus);
  const content = getBandContent(profileBand, language);

  return {
    birthday,
    lifePath,
    focus,
    yearEnergy,
    profileBand,
    summary: content.summary,
    mantra: content.mantra,
    themes: [...content.themes],
    strengths: [...content.strengths],
    watchouts: [...content.watchouts],
    guidance: { ...content.guidance },
    actionPlan: [...content.actionPlan]
  };
}

export function localizeFrequencyReport(report: Partial<FrequencyReport> | undefined, language: Language = "en") {
  if (!report) return null;
  const band = report.profileBand ?? getBand(report.lifePath ?? 5, report.focus ?? 5);
  const localized = getBandContent(band, language);
  return {
    birthday: report.birthday ?? "",
    lifePath: report.lifePath ?? 0,
    focus: report.focus ?? 0,
    yearEnergy: report.yearEnergy ?? 0,
    profileBand: band,
    summary: localized.summary,
    mantra: localized.mantra,
    themes: [...localized.themes],
    strengths: [...localized.strengths],
    watchouts: [...localized.watchouts],
    guidance: { ...localized.guidance },
    actionPlan: [...localized.actionPlan]
  };
}

export function buildWeeklyReminder(
  report: Partial<FrequencyReport>,
  context: WeeklyReminderContext,
  language: Language = "en"
): WeeklyReminder {
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const band = report.profileBand ?? getBand(report.lifePath ?? 5, report.focus ?? 5);
  const content = getBandContent(band, language);
  const headline =
    language === "en"
      ? band === "initiator"
        ? "Lead with decisive action"
        : band === "builder"
          ? "Protect structure and follow-through"
          : band === "harmonizer"
            ? "Hold alignment and boundaries"
            : "Move from insight into execution"
      : band === "initiator"
        ? "以明确行动带动本周"
        : band === "builder"
          ? "先守住结构与执行"
          : band === "harmonizer"
            ? "先对齐，再守住边界"
            : "把洞察转成执行";

  const contextualTheme =
    context.orderCount === 0
      ? language === "en"
        ? "This week needs activation: no paid orders have been recorded yet, so momentum must come from one concrete revenue move."
        : "这一周需要先把动能点起来：目前还没有已支付订单，所以要先完成一个具体的收入动作。"
      : context.personalCashSpent < 50
        ? language === "en"
          ? "Your weekly cashflow is still light. Focus on direct follow-through and personal conversion, not passive planning."
          : "你这周的现金流还偏轻。重点应放在直接跟进和个人成交，而不是停留在被动规划。"
        : context.referredOrderCount > 0
          ? language === "en"
            ? "Referral activity is present this week. Protect execution quality so relationship momentum turns into stable repeat sales."
            : "这周已有推荐活动出现。请守住执行质量，让关系动能转成更稳定的重复成交。"
          : report.summary ?? content.summary;

  const priorityList: string[] = [...content.actionPlan];
  if (context.orderCount === 0) {
    priorityList[0] = language === "en" ? "Create one paid order this week before adding any new experiments." : "在尝试新事情之前，先完成一张已支付订单。";
  }
  if (context.personalCashSpent < 50) {
    priorityList[1] = language === "en" ? "Prioritize one direct personal sale to keep your cash activity healthy." : "优先完成一笔个人直接成交，维持现金活跃度。";
  }
  if (context.referredOrderCount > 0) {
    priorityList[2] = language === "en" ? "Follow up with active downlines while their buying intent is still warm." : "趁下线的购买意愿还热的时候，及时完成跟进。";
  }

  const boundaryNote =
    language === "en"
      ? band === "harmonizer"
        ? "Do not accept extra emotional load before your own priorities are complete."
        : band === "builder"
          ? "Do not let routine become an excuse to avoid the highest-value task."
          : band === "initiator"
            ? "Do not split attention across too many starts."
            : "Do not wait for perfect clarity before acting."
      : band === "harmonizer"
        ? "在完成自己重点之前，不要额外接下太多情绪负担。"
        : band === "builder"
          ? "不要让惯性流程变成逃避高价值任务的理由。"
          : band === "initiator"
            ? "不要把注意力切散在太多新的开始上。"
            : "不要等到完全清楚才开始行动。";
  const contextualBoundary =
    context.personalCashSpent < 50
      ? language === "en"
        ? `${boundaryNote} Also, do not confuse admin work with actual revenue-producing action.`
        : `${boundaryNote} 同时，也不要把行政工作误当成真正产生收入的动作。`
      : boundaryNote;
  const reflectionPrompt =
    language === "en"
      ? band === "analyst"
        ? "What one insight must become a visible result this week?"
        : band === "builder"
          ? "Which routine is producing outcomes, and which is only producing motion?"
          : band === "harmonizer"
            ? "Where do you need truth more than comfort right now?"
            : "What would simplify your next move immediately?"
      : band === "analyst"
        ? "这周哪一个洞察，必须变成可以看见的结果？"
        : band === "builder"
          ? "你现在的哪一个日常动作真的有结果，哪一个只是在制造忙碌感？"
          : band === "harmonizer"
            ? "你现在更需要真实，还是舒服？"
            : "下一步如果要立刻变简单，最该先删掉什么？";
  const contextualReflection =
    context.referredOrderCount > 0
      ? language === "en"
        ? `${reflectionPrompt} Which downline relationship needs immediate follow-up?`
        : `${reflectionPrompt} 哪一段下线关系需要你马上跟进？`
      : reflectionPrompt;

  return {
    weekStart: format(weekStart, "yyyy-MM-dd"),
    headline,
    focusTheme: contextualTheme,
    priorityList,
    boundaryNote: contextualBoundary,
    reflectionPrompt: contextualReflection,
    weeklyContext: context,
    content:
      language === "en"
        ? `${headline}. ${contextualTheme} Priorities: ${priorityList.join("; ")}. Boundary: ${contextualBoundary} Reflection: ${contextualReflection}`
        : `${headline}。${contextualTheme} 优先事项：${priorityList.join("；")}。边界提醒：${contextualBoundary} 反思问题：${contextualReflection}`
  };
}

export function localizeWeeklyReminder(
  reminder: WeeklyReminder | null | undefined,
  language: Language = "en",
  report?: Partial<FrequencyReport>
) {
  if (!reminder) return null;
  const rebuilt = buildWeeklyReminder(report ?? {}, reminder.weeklyContext, language);
  return {
    ...rebuilt,
    weekStart: reminder.weekStart
  } as WeeklyReminder;
}
