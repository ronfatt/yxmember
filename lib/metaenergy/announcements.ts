export type AnnouncementItem = {
  id: string;
  monthLabel: string;
  title: string;
  description: string;
  badge: string;
};

export const currentMonthAnnouncements: AnnouncementItem[] = [
  {
    id: "double-points",
    monthLabel: "March 2026",
    title: "Double points campaign",
    description: "Paid member orders this month earn boosted points so new members feel immediate momentum after joining.",
    badge: "Points"
  },
  {
    id: "oil-launch",
    monthLabel: "March 2026",
    title: "New essential oil launch",
    description: "Members get first access to the next product release, plus guided usage suggestions through the dashboard.",
    badge: "Launch"
  },
  {
    id: "sharing-night",
    monthLabel: "March 2026",
    title: "Member sharing night",
    description: "A live community session focused on frequency stories, practical wins, and keeping the membership experience human.",
    badge: "Community"
  }
];
