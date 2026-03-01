"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import type { Language } from "../lib/i18n/shared";

export default function TestimonialForm({ language }: { language: Language }) {
  const [form, setForm] = useState({
    category: language === "en" ? "General" : "一般",
    title: "",
    content: "",
    media_urls: "",
    is_anonymous: false,
    consent_public: true
  });

  const submit = async () => {
    try {
      const res = await fetch("/api/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: form.category,
          title: form.title,
          content: form.content,
          media_urls: form.media_urls ? form.media_urls.split(",").map((u) => u.trim()) : [],
          is_anonymous: form.is_anonymous,
          consent_public: form.consent_public
        })
      });
      if (!res.ok) throw new Error("Failed");
      toast.success(language === "en" ? "Testimonial submitted." : "见证已提交。");
      setForm({ ...form, title: "", content: "", media_urls: "" });
    } catch (error) {
      toast.error(language === "en" ? "Unable to submit testimonial." : "无法提交见证。");
    }
  };

  return (
    <div className="space-y-3">
      <input className="w-full rounded border p-2" placeholder={language === "en" ? "Category" : "分类"} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
      <input className="w-full rounded border p-2" placeholder={language === "en" ? "Title" : "标题"} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
      <textarea className="w-full rounded border p-2" placeholder={language === "en" ? "Content" : "内容"} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
      <input className="w-full rounded border p-2" placeholder={language === "en" ? "Media URLs (comma separated)" : "媒体链接（逗号分隔）"} value={form.media_urls} onChange={(e) => setForm({ ...form, media_urls: e.target.value })} />
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={form.is_anonymous} onChange={(e) => setForm({ ...form, is_anonymous: e.target.checked })} />
        {language === "en" ? "Submit anonymously" : "匿名提交"}
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={form.consent_public} onChange={(e) => setForm({ ...form, consent_public: e.target.checked })} />
        {language === "en" ? "Consent to public display" : "同意公开展示"}
      </label>
      <button onClick={submit} className="rounded-full bg-ink px-4 py-2 text-white">{language === "en" ? "Submit" : "提交"}</button>
    </div>
  );
}
