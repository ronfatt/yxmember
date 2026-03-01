import Image from "next/image";
import Link from "next/link";
import FaqAccordion from "../components/FaqAccordion";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import { currentMonthAnnouncements } from "../lib/metaenergy/announcements";

const valueCards = [
  {
    icon: "RM",
    title: "Earn While You Share",
    description: "Unlock up to 25% referral rewards as your community grows with you."
  },
  {
    icon: "FX",
    title: "Experience & Grow",
    description: "Personal frequency reports, weekly reminders, and guided tools for everyday alignment."
  },
  {
    icon: "PT",
    title: "Get Rewarded",
    description: "Earn points on every purchase and redeem up to 50% of your next order."
  }
];

const faqItems = [
  {
    question: "How do referral rewards unlock?",
    answer:
      "Referral commission tiers unlock at RM1,000, RM3,000, and RM10,000 cumulative referred sales. The unlock is based on lifetime cumulative referred sales after any reset event."
  },
  {
    question: "Does the threshold-crossing order earn the new commission rate?",
    answer:
      "No. MetaEnergy uses strict non-retroactive reward logic. The order that crosses a threshold still uses the previous tier rate. The next referred order is the first one to use the upgraded rate."
  },
  {
    question: "What is the keep-alive rule?",
    answer:
      "Each month, a member must maintain at least RM50 in personal cash purchases. If two consecutive months fall below RM50, referral tier progress and cumulative referred sales reset to zero."
  },
  {
    question: "How do points work?",
    answer:
      "Members earn 10 points for every full RM100 of cash paid. Points can cover up to 50% of a purchase, and the remaining 50% must be paid in cash. Points cannot be exchanged for cash."
  },
  {
    question: "Who is this membership for?",
    answer:
      "It is designed for people who want a cleaner way to experience frequency tools, stay engaged through reminders, and share MetaEnergy with others while seeing their rewards and progress clearly."
  }
];

