import Image from "next/image";
import Link from "next/link";
import FaqAccordion from "../components/FaqAccordion";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import { currentMonthAnnouncements } from "../lib/metaenergy/announcements";
import { t } from "../lib/i18n/shared";
import { getCurrentLanguage } from "../lib/i18n/server";

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
  const softPreviewLabel = t(language, { zh: "会员空间 · 预览界面", en: "Member Space · Preview UI" });
  const softPreviewNotice = t(language, {
    zh: "仅展示结构与层级逻辑，真实数据将在登录后呈现。",
    en: "This shows structure and hierarchy only. Actual data appears after login."
  });

  return (
    <div className="min-h-screen bg-[#f6f1e8]">
      <SiteHeader />
      <main>
        <section className="relative overflow-hidden border-b border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(200,165,92,0.15),_transparent_24%),radial-gradient(circle_at_bottom_right,_rgba(74,120,91,0.22),_transparent_26%),linear-gradient(135deg,_#0f2f25_0%,_#17382e_42%,_#0a1712_100%)] text-white">
          <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:48px_48px]" />
          <div className="absolute left-[-8rem] top-[-3rem] h-72 w-72 rounded-full bg-[#c8a55c]/18 blur-3xl" />
          <div className="absolute bottom-[-5rem] right-[-5rem] h-80 w-80 rounded-full bg-[#2f6f4c]/24 blur-3xl" />
          <div className="container relative py-28 md:py-[140px]">
            <div className="grid gap-10 lg:grid-cols-[1.15fr,0.85fr] lg:items-center">
              <div className="space-y-7">
                <span className="inline-flex rounded-full border border-white/15 bg-white/8 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-[#ead1a0]">
                  {t(language, { zh: "元象能量会员系统 · 会员空间", en: "MetaEnergy Member System · Member Space" })}
                </span>
                <div className="space-y-6">
                  <h1 className="max-w-4xl font-display text-5xl leading-[1.08] text-white md:text-7xl">
                    {t(language, { zh: "在秩序之中，", en: "In order and stillness," })}
                    <br />
                    {t(language, { zh: "看见时间为你留下的痕迹。", en: "see what time leaves behind for you." })}
                  </h1>
                  <p className="max-w-2xl text-lg leading-9 text-white/74 md:text-xl">
                    {t(language, {
                      zh: "为长期设计的会员空间。为稳定回馈建立结构。",
                      en: "A membership space designed for long-term presence and stable rewards."
                    })}
                    <span className="mt-3 block font-accent text-lg text-white/55 md:text-xl">
                      {t(language, {
                        zh: "Designed for long-term resonance.",
                        en: "Designed for long-term resonance."
                      })}
                    </span>
                  </p>
                </div>
                <div className="flex flex-wrap gap-4">
                  <Link
                    href="/register"
                    className="champagne-gradient rounded-full px-7 py-3 text-sm font-semibold text-[#102116] shadow-[0_16px_40px_rgba(200,165,92,0.22)] transition hover:brightness-105"
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
                <div className="grid gap-5 pt-4 md:grid-cols-2">
                  <Link
                    href="/register"
                    className="rounded-[32px] border border-white/10 bg-white/7 p-6 transition hover:bg-white/12"
                  >
                    <p className="font-accent text-sm tracking-[0.18em] text-[#ead1a0]">{t(language, { zh: "体验入口", en: "Experience" })}</p>
                    <p className="mt-4 font-display text-2xl leading-tight">{t(language, { zh: "体验频率工具", en: "Experience frequency tools" })}</p>
                    <p className="mt-3 text-sm leading-7 text-white/65">
                      {t(language, { zh: "报告、提醒与日常引导。", en: "Reports, reminders, and grounded guidance." })}
                    </p>
                  </Link>
                  <Link
                    href="/register"
                    className="rounded-[32px] border border-white/10 bg-white/7 p-6 transition hover:bg-white/12"
                  >
                    <p className="font-accent text-sm tracking-[0.18em] text-[#ead1a0]">{t(language, { zh: "回馈入口", en: "Rewards" })}</p>
                    <p className="mt-4 font-display text-2xl leading-tight">{t(language, { zh: "累积引荐回馈", en: "Earn referral rewards" })}</p>
                    <p className="mt-3 text-sm leading-7 text-white/65">
                      {t(language, { zh: "清楚看见层级与业绩变化。", en: "Track tiers, sales progress, and reward momentum." })}
                    </p>
                  </Link>
                </div>
              </div>

              <div className="space-y-6">
                <div className="rounded-[36px] border border-white/10 bg-white/8 p-7 shadow-2xl backdrop-blur">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-accent text-sm tracking-[0.18em] text-[#ead1a0]">{softPreviewLabel}</p>
                      <p className="mt-3 font-display text-3xl leading-tight">{t(language, { zh: "把结构感与层级感先看清楚", en: "See the structure before the data appears" })}</p>
                    </div>
                    <span className="rounded-full border border-[#ead1a0]/25 bg-[#ead1a0]/10 px-3 py-1 text-xs font-semibold text-[#ead1a0]">
                      {softPreviewLabel}
                    </span>
                  </div>
                  <p className="mt-5 text-sm leading-7 text-white/68">{softPreviewNotice}</p>
                  <div className="mt-7 rounded-[30px] bg-[#f7f3ea] p-6 text-[#123524]">
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
                          <div className="champagne-gradient h-3 w-[68%] rounded-full" />
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
                  {t(language, {
                    zh: "这里展示的不是结果，而是一种秩序感。真实数据属于登录后的个人空间，公开页只负责让你看见结构。",
                    en: "This section shows structure, not personal data. Actual member information appears only after login."
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="container py-28 md:py-[120px]">
          <div className="mb-8 max-w-2xl">
            <p className="font-accent text-sm tracking-[0.18em] text-[#8d7240]">{t(language, { zh: "会员价值", en: "Member Value" })}</p>
            <h2 className="mt-5 font-display text-4xl leading-tight text-[#0f2f25] md:text-5xl">{t(language, { zh: "真正值得慢慢留下来的三种感受", en: "Three reasons people stay close over time" })}</h2>
          </div>
          <div className="grid gap-10 lg:grid-cols-3">
            {valueCards.map((card) => (
              <div key={card.title} className="overflow-hidden rounded-[34px] border border-black/5 bg-white/92 p-8 shadow-[0_20px_40px_rgba(0,0,0,0.04)]">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,_#183926,_#0f261a)] font-semibold tracking-wide text-[#ead1a0]">
                  {card.icon}
                </div>
                <h3 className="mt-8 font-display text-3xl leading-tight text-[#0f2f25]">
                  {card.icon === "RM"
                    ? t(language, { zh: "分享之上，回响自生", en: card.title })
                    : card.icon === "FX"
                      ? t(language, { zh: "在体验中，稳步看见自己", en: card.title })
                      : t(language, { zh: "参与，是长期关系的开始", en: card.title })}
                </h3>
                <p className="mt-4 text-base leading-8 text-black/66">
                  {card.icon === "RM"
                    ? t(language, { zh: "当信任被认真对待，回馈只是时间问题。", en: card.description })
                    : card.icon === "FX"
                      ? t(language, { zh: "频率报告与节奏提醒，不是管理，而是陪伴。", en: card.description })
                      : t(language, { zh: "每一次选择，都在为下一次更好的体验铺路。", en: card.description })}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-y border-black/10 bg-[linear-gradient(180deg,_#f4eee4_0%,_#fbf8f1_100%)]">
          <div className="container py-28 md:py-[120px]">
            <div className="mb-8 max-w-2xl">
              <p className="font-accent text-sm tracking-[0.18em] text-[#8d7240]">{softPreviewLabel}</p>
              <h2 className="mt-5 font-display text-4xl leading-tight text-[#0f2f25] md:text-5xl">{t(language, { zh: "加入之前，先看看会员空间长什么样", en: "See the member space before you join" })}</h2>
              <p className="mt-4 text-sm leading-7 text-black/60">{softPreviewNotice}</p>
            </div>
            <div className="grid gap-10 lg:grid-cols-[1.1fr,0.9fr]">
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
              <div className="grid gap-6">
                <div className="rounded-[34px] border border-black/10 bg-white p-8">
                  <p className="font-accent text-sm tracking-[0.18em] text-[#8d7240]">{t(language, { zh: "空间感", en: "Atmosphere" })}</p>
                  <p className="mt-4 font-display text-4xl leading-tight text-[#0f2f25]">{t(language, { zh: "少一点系统感，多一点静静展开的秩序。", en: "Less dashboard noise. More composed structure." })}</p>
                  <p className="mt-5 text-base leading-8 text-black/68">
                    {t(language, {
                      zh: "这里不是为了制造刺激，而是为了让你的节奏、参与与回馈，被更安定地看见。",
                      en: "The space is designed to reveal rhythm, participation, and rewards without feeling transactional."
                    })}
                  </p>
                </div>
                <div className="rounded-[34px] border border-[#c8a55c]/18 bg-[linear-gradient(180deg,_#fff8eb_0%,_#f7eed8_100%)] p-8">
                  <p className="font-accent text-sm tracking-[0.18em] text-[#8a6a19]">{t(language, { zh: "真实感", en: "Credibility" })}</p>
                  <p className="mt-4 font-display text-4xl leading-tight text-[#0f2f25]">{t(language, { zh: "让成长与累积更可信，也更可见", en: "Make progress feel credible and visible" })}</p>
                  <p className="mt-5 text-base leading-8 text-black/68">
                    {t(language, {
                      zh: "真正重要的不是数字本身，而是它背后更稳定的参与关系与长期回响。",
                      en: "What matters is not the metric alone, but the relationship and continuity behind it."
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="container py-28 md:py-[120px]">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-2xl">
              <p className="font-accent text-sm tracking-[0.18em] text-[#8d7240]">{t(language, { zh: "本月动态", en: "This Month" })}</p>
              <h2 className="mt-5 font-display text-4xl leading-tight text-[#0f2f25] md:text-5xl">{t(language, { zh: "活动、上新与本月会员礼遇", en: "Campaigns, launches, and member moments" })}</h2>
            </div>
            <Link href="/register" className="rounded-full bg-[#123524] px-6 py-3 text-sm font-semibold text-white">
              {t(language, { zh: "本月加入会员", en: "Join this month" })}
            </Link>
          </div>
          <div className="grid gap-10 lg:grid-cols-3">
            {currentMonthAnnouncements.map((item) => (
              <div key={item.id} className="rounded-[34px] border border-black/5 bg-white p-8 shadow-[0_20px_40px_rgba(0,0,0,0.04)]">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#b38924]">{item.monthLabel[language]}</p>
                  <span className="rounded-full bg-[#f7eed1] px-3 py-1 text-xs font-semibold text-[#8a6a19]">{item.badge[language]}</span>
                </div>
                <h3 className="mt-4 font-display text-3xl text-[#123524]">{item.title[language]}</h3>
                <p className="mt-3 text-base leading-7 text-black/68">{item.description[language]}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-t border-black/10 bg-[#faf7ef]">
          <div className="container py-28 md:py-[120px]">
            <div className="mx-auto max-w-4xl rounded-[36px] border border-black/10 bg-white p-8 md:p-10">
              <p className="font-accent text-sm tracking-[0.18em] text-[#8d7240]">{t(language, { zh: "会员结构说明", en: "Member Structure" })}</p>
              <p className="mt-5 font-display text-4xl leading-tight text-[#0f2f25]">{t(language, { zh: "在加入之前，我们希望你先理解规则。", en: "Before joining, we want you to understand the structure." })}</p>
              <p className="mt-4 max-w-2xl text-sm leading-8 text-black/62">
                {t(language, {
                  zh: "这些规则不是为了制造压力，而是为了让回馈、节奏与长期参与之间，有一套清楚而稳定的关系。",
                  en: "These rules are designed to create clarity and continuity, not pressure."
                })}
              </p>
              <div className="mt-6">
                <FaqAccordion
                  items={[
                    {
                      question: t(language, { zh: "引荐回馈如何形成？", en: faqItems[0]?.question ?? "" }),
                      answer: faqItems[0]?.answer ?? ""
                    },
                    {
                      question: t(language, { zh: "刚跨越门槛是否即时生效？", en: faqItems[1]?.question ?? "" }),
                      answer: faqItems[1]?.answer ?? ""
                    },
                    {
                      question: t(language, { zh: "维持资格需要注意什么？", en: faqItems[2]?.question ?? "" }),
                      answer: faqItems[2]?.answer ?? ""
                    },
                    {
                      question: t(language, { zh: "积分如何被合理使用？", en: faqItems[3]?.question ?? "" }),
                      answer: faqItems[3]?.answer ?? ""
                    },
                    {
                      question: t(language, { zh: "这套结构适合什么样的人？", en: faqItems[4]?.question ?? "" }),
                      answer: faqItems[4]?.answer ?? ""
                    }
                  ]}
                />
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
