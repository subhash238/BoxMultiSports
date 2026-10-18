import { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
}

export default function StatCard({
  title,
  value,
  icon,
}: StatCardProps) {
  return (
    <div className="rounded-2xl border border-black/[0.06] bg-white p-5 shadow-sm transition-shadow hover:shadow-md sm:p-6">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            {title}
          </p>

          <h2 className="mt-2 truncate text-2xl font-extrabold text-gray-900 sm:text-3xl">
            {value}
          </h2>
        </div>

        <div className="flex-shrink-0 rounded-xl bg-[#B6F000]/15 p-3 text-[#5a7a00]">
          {icon}
        </div>
      </div>
    </div>
  );
}
