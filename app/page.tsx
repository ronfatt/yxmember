import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import type { Metadata } from "next";
import FaqAccordion from "../components/FaqAccordion";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import { currentMonthAnnouncements } from "../lib/metaenergy/announcements";
import { t } from "../lib/i18n/shared";
import { getCurrentLanguage } from "../lib/i18n/server";
import { createPublicMetadata } from "../lib/metaenergy/seo";
import { getSiteUrl } from "../lib/metaenergy/site-url";

export const metadata: Metadata = createPublicMetadata(
  "元象能量会员系统",
  "为长期体验而设计的成长空间，整合会员、课程活动、导师会谈、推荐回馈与稳定参与结构。",
  "/"
);

export default function HomePage() {
  const language = getCurrentLanguage();
  const siteUrl = getSiteUrl().toString();
  const valueCards = [
    {
      icon: "RM",
      title: t(language, { zh: "分享之上，回响自生", en: "Resonance follows trust" }),
      description: t(language, {
        zh: "当信任被认真对待，回馈只是时间的问题。引荐不是推销，而是一种价值的传递。",
        en: "When trust is treated with care, return becomes a matter of time. Referral is not selling. It is the passing on of value."
      })
    },
    {
      icon: "FX",
      title: t(language, { zh: "在体验中，稳步看见自己", en: "See yourself through experience" }),
      description: t(language, {
        zh: "频率报告与节奏提醒，不是管理工具，而是一种对生活的校准。你不会被催促，只会被陪伴。",
        en: "Frequency reports and rhythm reminders are not management tools. They are a gentler way to recalibrate life."
      })
    },
    {
      icon: "PT",
      title: t(language, { zh: "参与，是长期关系的开始", en: "Participation begins the relationship" }),
      description: t(language, {
        zh: "每一次消费、每一次到访，都在为下一次更好的体验铺路。积分只是记录，真正累积的是你与空间的关系。",
        en: "Each purchase and each visit prepares the ground for a better next experience. Points are only the record."
      })
    }
  ];
  const faqItems = [
    {
      question: t(language, { zh: "引荐回馈是如何解锁的？", en: "How do referral rewards unlock?" }),
      answer: t(language, {
        zh: "当你的引荐累计消费达到 RM1,000 后，回馈比例将被激活。在 RM3,000 与 RM10,000 时，比例将逐步提升。只要每月维持最低活跃标准，已解锁比例将长期保留。",
        en: "Referral rewards activate after RM1,000 in cumulative referred sales, then rise again at RM3,000 and RM10,000."
      })
    },
    {
      question: t(language, { zh: "若中断活跃会发生什么？", en: "What happens if activity drops?" }),
      answer: t(language, {
        zh: "若连续两个月未达到最低活跃标准，系统将重新计算你的引荐累计。我们更重视持续参与，而非一次性的爆发。",
        en: "If activity falls below the minimum for two consecutive months, cumulative referral progress resets. Continuity matters more than one-time bursts."
      })
    },
    {
      question: t(language, { zh: "积分如何被合理使用？", en: "How are points used?" }),
      answer: t(language, {
        zh: "积分可用于抵扣部分消费金额，单笔订单最高可抵扣 50%。这意味着，每一次使用，仍保留真实的参与。",
        en: "Points can offset part of a purchase, up to 50% of each order, while preserving real paid participation."
      })
    },
    {
      question: t(language, { zh: "这套结构适合什么样的人？", en: "Who is this structure for?" }),
      answer: t(language, {
        zh: "适合愿意长期参与的人。适合相信稳定节奏的人。适合把“关系”看得比“收益”更重要的人。如果你只是寻找短期套利，这里并不适合你。",
        en: "It suits people who value long-term participation, steady rhythm, and relationship over short-term gain."
      })
    }
  ];
  const softPreviewLabel = t(language, { zh: "会员空间 · 预览界面", en: "Member Space · Preview UI" });
  const softPreviewNotice = t(language, {
    zh: "仅展示结构与层级逻辑，真实数据将在登录后呈现。",
    en: "This shows structure and hierarchy only. Actual data appears after login."
  });
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        name: "元象能量会员系统",
        alternateName: "MetaEnergy",
        url: siteUrl,
        logo: `${siteUrl}/opengraph-image`,
        description: "为长期体验而设计的成长空间，整合会员、课程活动、导师会谈、推荐回馈与稳定参与结构。"
      },
      {
        "@type": "WebSite",
        name: "元象能量会员系统",
        url: siteUrl,
        inLanguage: ["zh-CN", "en"]
      },
      {
        "@type": "FAQPage",
        mainEntity: faqItems.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer
          }
        }))
      }
    ]
  };

  return (
    <div className="min-h-screen bg-[#f6f1e8]">
      <Script id="home-structured-data" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
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
                      zh: "元象能量会员系统。为长期体验而设计的成长空间。不是积分工具，而是一种稳定关系的结构。",
                      en: "A private member space designed for long-term experience, not just rewards."
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
                    {t(language, { zh: "申请加入", en: "Apply to Join" })}
                  </Link>
                  <a
                    href="#how-it-works"
                    className="rounded-full border border-white/20 bg-white/5 px-7 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                  >
                    {t(language, { zh: "了解结构", en: "Explore the Structure" })}
                  </a>
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
            <p className="font-accent text-sm tracking-[0.18em] text-[#8d7240]">{t(language, { zh: "空间理念", en: "Why People Stay" })}</p>
            <h2 className="mt-5 font-display text-4xl leading-tight text-[#0f2f25] md:text-5xl">{t(language, { zh: "为什么有人选择长期留在这里？", en: "Why do people choose to stay here over time?" })}</h2>
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
                  <p className="mt-4 font-display text-4xl leading-tight text-[#0f2f25]">{t(language, { zh: "少一点系统感，多一点真实进展。", en: "Less system feel. More visible progress." })}</p>
                  <p className="mt-5 text-base leading-8 text-black/68">
                    {t(language, {
                      zh: "你将清楚看见：当前层级、回馈比例、积分余额与本周节奏提醒。一切变化，都有迹可循。",
                      en: "You will see your tier, reward structure, points, and weekly rhythm clearly."
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
              <p className="font-accent text-sm tracking-[0.18em] text-[#8d7240]">{t(language, { zh: "本月 · 空间动向", en: "This Month" })}</p>
              <h2 className="mt-5 font-display text-4xl leading-tight text-[#0f2f25] md:text-5xl">{t(language, { zh: "新的体验正在展开。", en: "New experiences are unfolding." })}</h2>
            </div>
            <Link href="/register" className="rounded-full bg-[#123524] px-6 py-3 text-sm font-semibold text-white">
              {t(language, { zh: "申请加入", en: "Apply to Join" })}
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
              <p className="mt-5 font-display text-4xl leading-tight text-[#0f2f25]">{t(language, { zh: "在决定加入之前，我们希望你理解它如何运作。", en: "Before joining, we hope you understand how it works." })}</p>
              <p className="mt-4 max-w-2xl text-sm leading-8 text-black/62">
                {t(language, {
                  zh: "这些规则不是为了制造压力，而是为了让回馈、节奏与长期参与之间，保有一套清楚而稳定的关系。",
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
                      question: t(language, { zh: "若中断活跃会发生什么？", en: faqItems[1]?.question ?? "" }),
                      answer: faqItems[1]?.answer ?? ""
                    },
                    {
                      question: t(language, { zh: "积分如何被合理使用？", en: faqItems[2]?.question ?? "" }),
                      answer: faqItems[2]?.answer ?? ""
                    },
                    {
                      question: t(language, { zh: "这套结构适合什么样的人？", en: faqItems[3]?.question ?? "" }),
                      answer: faqItems[3]?.answer ?? ""
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
