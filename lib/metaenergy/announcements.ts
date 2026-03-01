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
      zh: "双倍积分月",
      en: "Double points campaign"
    },
    description: {
      zh: "当节奏被放大，成长也会更清晰。",
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
      zh: "新品优先体验",
      en: "New essential oil launch"
    },
    description: {
      zh: "会员优先进入。不是抢先，而是更从容。",
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
      zh: "分享夜",
      en: "Member sharing night"
    },
    description: {
      zh: "真实故事的交换。不喧哗，只真诚。",
      en: "A live community session focused on frequency stories, practical wins, and keeping the membership experience human."
    },
    badge: {
      zh: "社群",
      en: "Community"
    }
  }
];
