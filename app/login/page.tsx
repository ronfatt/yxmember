import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";
import LoginForm from "../../components/LoginForm";
import { t } from "../../lib/i18n/shared";
import { getCurrentLanguage } from "../../lib/i18n/server";

export default async function LoginPage() {
  const language = await getCurrentLanguage();

  return (
    <div className="min-h-screen overflow-hidden bg-[#f6f1e8]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -right-32 -top-40 h-[560px] w-[560px] rounded-full bg-[radial-gradient(circle_at_center,rgba(200,165,92,0.24),transparent_60%)]" />
        <div className="absolute -bottom-52 -left-44 h-[660px] w-[660px] rounded-full bg-[radial-gradient(circle_at_center,rgba(15,47,37,0.14),transparent_60%)]" />
        <div className="absolute inset-0 opacity-[0.05] bg-[linear-gradient(90deg,rgba(0,0,0,0.16)_1px,transparent_1px),linear-gradient(rgba(0,0,0,0.16)_1px,transparent_1px)] bg-[size:72px_72px]" />
      </div>
      <SiteHeader />
      <main className="container relative py-20 md:py-[120px]">
        <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="lg:pr-14">
            <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(200,165,92,0.28)] bg-white/70 px-4 py-2 backdrop-blur">
              <span className="text-xs font-semibold tracking-[0.28em] text-[#0f2f24]">
                {t(language, { zh: "元象能量会员系统", en: "MetaEnergy Member System" })}
              </span>
              <span className="h-1 w-1 rounded-full bg-[#c9a227]" />
              <span className="text-xs text-black/60">{t(language, { zh: "会员登入", en: "Member Access" })}</span>
            </div>

            <h1 className="mt-8 font-display text-5xl leading-[1.08] text-[#0f2f25] md:text-6xl">
              {t(language, { zh: "登入你的专属空间", en: "Enter your private member space" })}
              <span className="mt-4 block font-accent text-3xl font-medium text-black/72 md:text-4xl">
                {t(language, { zh: "在安定之中，看见你的积累与回馈", en: "A calmer place for progress, rhythm, and return" })}
              </span>
            </h1>

            <p className="mt-8 max-w-2xl text-base leading-9 text-black/66">
              {t(language, {
                zh: "成为会员后，你将进入一个更静、更专注的能量空间。这里记录你的成长轨迹、专属礼遇与每一次参与的回响。一切都以长期与稳态为核心，而非短暂的刺激。",
                en: "After joining, you enter a quieter, more intentional member space where your participation, rewards, and growth stay visible over time."
              })}
            </p>

            <div className="mt-12 grid gap-6 sm:grid-cols-3">
              {[
                {
                  title: t(language, { zh: "会员礼遇", en: "Member Privileges" }),
                  detail: t(language, {
                    zh: "专属回馈机制，在稳定与长期中逐步解锁更高层级",
                    en: "A reward structure designed to unlock gradually through steady participation."
                  })
                },
                {
                  title: t(language, { zh: "能量积分积累", en: "Energy Points" }),
                  detail: t(language, {
                    zh: "每一次参与，都被温和地记录与回馈",
                    en: "Every purchase and interaction can be recorded and rewarded."
                  })
                },
                {
                  title: t(language, { zh: "频率档案与提醒", en: "Frequency Tools" }),
                  detail: t(language, {
                    zh: "为你的节奏与方向，保留清晰与安定",
                    en: "Keep your rhythm, guidance, and reminders in one calm place."
                  })
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-[30px] border border-[rgba(200,165,92,0.18)] bg-white/72 p-6 shadow-[0_18px_40px_rgba(0,0,0,0.04)] backdrop-blur"
                >
                  <div className="font-display text-xl leading-tight text-[#0f2f25]">{item.title}</div>
                  <div className="mt-3 text-sm leading-7 text-black/60">{item.detail}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="flex justify-center lg:justify-end">
            <LoginForm language={language} />
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
