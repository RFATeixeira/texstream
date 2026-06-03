import { Eye, Keyboard, Mic, MonitorDot, RadioTower, Zap } from "lucide-react";

const cells = [
  { label: "1", title: "Abertura", icon: MonitorDot },
  { label: "2", title: "Camera", icon: Eye },
  { label: "3", title: "Mic", icon: Mic },
  { label: "4", title: "Vinheta", icon: Zap },
  { label: "5", title: "Cena 02", icon: MonitorDot },
  { label: "6", title: "Fonte", icon: Eye },
  { label: "7", title: "Audio", icon: Mic },
  { label: "8", title: "Macro", icon: Keyboard },
  { label: "9", title: "Livre" },
  { label: "10", title: "Livre" },
  { label: "11", title: "Livre" },
  { label: "12", title: "Livre" },
];

export default async function VirtualDeckPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <main className="h-[100dvh] overflow-hidden bg-[#020617] p-2 text-white sm:p-4">
      <div className="mb-2 flex items-center justify-between gap-3 px-1 sm:mb-4">
        <div className="min-w-0">
          <h1 className="truncate text-lg font-bold sm:text-2xl">
            Textream Deck
          </h1>
          <p className="truncate text-xs text-slate-400 sm:text-sm">
            /virtual-deck/{id}
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-2 text-xs font-semibold text-cyan-200 shadow-[0_0_28px_rgba(34,211,238,0.16)]">
          <RadioTower className="size-4" aria-hidden="true" />
          online
        </div>
      </div>

      <div className="grid h-[calc(100dvh-4.5rem)] grid-cols-3 gap-2 sm:h-[calc(100dvh-6rem)] sm:gap-4">
        {cells.map((cell, index) => {
          if (!cell.icon) {
            return (
              <div
                key={cell.label}
                className="flex min-h-0 items-center justify-center rounded-2xl border border-dashed border-white/15 bg-white/5 text-sm font-semibold text-slate-600 sm:rounded-3xl"
              >
                {cell.label}
              </div>
            );
          }

          const Icon = cell.icon;

          return (
            <button
              key={cell.label}
              className="relative min-h-0 touch-manipulation overflow-hidden rounded-2xl border border-white/10 bg-[#1e293b]/90 p-2 shadow-[0_0_28px_rgba(34,211,238,0.10)] transition active:scale-95 sm:rounded-3xl sm:p-4"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(34,211,238,0.18),transparent_60%),linear-gradient(to_top,rgba(0,0,0,0.8),rgba(0,0,0,0.18),transparent)]" />
              <div className="relative z-10 mx-auto flex size-10 items-center justify-center rounded-xl bg-white/10 text-cyan-200 sm:size-14 sm:rounded-2xl">
                <Icon className="size-6 sm:size-7" aria-hidden="true" />
              </div>

              <div className="absolute bottom-2 left-2 right-2 z-10 text-center sm:bottom-4 sm:left-4 sm:right-4">
                <div className="truncate text-sm font-bold sm:text-lg">
                  {cell.title}
                </div>
                <div className="mt-0.5 text-[10px] uppercase tracking-[0.16em] text-slate-300 sm:mt-1 sm:text-xs">
                  {cell.label}
                </div>
              </div>

              <span className="absolute right-2 top-2 z-10 h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)] sm:right-4 sm:top-4" />
            </button>
          );
        })}
      </div>
    </main>
  );
}
