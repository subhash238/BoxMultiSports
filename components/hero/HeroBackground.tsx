import { ReactNode } from "react";

interface HeroBackgroundProps {
  children: ReactNode;
}

export default function HeroBackground({
  children,
}: HeroBackgroundProps) {
  return (
    <section
      className="relative min-h-screen w-full overflow-hidden bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=1920&q=80')",
      }}
    >
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/70"></div>

      {/* Content */}
      <div className="relative z-10 flex min-h-screen items-center justify-center">
        {children}
      </div>
    </section>
  );
}