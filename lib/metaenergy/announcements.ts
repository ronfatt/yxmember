export type AnnouncementItem = {
  id: string;
  monthLabel: {
    zh: string;
    en: string;
  };
  title: {
    zh: string;
    en: string;
  };
  description: {
    zh: string;
    en: string;
  };
  badge: {
    zh: string;
    en: string;
  };
};

export const currentMonthAnnouncements: AnnouncementItem[] = [
  {
    id: "double-points",
    monthLabel: {
      zh: "2026 年 3 月",
      en: "March 2026"
    },
    title: {
      zh: "双倍积分礼遇月",
      en: "Double points campaign"
    },
    description: {
      zh: "本月会员实付订单可获得更高积分回馈，让新加入的会员在开始阶段就能感受到参与的节奏。",
      en: "Paid member orders this month earn boosted points so new members feel immediate momentum after joining."
    },
    badge: {
      zh: "积分",
      en: "Points"
    }
  },
  {
    id: "oil-launch",
    monthLabel: {
      zh: "2026 年 3 月",
      en: "March 2026"
    },
    title: {
      zh: "全新精油上新",
      en: "New essential oil launch"
    },
    description: {
      zh: "会员将优先体验下一波产品上新，并在会员空间中看到更完整的使用建议与节奏提示。",
      en: "Members get first access to the next product release, plus guided usage suggestions through the dashboard."
    },
    badge: {
      zh: "上新",
      en: "Launch"
    }
  },
  {
    id: "sharing-night",
    monthLabel: {
      zh: "2026 年 3 月",
      en: "March 2026"
    },
    title: {
      zh: "会员分享之夜",
      en: "Member sharing night"
    },
    description: {
      zh: "一场更贴近人的会员交流夜，围绕频率故事、真实心得与长期参与中的细微收获展开。",
      en: "A live community session focused on frequency stories, practical wins, and keeping the membership experience human."
    },
    badge: {
      zh: "社群",
      en: "Community"
    }
  }
];
