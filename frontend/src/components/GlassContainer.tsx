interface GlassContainerProps {
  children: React.ReactNode;
  className?: string;
  strong?: boolean;
}

export default function GlassContainer({
  children,
  className = "",
  strong = false,
}: GlassContainerProps) {
  return (
    <div
      className={`${strong ? "surface-elevated" : "surface"} rounded-lg ${className}`}
    >
      {children}
    </div>
  );
}
