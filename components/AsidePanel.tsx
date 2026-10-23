import type { ComponentPropsWithoutRef } from "react";

type AsidePanelProps = ComponentPropsWithoutRef<"aside">;

export default function AsidePanel({ className, ...props }: AsidePanelProps) {
  return (
    <aside
      {...props}
      className={`h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 sm:sticky sm:top-24 ${className ?? ""}`}
    />
  );
}
