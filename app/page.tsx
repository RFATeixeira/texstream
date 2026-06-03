import {
  BadgeCheck,
  Cast,
  ChevronRight,
  Layers3,
  Maximize2,
  MonitorUp,
  Sparkles,
} from "lucide-react";

const deckSlots = [
  { title: "Abertura", tone: "bg-[#126562]" },
  { title: "Cena 01", tone: "bg-[#bf492c]" },
  { title: "Cena 02", tone: "bg-[#d4b15f]" },
  { title: "Final", tone: "bg-[#7c8f82]" },
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden">
      <section className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 py-5 sm:px-8 lg:px-10">
        <header className="flex h-16 items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded bg-[#f7f4ec] text-[#08090c]">
              <Cast className="size-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-lg font-bold tracking-[0]">Texstream</p>
              <p className="text-xs text-white/52">Virtual deck host</p>
            </div>
          </div>

          <nav className="hidden items-center gap-6 text-sm text-white/62 sm:flex">
            <a className="transition hover:text-white" href="#deck">
              Deck
            </a>
            <a className="transition hover:text-white" href="#preview">
              Preview
            </a>
          </nav>
        </header>

        <div className="grid flex-1 items-center gap-10 py-8 lg:grid-cols-[0.9fr_1.1fr] lg:py-10">
          <div className="max-w-xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded border border-white/12 bg-white/[0.04] px-3 py-2 text-sm text-white/70">
              <Sparkles className="size-4 text-[#d4b15f]" aria-hidden="true" />
              Streaming visual direto no browser
            </div>

            <h1 className="text-5xl font-black leading-[0.95] tracking-[0] text-[#f7f4ec] sm:text-6xl lg:text-7xl">
              Texstream
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-8 text-white/68">
              Uma tela limpa para apresentar o projeto e hospedar o deck virtual
              que conduz cenas, overlays e momentos da transmissão.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#deck"
                className="inline-flex h-12 items-center gap-2 rounded bg-[#f7f4ec] px-5 text-sm font-bold text-[#08090c] transition hover:bg-white"
              >
                Abrir deck
                <ChevronRight className="size-4" aria-hidden="true" />
              </a>
              <a
                href="#preview"
                className="inline-flex h-12 items-center gap-2 rounded border border-white/14 px-5 text-sm font-bold text-white transition hover:border-white/34 hover:bg-white/[0.04]"
              >
                Ver preview
              </a>
            </div>

            <div className="mt-10 grid max-w-lg grid-cols-3 gap-3">
              {[
                ["4", "cenas"],
                ["16:9", "canvas"],
                ["web", "host"],
              ].map(([value, label]) => (
                <div
                  key={label}
                  className="border border-white/10 bg-black/18 px-4 py-3"
                >
                  <p className="text-2xl font-black">{value}</p>
                  <p className="mt-1 text-xs uppercase text-white/42">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <section
            id="deck"
            className="w-full border border-white/10 bg-[#101116]/88 shadow-2xl shadow-black/30"
          >
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <div className="flex items-center gap-2">
                <Layers3 className="size-4 text-[#d4b15f]" aria-hidden="true" />
                <h2 className="text-sm font-bold uppercase text-white/70">
                  Deck virtual
                </h2>
              </div>
              <button
                className="grid size-9 place-items-center rounded border border-white/10 text-white/62 transition hover:border-white/24 hover:text-white"
                aria-label="Expandir deck virtual"
                title="Expandir deck virtual"
              >
                <Maximize2 className="size-4" aria-hidden="true" />
              </button>
            </div>

            <div className="grid gap-0 lg:grid-cols-[12rem_1fr]">
              <aside className="border-b border-white/10 lg:border-b-0 lg:border-r">
                <div className="grid grid-cols-2 lg:grid-cols-1">
                  {deckSlots.map((slot, index) => (
                    <button
                      key={slot.title}
                      className="flex min-h-20 items-center gap-3 border-r border-white/8 px-4 text-left transition hover:bg-white/[0.04] lg:border-b lg:border-r-0"
                    >
                      <span className={`size-3 rounded-sm ${slot.tone}`} />
                      <span>
                        <span className="block text-sm font-bold text-white">
                          {slot.title}
                        </span>
                        <span className="mt-1 block text-xs text-white/42">
                          Slot {String(index + 1).padStart(2, "0")}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              </aside>

              <div className="p-4 sm:p-5">
                <div
                  id="preview"
                  className="relative aspect-video min-h-64 overflow-hidden border border-white/10 bg-[#08090c]"
                >
                  <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(0deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:32px_32px]" />
                  <div className="absolute inset-x-6 top-6 flex items-center justify-between">
                    <div className="flex items-center gap-2 rounded bg-black/36 px-3 py-2 text-xs text-white/70">
                      <BadgeCheck className="size-4 text-[#7c8f82]" />
                      Ready
                    </div>
                    <div className="rounded bg-[#bf492c] px-3 py-2 text-xs font-bold">
                      LIVE DECK
                    </div>
                  </div>

                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="mb-4 h-1.5 w-28 bg-[#d4b15f]" />
                    <p className="text-3xl font-black tracking-[0] text-white sm:text-5xl">
                      Cena principal
                    </p>
                    <p className="mt-3 max-w-md text-sm leading-6 text-white/62">
                      Area reservada para renderizar o deck virtual, previews de
                      cards, cenas e controles da transmissao.
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {[
                    [MonitorUp, "Output", "16:9"],
                    [Cast, "Stream", "Browser"],
                    [Layers3, "Deck", "4 slots"],
                  ].map(([Icon, label, value]) => (
                    <div
                      key={String(label)}
                      className="flex min-h-16 items-center gap-3 border border-white/10 bg-white/[0.03] px-4"
                    >
                      <Icon className="size-5 text-[#d4b15f]" aria-hidden="true" />
                      <div>
                        <p className="text-sm font-bold">{value as string}</p>
                        <p className="text-xs text-white/42">{label as string}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
