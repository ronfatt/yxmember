import Image from "next/image";
import Link from "next/link";
import FaqAccordion from "../components/FaqAccordion";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import { currentMonthAnnouncements } from "../lib/metaenergy/announcements";
import { t } from "../lib/i18n/shared";
import { getCurrentLanguage } from "../lib/i18n/server";

const valueCards = [
  {
    icon: "RM",
    title: "分享之中，回馈自然发生",
    description: "引荐关系稳定累积后，可逐步解锁最高 25% 的会员回馈。"
  },
  {
    icon: "FX",
    title: "体验之中，看见成长",
    description: "个人频率报告、每周提醒与日常引导，帮助你持续校准自己的节奏。"
  },
  {
    icon: "PT",
    title: "参与之中，累积礼遇",
    description: "每次消费都能逐步累积积分，并在合适的时候兑换下一次体验。"
  }
];

const faqItems = [
  {
    question: "引荐回馈是如何解锁的？",
    answer:
      "引荐回馈会在累计引荐业绩达到 RM1,000、RM3,000 与 RM10,000 时依序解锁。若发生重置，则会从重置后的累计业绩重新开始计算。"
  },
  {
    question: "刚跨过门槛的那一单，会立即用新的回馈比例吗？",
    answer:
      "不会。元象采用严格的不追溯规则。跨过门槛的当笔订单仍沿用原本层级，下一笔被归因的订单才会开始使用新的比例。"
  },
  {
    question: "每月维持资格的规则是什么？",
    answer:
      "会员每月需要至少 RM50 的个人现金消费。若连续两个月低于 RM50，引荐层级与累计引荐业绩会归零，需重新累积。"
  },
  {
    question: "积分是如何累积与使用的？",
    answer:
      "每实际支付满 RM100 可获得 10 点积分。积分最多可抵扣订单金额的 50%，其余至少 50% 需以现金支付，积分不能兑换现金。"
  },
  {
    question: "这套会员系统适合谁？",
    answer:
      "它适合想用更清晰、更安定的方式体验频率工具、持续参与提醒内容，并在分享元象的过程中看见自己成长与回馈的人。"
  }
];

