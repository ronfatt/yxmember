import Link from "next/link";
import { requireAdmin } from "../../lib/actions/session";
import { t } from "../../lib/i18n/shared";
import { getCurrentLanguage } from "../../lib/i18n/server";

export default async function AdminIndex() {
  await requireAdmin();
  const language = getCurrentLanguage();
  const items = [
    {
      href: "/admin/appointments",
      eyebrow: t(language, { zh: "导师会谈", en: "Guidance sessions" }),
      title: t(language, { zh: "预约后台", en: "Appointments desk" }),
      description: t(language, {
        zh: "管理导师会谈预约，确认时段、记账付款，并处理取消。",
        en: "Manage mentor appointments, confirm slots, settle payment, and handle cancellations."
      })
    },
    {
      href: "/admin/mentors",
      eyebrow: t(language, { zh: "导师与时段", en: "Mentors and schedules" }),
      title: t(language, { zh: "导师设置", en: "Mentor setup" }),
      description: t(language, {
        zh: "维护导师资料、服务时长和每周开放时段。",
        en: "Maintain mentor profiles, services, and weekly availability."
      })
    },
    {
      href: "/admin/orders",
      eyebrow: t(language, { zh: "订单与冲正", en: "Orders and reversals" }),
      title: t(language, { zh: "订单后台", en: "Order desk" }),
      description: t(language, {
        zh: "创建订单、检查推荐归因、查看佣金记录，并处理冲正。",
        en: "Create orders, inspect referral attribution, review commissions, and handle reversals."
      })
    },
    {
      href: "/admin/relationships",
      eyebrow: t(language, { zh: "上下线关系", en: "Referral relationships" }),
      title: t(language, { zh: "关系后台", en: "Relationship desk" }),
      description: t(language, {
        zh: "查看每位会员的上级与下线，并在需要时修正关系。",
        en: "Review uplines and downlines and update relationships when needed."
      })
    },
    {
      href: "/dashboard",
      eyebrow: t(language, { zh: "返回会员空间", en: "Back to dashboard" }),
      title: t(language, { zh: "会员中心", en: "Member dashboard" }),
      description: t(language, {
        zh: "回到你的会员视角，查看实际佣金、积分与提醒内容。",
        en: "Return to the member view to see commissions, points, and reminders."
      })
    }
  ];

  return (
    <section className="space-y-8">
      <div className="max-w-3xl space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8d7240]">
          {t(language, { zh: "后台入口", en: "Admin portal" })}
        </p>
        <h2 className="font-display text-5xl leading-tight text-[#123524]">
          {t(language, { zh: "从这里进入后台，不再和会员入口混在一起。", en: "Enter the admin side from here, separately from the member area." })}
        </h2>
        <p className="max-w-2xl text-base leading-8 text-black/62">
          {t(language, {
            zh: "后台只处理运营动作。会员中心只看个人资料、积分、频率与推荐进度。两个入口现在已经分开。",
            en: "The admin side is for operations only. The member dashboard stays focused on personal activity and rewards."
          })}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-[30px] border border-black/10 bg-white p-8 shadow-[0_18px_36px_rgba(0,0,0,0.04)] transition hover:-translate-y-0.5 hover:border-[#c8a55c]/35"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8d7240]">{item.eyebrow}</p>
            <h3 className="mt-4 font-display text-3xl text-[#123524]">{item.title}</h3>
            <p className="mt-4 text-sm leading-7 text-black/62">{item.description}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
