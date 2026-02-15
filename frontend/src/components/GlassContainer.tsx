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
      className={`${strong ? "glass-strong" : "glass"} rounded-2xl ${className}`}
    >
      {children}
    </div>
  );
}
