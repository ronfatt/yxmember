import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";
import LoginForm from "../../components/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen overflow-hidden bg-[#f7f3ea]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -right-32 -top-40 h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle_at_center,rgba(201,162,39,0.28),transparent_60%)]" />
        <div className="absolute -bottom-52 -left-44 h-[620px] w-[620px] rounded-full bg-[radial-gradient(circle_at_center,rgba(15,47,36,0.16),transparent_60%)]" />
        <div className="absolute inset-0 opacity-[0.07] bg-[linear-gradient(90deg,rgba(0,0,0,0.18)_1px,transparent_1px),linear-gradient(rgba(0,0,0,0.18)_1px,transparent_1px)] bg-[size:64px_64px]" />
      </div>
      <SiteHeader />
      <main className="container relative py-14">
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="lg:pr-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(201,162,39,0.35)] bg-white/65 px-4 py-2 backdrop-blur">
              <span className="text-xs font-semibold tracking-[0.28em] text-[#0f2f24]">元象 MetaEnergy</span>
              <span className="h-1 w-1 rounded-full bg-[#c9a227]" />
              <span className="text-xs text-black/60">Member Access</span>
            </div>

            <h1 className="mt-6 font-display text-4xl leading-tight text-[#0f2f24] md:text-5xl">
              登入你的會員中心
              <span className="mt-3 block text-2xl font-medium text-black/75 md:text-3xl">
                佣金、積分、頻率工具，一個面板搞定
              </span>
            </h1>

            <p className="mt-5 max-w-xl text-base leading-7 text-black/68">
              免費會員即可查看引薦進度、積分餘額與最新會員內容，並持續累積你的 MetaEnergy 成長紀錄。
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[
                { title: "引薦獎勵", detail: "達標解鎖，最高 25%" },
                { title: "積分回饋", detail: "每筆消費累積，最多抵扣 50%" },
                { title: "頻率工具", detail: "個人報告與每週提醒" },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-[24px] border border-[rgba(201,162,39,0.22)] bg-white/62 p-4 shadow-[0_16px_38px_rgba(0,0,0,0.05)] backdrop-blur"
                >
                  <div className="text-sm font-semibold text-[#0f2f24]">{item.title}</div>
                  <div className="mt-1 text-xs leading-5 text-black/62">{item.detail}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="flex justify-center lg:justify-end">
            <LoginForm />
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
