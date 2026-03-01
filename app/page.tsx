import Link from "next/link";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";

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

const dashboardCards = [
  {
    eyebrow: "Dashboard overview",
    title: "One clean member home",
    body: "Referral progress, points balance, keep-alive status, and weekly guidance in one place."
  },
  {
    eyebrow: "Points balance",
    title: "Spend and redeem clearly",
    body: "See how many points you have, how much cash is still required, and what each order earned."
  },
  {
    eyebrow: "Tier progress",
    title: "See momentum visually",
    body: "Track current commission tier and cumulative referred sales without guessing where you stand."
  }
];

const campaigns = [
  {
    label: "Double points campaign",
    copy: "Members who complete one paid order this month unlock a boosted points week."
  },
  {
    label: "New essential oil launch",
    copy: "Early members get first access to the next product release and guided usage notes."
  },
  {
    label: "Member sharing night",
    copy: "A simple community session for stories, wins, and frequency practice in real life."
  }
];

const faqRules = [
  "Referral commission tiers unlock at RM1,000, RM3,000, and RM10,000 cumulative referred sales.",
  "The order that crosses a threshold still uses the previous commission rate.",
  "Two consecutive months below RM50 personal cash spend reset referral progress.",
  "Points can cover up to 50% of an order and are not cashable."
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
              <div className="rounded-[36px] border border-black/10 bg-[linear-gradient(180deg,_#173826_0%,_#0f261a_100%)] p-6 text-white shadow-xl">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-[#f0d78a]">Preview</p>
                    <p className="mt-2 font-display text-3xl">Member dashboard mock</p>
                  </div>
                  <span className="rounded-full border border-white/10 bg-white/8 px-3 py-1 text-xs">Overview</span>
                </div>
                <div className="mt-6 grid gap-4 lg:grid-cols-[0.9fr,1.1fr]">
                  <div className="space-y-4">
                    <div className="rounded-3xl bg-white/8 p-5">
                      <p className="text-sm text-white/65">Referral code</p>
                      <p className="mt-2 font-display text-4xl text-[#f0d78a]">RONFAT</p>
                      <p className="mt-1 text-xs text-white/55">Ready to share in one tap.</p>
                    </div>
                    <div className="rounded-3xl bg-white/8 p-5">
                      <p className="text-sm text-white/65">Points balance</p>
                      <p className="mt-2 font-display text-4xl">240 pts</p>
                      <p className="mt-1 text-xs text-white/55">Redeemable up to half of the next order.</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {dashboardCards.map((card) => (
                      <div key={card.title} className="rounded-3xl bg-[#f7f3ea] p-5 text-[#123524]">
                        <p className="text-xs uppercase tracking-[0.2em] text-black/45">{card.eyebrow}</p>
                        <p className="mt-2 font-display text-3xl">{card.title}</p>
                        <p className="mt-2 text-sm leading-6 text-black/63">{card.body}</p>
                      </div>
                    ))}
                  </div>
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
            {campaigns.map((item) => (
              <div key={item.label} className="card border-black/5 bg-white">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#b38924]">Featured</p>
                <h3 className="mt-4 font-display text-3xl text-[#123524]">{item.label}</h3>
                <p className="mt-3 text-base leading-7 text-black/68">{item.copy}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-t border-black/10 bg-[#faf7ef]">
          <div className="container py-14 md:py-16">
            <div className="mx-auto max-w-4xl rounded-[32px] border border-black/10 bg-white p-6 md:p-8">
              <details>
                <summary className="cursor-pointer list-none text-left">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-jade">Core reward rules</p>
                  <p className="mt-3 font-display text-4xl text-[#123524]">The important rules, tucked neatly at the bottom</p>
                </summary>
                <div className="mt-6 grid gap-3">
                  {faqRules.map((rule) => (
                    <div key={rule} className="rounded-2xl border border-black/10 bg-[#f8f6f2] px-4 py-4 text-sm leading-6 text-black/67">
                      {rule}
                    </div>
                  ))}
                </div>
              </details>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
