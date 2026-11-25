export type UserRole = "MEMBER" | "MODERATOR" | "ADMIN";

export interface PrestigeRank {
  label: string;
  badgeColor: string;
  minPoints: number;
}

const PRESTIGE_TIERS: PrestigeRank[] = [
  {
    label: "Maître d'Art",
    badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    minPoints: 700,
  },
  {
    label: "Connaisseur",
    badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/40",
    minPoints: 300,
  },
  {
    label: "Amateur Éclairé",
    badgeColor: "bg-sky-500/20 text-sky-300 border-sky-500/40",
    minPoints: 100,
  },
  {
    label: "Apprenti",
    badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    minPoints: 30,
  },
  {
    label: "Novice",
    badgeColor: "bg-zinc-800 text-zinc-300 border-zinc-700",
    minPoints: 0,
  },
];

export function getPrestigeRank(
  postsCount: number,
  createdAt: Date | string,
): PrestigeRank {
  const joinedDate =
    typeof createdAt === "string" ? new Date(createdAt) : createdAt;
  const daysMember = Math.max(
    0,
    Math.floor((Date.now() - joinedDate.getTime()) / (1000 * 60 * 60 * 24)),
  );

  // Formule : 10 points par message + 1 point par jour d'ancienneté
  const points = postsCount * 10 + daysMember;

  return (
    PRESTIGE_TIERS.find((tier) => points >= tier.minPoints) ??
    PRESTIGE_TIERS[PRESTIGE_TIERS.length - 1]
  );
}

export function getRoleBadge(role: string) {
  switch (role) {
    case "ADMIN":
      return {
        label: "Admin",
        color: "bg-rose-500/20 text-rose-300 border-rose-500/40",
      };
    case "MODERATOR":
      return {
        label: "Modérateur",
        color: "bg-indigo-500/20 text-indigo-300 border-indigo-500/40",
      };
    default:
      return null;
  }
}
