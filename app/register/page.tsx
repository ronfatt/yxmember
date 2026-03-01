import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";
import RegisterForm from "../../components/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="min-h-screen overflow-hidden bg-[#f7f3ea]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-36 -top-44 h-[560px] w-[560px] rounded-full bg-[radial-gradient(circle_at_center,rgba(15,47,36,0.18),transparent_60%)]" />
        <div className="absolute -bottom-56 right-[-120px] h-[620px] w-[620px] rounded-full bg-[radial-gradient(circle_at_center,rgba(201,162,39,0.24),transparent_60%)]" />
        <div className="absolute inset-0 opacity-[0.07] bg-[linear-gradient(90deg,rgba(0,0,0,0.18)_1px,transparent_1px),linear-gradient(rgba(0,0,0,0.18)_1px,transparent_1px)] bg-[size:64px_64px]" />
      </div>
      <SiteHeader />
      <main className="container relative py-14">
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="lg:pr-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(201,162,39,0.35)] bg-white/65 px-4 py-2 backdrop-blur">
              <span className="text-xs font-semibold tracking-[0.28em] text-[#0f2f24]">元象能量会员系统</span>
              <span className="h-1 w-1 rounded-full bg-[#c9a227]" />
              <span className="text-xs text-black/60">Free Membership</span>
            </div>

            <h1 className="mt-6 font-display text-4xl leading-tight text-[#0f2f24] md:text-5xl">
              建立你的會員帳號
              <span className="mt-3 block text-2xl font-medium text-black/75 md:text-3xl">
                先加入，再開啟引薦、積分與個人頻率工具
              </span>
            </h1>

            <p className="mt-5 max-w-xl text-base leading-7 text-black/68">
              註冊後即可建立個人頻率檔案、接收每週提醒、查看活動內容，並在符合條件後累積會員獎勵與推薦進度。
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[
                { title: "免費開始", detail: "Email 註冊即可開通會員檔案" },
                { title: "推薦自動綁定", detail: "帶推薦碼註冊會自動掛上上線" },
                { title: "內容持續更新", detail: "活動、提醒、報告集中查看" },
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
            <RegisterForm />
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