export default function HomePage() {
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
                  MetaEnergy Membership
                </span>
                <div className="space-y-4">
                  <h1 className="max-w-3xl font-display text-5xl leading-[0.95] text-white md:text-7xl">
                    Unlock your frequency.
                    <br />
                    Earn while you grow.
                  </h1>
                  <p className="max-w-2xl text-lg leading-8 text-white/72 md:text-xl">
                    Join MetaEnergy to experience frequency tools, earn referral rewards, and stay connected through one clean dashboard.
                  </p>
                </div>
                <div className="flex flex-wrap gap-4">
                  <Link
                    href="/register"
                    className="rounded-full bg-[#d4a940] px-7 py-3 text-sm font-semibold text-[#102116] transition hover:bg-[#e2bb56]"
                  >
                    Start free membership
                  </Link>
                  <a
                    href="#how-it-works"
                    className="rounded-full border border-white/20 bg-white/5 px-7 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                  >
                    How it works
                  </a>
                </div>
                <div className="grid gap-4 pt-2 md:grid-cols-2">
                  <Link
                    href="/dashboard/frequency"
                    className="rounded-3xl border border-white/10 bg-white/8 p-5 transition hover:bg-white/12"
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#f0d78a]">I want to</p>
                    <p className="mt-3 font-display text-2xl">Experience frequency tools</p>
                    <p className="mt-2 text-sm text-white/65">Reports, reminders, and practical guidance for everyday alignment.</p>
                  </Link>
                  <Link
                    href="/dashboard/referrals"
                    className="rounded-3xl border border-white/10 bg-white/8 p-5 transition hover:bg-white/12"
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#f0d78a]">I want to</p>
                    <p className="mt-3 font-display text-2xl">Earn referral rewards</p>
                    <p className="mt-2 text-sm text-white/65">Build toward stronger tiers and keep track of sales momentum clearly.</p>
                  </Link>
                </div>
              </div>

              <div className="space-y-5">
                <div className="rounded-[32px] border border-white/10 bg-white/8 p-6 shadow-2xl backdrop-blur">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.25em] text-[#f0d78a]">Member momentum</p>
                      <p className="mt-2 font-display text-3xl">A real feeling of progress</p>
                    </div>
                    <span className="rounded-full border border-[#f0d78a]/30 bg-[#f0d78a]/10 px-3 py-1 text-xs font-semibold text-[#f0d78a]">
                      Live-style preview
                    </span>
                  </div>
                  <div className="mt-6 rounded-3xl bg-[#f7f3ea] p-5 text-[#123524]">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">Member A unlocked 20% tier</span>
                      <span className="rounded-full bg-[#dff0e5] px-3 py-1 text-xs font-semibold text-[#1b5a3b]">in 2 months</span>
                    </div>
                    <div className="mt-5 space-y-4">
                      <div className="rounded-2xl border border-black/10 bg-white p-4">
                        <div className="flex items-center justify-between text-sm text-black/60">
                          <span>Current tier</span>
                          <span className="font-semibold text-[#123524]">20%</span>
                        </div>
                        <div className="mt-4 h-3 rounded-full bg-[#e7e1d4]">
                          <div className="h-3 w-[68%] rounded-full bg-[linear-gradient(90deg,_#c8a23a,_#e1c76d)]" />
                        </div>
                        <p className="mt-3 text-sm text-black/55">RM 6,800 of RM 10,000 toward the next unlock.</p>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-2xl border border-black/10 bg-white p-4">
                          <p className="text-sm text-black/55">Points balance</p>
                          <p className="mt-2 font-display text-3xl">240 pts</p>
                          <p className="mt-1 text-xs text-black/50">Up to 50% redeemable on eligible purchases.</p>
                        </div>
                        <div className="rounded-2xl border border-black/10 bg-white p-4">
                          <p className="text-sm text-black/55">Weekly focus</p>
                          <p className="mt-2 font-medium">Protect structure and follow-through</p>
                          <p className="mt-1 text-xs text-black/50">One clear move, one follow-up, one clean finish.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="rounded-[28px] border border-white/10 bg-white/6 p-5 text-sm text-white/72 backdrop-blur">
                  Frequency tools for personal growth. Referral rewards for shared momentum. One member flow that feels premium, not technical.
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="container py-16 md:py-20">
          <div className="mb-8 max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-jade">Why people join</p>
            <h2 className="mt-3 font-display text-4xl text-[#123524] md:text-5xl">Three reasons to stay close to MetaEnergy</h2>
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
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-jade">Inside the membership</p>
              <h2 className="mt-3 font-display text-4xl text-[#123524] md:text-5xl">See the dashboard before you join</h2>
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
                  <p className="mt-3 font-display text-4xl text-[#123524]">Less admin noise. More visible progress.</p>
                  <p className="mt-4 text-base leading-7 text-black/68">
                    The member experience is designed to feel calm, premium, and easy to follow. Join, explore your frequency, and understand rewards without decoding internal jargon.
                  </p>
                </div>
                <div className="rounded-[32px] border border-[#d4a940]/20 bg-[linear-gradient(180deg,_#fff8e5_0%,_#f7eed1_100%)] p-6">
                  <p className="text-xs uppercase tracking-[0.3em] text-[#8a6a19]">Social proof style</p>
                  <p className="mt-3 font-display text-4xl text-[#123524]">Visible, believable momentum</p>
                  <p className="mt-4 text-base leading-7 text-black/68">
                    Show what growth looks like: better alignment, stronger routines, and unlockable rewards that feel earned.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="container py-16 md:py-20">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-jade">This month</p>
              <h2 className="mt-3 font-display text-4xl text-[#123524] md:text-5xl">Campaigns, launches, and member moments</h2>
            </div>
            <Link href="/register" className="rounded-full bg-[#123524] px-6 py-3 text-sm font-semibold text-white">
              Join this month
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
              <p className="mt-3 font-display text-4xl text-[#123524]">Important details, presented gently</p>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-black/62">
                Most people only need the overview first. When they are ready, the full rules are here in a cleaner, easier format.
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
