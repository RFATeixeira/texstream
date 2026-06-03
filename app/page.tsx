import {
  Cast,
  ChevronRight,
  Eye,
  Keyboard,
  Layers3,
  Mic,
  MonitorDot,
  RadioTower,
  Settings,
  Zap,
} from "lucide-react";

const tabs = ["Macros", "Deck", "Dispositivos"];

const macroTiles = [
  {
    title: "Cena inicial",
    key: "cell-1-1",
    detail: "OBS cena: Abertura",
    icon: MonitorDot,
    active: true,
  },
  {
    title: "Camera",
    key: "cell-1-2",
    detail: "OBS mostrar fonte",
    icon: Eye,
    active: true,
  },
  {
    title: "Microfone",
    key: "cell-2-1",
    detail: "OBS mutar audio",
    icon: Mic,
    active: false,
  },
  {
    title: "Vinheta",
    key: "cell-2-2",
    detail: "Atalho de macro",
    icon: Zap,
    active: true,
  },
];

const deckCells = Array.from({ length: 12 }, (_, index) => {
  const macro = macroTiles[index % macroTiles.length];

  return {
    ...macro,
    label: String(index + 1).padStart(2, "0"),
    empty: index > 5,
  };
});

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#020617] text-zinc-100">
      <div className="min-h-screen bg-[radial-gradient(circle_at_20%_0%,rgba(34,211,238,0.16),transparent_34rem),radial-gradient(circle_at_82%_12%,rgba(59,130,246,0.12),transparent_28rem)]">
        <header className="border-b border-white/10 bg-[#0f172a]/90">
          <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-xl border border-cyan-400/30 bg-cyan-400/15 text-cyan-300 shadow-[0_0_28px_rgba(34,211,238,0.16)]">
                <Keyboard className="size-5" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <h1 className="truncate text-sm font-semibold text-white">
                  Texstream
                </h1>
                <p className="truncate text-xs text-slate-400">
                  macros, OBS e deck virtual
                </p>
              </div>
            </div>

            <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 p-1 sm:flex">
              {tabs.map((tab) => (
                <a
                  key={tab}
                  href={tab === "Deck" ? "#deck" : "#overview"}
                  className={[
                    "rounded-full px-4 py-1.5 text-xs font-medium transition",
                    tab === "Deck"
                      ? "bg-cyan-400 text-slate-950"
                      : "text-slate-300 hover:bg-white/10 hover:text-white",
                  ].join(" ")}
                >
                  {tab}
                </a>
              ))}
            </div>

            <a
              href="/virtual-deck/demo"
              className="flex size-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-200 transition hover:bg-white/10"
              aria-label="Abrir deck virtual"
              title="Abrir deck virtual"
            >
              <Cast className="size-4" aria-hidden="true" />
            </a>
          </div>
        </header>

        <section className="mx-auto grid max-w-7xl gap-4 px-4 py-4 sm:px-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
          <aside id="overview" className="grid gap-4">
            <article className="rounded-3xl border border-white/10 bg-[#0f172a]/90 p-5 shadow-[0_0_40px_rgba(15,23,42,0.7)]">
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.22em] text-cyan-300">
                    web host
                  </div>
                  <h2 className="mt-2 text-3xl font-bold leading-tight text-white sm:text-4xl">
                    Textream Deck
                  </h2>
                  <p className="mt-3 max-w-md text-sm leading-6 text-slate-400">
                    Uma pagina web simples, com o mesmo visual do app, para
                    apresentar o Texstream e hospedar o deck virtual no Vercel.
                  </p>
                </div>
                <span className="h-3 w-3 rounded-full bg-emerald-400 shadow-[0_0_14px_rgba(52,211,153,0.85)]" />
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                {[
                  ["12", "teclas"],
                  ["OBS", "ready"],
                  ["web", "Vercel"],
                ].map(([value, label]) => (
                  <div
                    key={label}
                    className="rounded-xl bg-[#020617]/70 px-2 py-3"
                  >
                    <div className="font-semibold text-white">{value}</div>
                    <div className="mt-1 text-slate-500">{label}</div>
                  </div>
                ))}
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <a
                  href="/virtual-deck/demo"
                  className="inline-flex items-center gap-2 rounded-full bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
                >
                  Abrir deck
                  <ChevronRight className="size-4" aria-hidden="true" />
                </a>
                <a
                  href="#deck"
                  className="inline-flex items-center gap-2 rounded-full border border-cyan-400/40 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-200 transition hover:bg-cyan-400/20"
                >
                  Ver preview
                </a>
              </div>
            </article>

            <article className="rounded-3xl border border-white/10 bg-[#0f172a]/90 p-4 shadow-[0_0_40px_rgba(15,23,42,0.7)]">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold text-white">OBS</h2>
                  <p className="mt-1 text-xs text-slate-400">
                    Aguardando conexao automatica
                  </p>
                </div>
                <RadioTower className="size-5 text-cyan-300" aria-hidden="true" />
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                {[
                  ["4", "cenas"],
                  ["8", "fontes"],
                  ["2", "audio"],
                ].map(([value, label]) => (
                  <div
                    key={label}
                    className="rounded-xl bg-[#020617]/70 px-2 py-2"
                  >
                    <div className="font-semibold text-white">{value}</div>
                    <div className="text-slate-500">{label}</div>
                  </div>
                ))}
              </div>

              <div className="mt-3 rounded-xl bg-white/5 px-3 py-2 text-xs text-slate-300">
                Painel visual reservado para status, URL publica e sincronizacao
                do deck virtual.
              </div>
            </article>
          </aside>

          <section
            id="deck"
            className="grid gap-4 lg:grid-rows-[auto_minmax(0,1fr)]"
          >
            <article className="rounded-3xl border border-white/10 bg-[#0f172a]/90 p-4 shadow-[0_0_40px_rgba(15,23,42,0.7)]">
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.22em] text-cyan-300">
                    configuracao
                  </div>
                  <h2 className="mt-1 text-lg font-semibold text-white">
                    Deck virtual
                  </h2>
                  <p className="mt-1 text-sm text-slate-400">
                    A area abaixo e o ponto de entrada para o deck hospedado.
                  </p>
                </div>
                <Settings className="size-5 text-slate-400" aria-hidden="true" />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {macroTiles.map((macro) => (
                  <div
                    key={macro.key}
                    className="min-h-[104px] rounded-2xl border border-white/10 bg-[#1e293b]/70 p-3 transition hover:border-cyan-400/35 hover:bg-[#1e293b]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-[10px] uppercase tracking-[0.18em] text-cyan-300">
                          Macro
                        </div>
                        <h3 className="mt-1 truncate text-sm font-semibold text-white">
                          {macro.title}
                        </h3>
                      </div>
                      <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-slate-200">
                        {macro.key}
                      </span>
                    </div>
                    <div className="mt-3 grid gap-2 text-xs text-slate-300">
                      <div className="truncate rounded-xl bg-cyan-400/10 px-2.5 py-1.5 text-cyan-200">
                        {macro.key}
                      </div>
                      <div className="truncate rounded-xl bg-white/5 px-2.5 py-1.5">
                        {macro.detail}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-3xl border border-white/10 bg-[#0f172a]/90 p-4 shadow-[0_0_40px_rgba(15,23,42,0.7)]">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Layers3 className="size-5 text-cyan-300" aria-hidden="true" />
                  <h2 className="text-lg font-semibold text-white">
                    Preview touch
                  </h2>
                </div>
                <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs text-emerald-200">
                  online
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {deckCells.map((cell, index) => {
                  const Icon = cell.icon;

                  return cell.empty ? (
                    <div
                      key={`${cell.key}-${index}`}
                      className="flex aspect-square min-h-0 items-center justify-center rounded-2xl border border-dashed border-white/15 bg-white/5 text-sm font-semibold text-slate-600"
                    >
                      {cell.label}
                    </div>
                  ) : (
                    <a
                      key={`${cell.key}-${index}`}
                      href="/virtual-deck/demo"
                      className="relative aspect-square min-h-0 overflow-hidden rounded-2xl border border-white/10 bg-[#1e293b]/90 p-3 shadow-[0_0_28px_rgba(34,211,238,0.08)] transition active:scale-95 hover:border-cyan-400/40"
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                      <div
                        className={[
                          "relative z-10 mx-auto flex size-12 items-center justify-center rounded-2xl bg-white/10",
                          cell.active ? "text-cyan-200" : "text-slate-500",
                        ].join(" ")}
                      >
                        <Icon className="size-6" aria-hidden="true" />
                      </div>
                      <div className="absolute bottom-3 left-3 right-3 z-10 text-center">
                        <div className="truncate text-sm font-bold text-white">
                          {cell.title}
                        </div>
                        <div className="mt-1 text-[10px] uppercase tracking-[0.16em] text-slate-300">
                          {cell.label}
                        </div>
                      </div>
                    </a>
                  );
                })}
              </div>
            </article>
          </section>
        </section>
      </div>
    </main>
  );
}
