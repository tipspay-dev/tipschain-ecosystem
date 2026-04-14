import { WalletCards } from "lucide-react";

export function EmptyState({ title, copy }: { title: string; copy: string }) {
  return (
    <div className="rounded-[28px] border border-dashed border-white/10 bg-white/5 px-6 py-10 text-center">
      <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-white/8">
        <WalletCards className="h-6 w-6 text-white/70" />
      </div>
      <p className="text-base font-semibold text-white">{title}</p>
      <p className="mt-2 text-sm text-white/55">{copy}</p>
    </div>
  );
}
