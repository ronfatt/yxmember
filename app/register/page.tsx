import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";
import RegisterForm from "../../components/RegisterForm";
import { t } from "../../lib/i18n/shared";
import { getCurrentLanguage } from "../../lib/i18n/server";

export default function RegisterPage() {
  const language = getCurrentLanguage();

  return (
    <div className="min-h-screen overflow-hidden bg-[#f6f1e8]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-36 -top-44 h-[620px] w-[620px] rounded-full bg-[radial-gradient(circle_at_center,rgba(15,47,37,0.16),transparent_60%)]" />
        <div className="absolute -bottom-56 right-[-120px] h-[660px] w-[660px] rounded-full bg-[radial-gradient(circle_at_center,rgba(200,165,92,0.24),transparent_60%)]" />
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
              <span className="text-xs text-black/60">{t(language, { zh: "会员注册", en: "Member Registration" })}</span>
            </div>

            <h1 className="mt-8 font-display text-5xl leading-[1.08] text-[#0f2f25] md:text-6xl">
              {t(language, { zh: "开启你的会员旅程", en: "Begin your membership journey" })}
              <span className="mt-4 block font-accent text-3xl font-medium text-black/72 md:text-4xl">
                {t(language, {
                  zh: "在更安定的节奏里，开始累积你的参与与回响",
                  en: "Start building your participation, profile, and rewards through a steadier rhythm"
                })}
              </span>
            </h1>

            <p className="mt-8 max-w-2xl text-base leading-9 text-black/66">
              {t(language, {
                zh: "加入之后，你将拥有属于自己的会员空间。这里会记录你的频率档案、专属提醒、参与轨迹与逐步展开的会员礼遇。",
                en: "Once you join, your member space keeps your frequency profile, reminders, participation history, and benefits in one place."
              })}
            </p>

            <div className="mt-12 grid gap-6 sm:grid-cols-3">
              {[
                {
                  title: t(language, { zh: "轻松加入", en: "Simple Entry" }),
                  detail: t(language, {
                    zh: "使用 Email 即可建立你的专属会员档案",
                    en: "Create your member account with email and start immediately."
                  })
                },
                {
                  title: t(language, { zh: "关系自动绑定", en: "Referral Linking" }),
                  detail: t(language, {
                    zh: "带推荐码注册时，系统会自动挂上引荐关系",
                    en: "Referral codes are attached automatically when present."
                  })
                },
                {
                  title: t(language, { zh: "内容持续更新", en: "Ongoing Content" }),
                  detail: t(language, {
                    zh: "活动、提醒与报告都会集中留在这里",
                    en: "Reports, reminders, and campaign updates stay visible here."
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
            <RegisterForm language={language} />
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