export default function HomePage() {
  const language = getCurrentLanguage();
  const valueCards = [
    {
      icon: "RM",
      title: t(language, { zh: "分享之中，回馈自然发生", en: "Earn While You Share" }),
      description: t(language, {
        zh: "引荐关系稳定累积后，可逐步解锁最高 25% 的会员回馈。",
        en: "Unlock up to 25% referral rewards as your community grows with you."
      })
    },
    {
      icon: "FX",
      title: t(language, { zh: "体验之中，看见成长", en: "Experience & Grow" }),
      description: t(language, {
        zh: "个人频率报告、每周提醒与日常引导，帮助你持续校准自己的节奏。",
        en: "Personal frequency reports, weekly reminders, and guided tools for everyday alignment."
      })
    },
    {
      icon: "PT",
      title: t(language, { zh: "参与之中，累积礼遇", en: "Get Rewarded" }),
      description: t(language, {
        zh: "每次消费都能逐步累积积分，并在合适的时候兑换下一次体验。",
        en: "Earn points on every purchase and redeem up to 50% of your next order."
      })
    }
  ];
  const faqItems = [
    {
      question: t(language, { zh: "引荐回馈是如何解锁的？", en: "How do referral rewards unlock?" }),
      answer: t(language, {
        zh: "引荐回馈会在累计引荐业绩达到 RM1,000、RM3,000 与 RM10,000 时依序解锁。若发生重置，则会从重置后的累计业绩重新开始计算。",
        en: "Referral commission tiers unlock at RM1,000, RM3,000, and RM10,000 cumulative referred sales after any reset."
      })
    },
    {
      question: t(language, { zh: "刚跨过门槛的那一单，会立即用新的回馈比例吗？", en: "Does the threshold-crossing order earn the new rate?" }),
      answer: t(language, {
        zh: "不会。元象采用严格的不追溯规则。跨过门槛的当笔订单仍沿用原本层级，下一笔被归因的订单才会开始使用新的比例。",
        en: "No. The threshold-crossing order still uses the previous tier rate. The next referred order uses the upgraded rate."
      })
    },
    {
      question: t(language, { zh: "每月维持资格的规则是什么？", en: "What is the keep-alive rule?" }),
      answer: t(language, {
        zh: "会员每月需要至少 RM50 的个人现金消费。若连续两个月低于 RM50，引荐层级与累计引荐业绩会归零，需重新累积。",
        en: "Members must keep at least RM50 in monthly personal cash purchases. Two consecutive months below RM50 reset referral progress."
      })
    },
    {
      question: t(language, { zh: "积分是如何累积与使用的？", en: "How do points work?" }),
      answer: t(language, {
        zh: "每实际支付满 RM100 可获得 10 点积分。积分最多可抵扣订单金额的 50%，其余至少 50% 需以现金支付，积分不能兑换现金。",
        en: "Members earn 10 points per full RM100 cash paid. Points can cover up to 50% of a purchase and cannot be exchanged for cash."
      })
    },
    {
      question: t(language, { zh: "这套会员系统适合谁？", en: "Who is this membership for?" }),
      answer: t(language, {
        zh: "它适合想用更清晰、更安定的方式体验频率工具、持续参与提醒内容，并在分享元象的过程中看见自己成长与回馈的人。",
        en: "It is designed for people who want a clearer way to use frequency tools, stay engaged, and share MetaEnergy while seeing their rewards and progress."
      })
    }
  ];
  const previewLabel = t(language, { zh: "Preview UI", en: "Preview UI" });
  const previewNotice = t(language, {
    zh: "仅供预览。真实数据会在登录后显示。",
    en: "Preview only. Actual data appears after login."
  });

  return (
    <div className="min-h-screen bg-[#f5f0e6]">
      <SiteHeader />
      <main>
        <section className="relative overflow-hidden border-b border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(213,178,77,0.2),_transparent_24%),radial-gradient(circle_at_bottom_right,_rgba(74,120,91,0.35),_transparent_26%),linear-gradient(135deg,_#0f261a_0%,_#173c2a_42%,_#08140e_100%)] text-white">
          <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:36px_36px]" />
          <div className="absolute left-[-8rem] top-[-3rem] h-64 w-64 rounded-full bg-[#d4a940]/20 blur-3xl" />
          <div className="absolute bottom-[-5rem] right-[-5rem] h-72 w-72 rounded-full bg-[#2f6f4c]/30 blur-3xl" />
          <div className="container relative py-20 md:py-24">
            <div className="grid gap-10 lg:grid-cols-[1.15fr,0.85fr] lg:items-center">
              <div className="space-y-7">
                <span className="inline-flex rounded-full border border-white/15 bg-white/8 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-[#f0d78a]">
                  {t(language, { zh: "元象能量会员系统 · 会员空间", en: "MetaEnergy Member System · Member Space" })}
                </span>
                <div className="space-y-4">
                  <h1 className="max-w-3xl font-display text-5xl leading-[0.95] text-white md:text-7xl">
                    {t(language, { zh: "在安定之中，", en: "Unlock your frequency." })}
                    <br />
                    {t(language, { zh: "看见你的积累与回响。", en: "Earn while you grow." })}
                  </h1>
                  <p className="max-w-2xl text-lg leading-8 text-white/72 md:text-xl">
                    {t(language, {
                      zh: "元象能量会员系统，以中文为主、体验为先。",
                      en: "A calm membership space for frequency tools, rewards, and long-term participation."
                    })}
                    <span className="block text-base text-white/58 md:text-lg">
                      {t(language, {
                        zh: "English is available as a secondary language across the experience.",
                        en: "Chinese-first by design, with English available as a secondary layer."
                      })}
                    </span>
                  </p>
                </div>
                <div className="flex flex-wrap gap-4">
                  <Link
                    href="/register"
                    className="rounded-full bg-[#d4a940] px-7 py-3 text-sm font-semibold text-[#102116] transition hover:bg-[#e2bb56]"
                  >
                    {t(language, { zh: "免费加入会员", en: "Start free membership" })}
                  </Link>
                  <a
                    href="#how-it-works"
                    className="rounded-full border border-white/20 bg-white/5 px-7 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                  >
                    {t(language, { zh: "了解运作方式", en: "How it works" })}
                  </a>
                </div>
                <div className="grid gap-4 pt-2 md:grid-cols-2">
                  <Link
                    href="/register"
                    className="rounded-3xl border border-white/10 bg-white/8 p-5 transition hover:bg-white/12"
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#f0d78a]">I want to</p>
                    <p className="mt-3 font-display text-2xl">{t(language, { zh: "体验频率工具", en: "Experience frequency tools" })}</p>
                    <p className="mt-2 text-sm text-white/65">
                      {t(language, { zh: "报告、提醒与日常引导。", en: "Reports, reminders, and grounded guidance." })}
                      <span className="block text-white/45">Reports, reminders, and grounded guidance.</span>
                    </p>
                  </Link>
                  <Link
                    href="/register"
                    className="rounded-3xl border border-white/10 bg-white/8 p-5 transition hover:bg-white/12"
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#f0d78a]">I want to</p>
                    <p className="mt-3 font-display text-2xl">{t(language, { zh: "累积引荐回馈", en: "Earn referral rewards" })}</p>
                    <p className="mt-2 text-sm text-white/65">
                      {t(language, { zh: "清楚看见层级与业绩变化。", en: "Track tiers, sales progress, and reward momentum." })}
                      <span className="block text-white/45">Track tiers, sales progress, and reward momentum.</span>
                    </p>
                  </Link>
                </div>
              </div>

              <div className="space-y-5">
                <div className="rounded-[32px] border border-white/10 bg-white/8 p-6 shadow-2xl backdrop-blur">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.25em] text-[#f0d78a]">会员进展 · Member Momentum</p>
                      <p className="mt-2 font-display text-3xl">把成长感看得更清楚</p>
                    </div>
                    <span className="rounded-full border border-[#f0d78a]/30 bg-[#f0d78a]/10 px-3 py-1 text-xs font-semibold text-[#f0d78a]">
                      {previewLabel}
                    </span>
                  </div>
                  <p className="mt-4 text-xs text-white/70">{previewNotice}</p>
                  <div className="mt-6 rounded-3xl bg-[#f7f3ea] p-5 text-[#123524]">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{t(language, { zh: "预览会员已解锁层级", en: "Preview member unlocked a tier" })}</span>
                      <span className="rounded-full bg-[#dff0e5] px-3 py-1 text-xs font-semibold text-[#1b5a3b]">
                        {t(language, { zh: "示意界面", en: "Sample UI" })}
                      </span>
                    </div>
                    <div className="mt-5 space-y-4">
                      <div className="rounded-2xl border border-black/10 bg-white p-4">
                        <div className="flex items-center justify-between text-sm text-black/60">
                          <span>{t(language, { zh: "层级预览", en: "Tier preview" })}</span>
                          <span className="font-semibold text-[#123524]">{t(language, { zh: "示意值", en: "Sample" })}</span>
                        </div>
                        <div className="mt-4 h-3 rounded-full bg-[#e7e1d4]">
                          <div className="h-3 w-[68%] rounded-full bg-[linear-gradient(90deg,_#c8a23a,_#e1c76d)]" />
                        </div>
                        <p className="mt-3 text-sm text-black/55">{t(language, { zh: "预览进度条仅用于展示界面层级感。", en: "This progress bar is a visual preview only." })}</p>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-2xl border border-black/10 bg-white p-4">
                          <p className="text-sm text-black/55">{t(language, { zh: "积分预览", en: "Points preview" })}</p>
                          <p className="mt-2 font-display text-3xl">...</p>
                          <p className="mt-1 text-xs text-black/50">{t(language, { zh: "登录后显示真实积分与抵扣信息。", en: "Real point balances appear after login." })}</p>
                        </div>
                        <div className="rounded-2xl border border-black/10 bg-white p-4">
                          <p className="text-sm text-black/55">{t(language, { zh: "提醒预览", en: "Reminder preview" })}</p>
                          <p className="mt-2 font-medium">{t(language, { zh: "你的个性化提醒将在登录后生成", en: "Your personalized reminder appears after login" })}</p>
                          <p className="mt-1 text-xs text-black/50">{t(language, { zh: "公开首页不会显示真实会员资料。", en: "The public homepage does not show real member data." })}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="rounded-[28px] border border-white/10 bg-white/6 p-5 text-sm text-white/72 backdrop-blur">
                  频率体验、会员回馈、积分机制，都被整理进一个更安定、更容易理解的会员空间。
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="container py-16 md:py-20">
          <div className="mb-8 max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-jade">为什么加入 · Why Join</p>
            <h2 className="mt-3 font-display text-4xl text-[#123524] md:text-5xl">人们愿意持续留在元象的三个原因</h2>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            {valueCards.map((card) => (
              <div key={card.title} className="card overflow-hidden border-black/5 bg-white">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,_#183926,_#0f261a)] font-semibold tracking-wide text-[#f0d78a]">
                  {card.icon}
                </div>
                <h3 className="mt-6 font-display text-3xl text-[#123524]">{card.title}</h3>
                <p className="mt-3 text-base leading-7 text-black/68">{card.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-y border-black/10 bg-[linear-gradient(180deg,_#f4efe4_0%,_#fbf9f4_100%)]">
          <div className="container py-16 md:py-20">
            <div className="mb-8 max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-jade">会员空间预览 · Inside</p>
              <h2 className="mt-3 font-display text-4xl text-[#123524] md:text-5xl">加入之前，先看看会员空间长什么样</h2>
              <p className="mt-3 text-sm text-black/60">{previewNotice}</p>
            </div>
            <div className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
              <div className="overflow-hidden rounded-[36px] border border-black/10 bg-[linear-gradient(180deg,_#173826_0%,_#0f261a_100%)] p-4 shadow-xl">
                <div className="rounded-[28px] border border-white/10 bg-[#102116] p-3">
                  <Image
                    src="/dashboard-preview.svg"
                    alt="MetaEnergy member dashboard preview"
                    width={1440}
                    height={980}
                    className="h-auto w-full rounded-[22px]"
                    priority
                  />
                </div>
              </div>
              <div className="grid gap-4">
                <div className="rounded-[32px] border border-black/10 bg-white p-6">
                  <p className="text-xs uppercase tracking-[0.3em] text-jade">How it feels</p>
                  <p className="mt-3 font-display text-4xl text-[#123524]">少一点系统感，多一点真实进展。</p>
                  <p className="mt-4 text-base leading-7 text-black/68">
                    会员体验以清晰、安定、容易理解为前提。加入之后，你可以更轻松地查看自己的节奏、参与内容与回馈变化。
                  </p>
                </div>
                <div className="rounded-[32px] border border-[#d4a940]/20 bg-[linear-gradient(180deg,_#fff8e5_0%,_#f7eed1_100%)] p-6">
                  <p className="text-xs uppercase tracking-[0.3em] text-[#8a6a19]">真实感表达 · Social Proof</p>
                  <p className="mt-3 font-display text-4xl text-[#123524]">让成长与累积更可信，也更可见</p>
                  <p className="mt-4 text-base leading-7 text-black/68">
                    不只是数字增长，而是更稳定的参与感、更清楚的节奏感，以及逐步解锁的会员礼遇。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="container py-16 md:py-20">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-jade">本月动态 · This Month</p>
              <h2 className="mt-3 font-display text-4xl text-[#123524] md:text-5xl">活动、上新与本月会员礼遇</h2>
            </div>
            <Link href="/register" className="rounded-full bg-[#123524] px-6 py-3 text-sm font-semibold text-white">
              本月加入会员
            </Link>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            {currentMonthAnnouncements.map((item) => (
              <div key={item.id} className="card border-black/5 bg-white">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#b38924]">{item.monthLabel}</p>
                  <span className="rounded-full bg-[#f7eed1] px-3 py-1 text-xs font-semibold text-[#8a6a19]">{item.badge}</span>
                </div>
                <h3 className="mt-4 font-display text-3xl text-[#123524]">{item.title}</h3>
                <p className="mt-3 text-base leading-7 text-black/68">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-t border-black/10 bg-[#faf7ef]">
          <div className="container py-14 md:py-16">
            <div className="mx-auto max-w-4xl rounded-[32px] border border-black/10 bg-white p-6 md:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-jade">Core reward rules</p>
              <p className="mt-3 font-display text-4xl text-[#123524]">核心规则，用更温和清楚的方式说明</p>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-black/62">
                大多数人先看整体感觉就够了。等你准备好再往下看，完整规则已经整理成更容易理解的版本。
              </p>
              <div className="mt-6">
                <FaqAccordion items={faqItems} />
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
