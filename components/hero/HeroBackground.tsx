import { ReactNode } from "react";

interface HeroBackgroundProps {
  children: ReactNode;
  image: string;
  overlay?: string;
}

export default function HeroBackground({
  children,
  image,
  overlay = "bg-black/60",
}: HeroBackgroundProps) {
  return (
    <section
      className="relative min-h-screen overflow-hidden bg-cover bg-center"
      style={{
        backgroundImage: `url(${image})`,
      }}
    >
      <div className={`absolute inset-0 ${overlay}`}></div>

      <div className="relative z-10">
        {children}
      </div>
    </section>
  );
}