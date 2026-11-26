type AvatarSize = "sm" | "md" | "lg";

const SIZE_CLASSES: Record<
  AvatarSize,
  { box: string; px: number; text: string }
> = {
  sm: { box: "h-7 w-7", px: 28, text: "text-xs" },
  md: { box: "h-9 w-9", px: 36, text: "text-sm" },
  lg: { box: "h-12 w-12", px: 48, text: "text-base" }, // 48px maximum
};

export default function UserAvatar({
  name,
  image,
  size = "lg",
}: {
  name: string;
  image?: string | null;
  size?: AvatarSize;
}) {
  const { box, px, text } = SIZE_CLASSES[size];
  const initial = name.trim().charAt(0).toUpperCase() || "?";

  if (image) {
    return (
      <img
        src={image}
        alt={`Avatar de ${name}`}
        width={px}
        height={px}
        className={`${box} shrink-0 rounded-full border border-zinc-700 object-cover`}
      />
    );
  }

  return (
    <div
      className={`${box} ${text} flex shrink-0 items-center justify-center rounded-full border border-amber-500/40 bg-amber-500/15 font-bold text-amber-400`}
    >
      {initial}
    </div>
  );
}
