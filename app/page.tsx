import {
  Activity,
  ArrowRight,
  CheckCircle2,
  Keyboard,
  MonitorDot,
  MousePointer2,
  Sparkles,
  TabletSmartphone,
  Zap,
} from "lucide-react";


import { renderDeckIcon } from "./virtual-deck/deckIconCatalog";

const featureCards = [
  {
    title: "Mouse macros",
    description:
      "Transforme cliques, botões extras e combinações em ações prontas para entrar no ar.",
    icon: MousePointer2,
  },
  {
    title: "Deck físico",
    description:
      "Mapeie teclados dedicados para cenas, fontes, áudio e atalhos de operação.",
    icon: Keyboard,
  },
  {
    title: "Deck virtual",
    description:
      "Controle pelo celular ou tablet com botões grandes, claros e seguros durante a live.",
    icon: TabletSmartphone,
  },
  {
    title: "OBS nativo",
    description:
      "Troque cenas, mostre fontes e controle áudio sem sair do fluxo da transmissão.",
    icon: MonitorDot,
  },
];

const deckPreviewButtons = [
  {
    label: "Cena",
    iconId: "obs",
    actionType: "obs-scene",
    bg: "bg-[#0177a9]",
  },
  {
    label: "Mic",
    iconId: "FaMicrophone",
    actionType: "obs-audio-mute",
    bg: "bg-[#018dc8]",
  },
  {
    label: "Câmera",
    iconId: "FaCamera",
    actionType: "obs-source-toggle",
    bg: "bg-[#019add]",
  },
  {
    label: "Fonte",
    iconId: "FaEye",
    actionType: "obs-source-show",
    bg: "bg-[#00aaf0]",
  },
  {
    label: "Stop",
    iconId: "FaStop",
    actionType: "obs-record-stop",
    bg: "bg-[#1b2630]",
  },
  {
    label: "Live",
    iconId: "FaYoutube",
    actionType: "obs-stream-start",
    bg: "bg-[#26313b]",
  },
];

function LogoMark() {
  return (
    <svg
      aria-hidden="true"
      className="h-10 w-9 sm:h-12 sm:w-11"
      viewBox="0 0 853.33331 933.33331"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill="#0177a9"
        d="M 0.5,0.1114279 0.21875,0.59 H 0.4140621 L 0.6093743,0.2799997 Z"
        transform="matrix(853.33331,0,0,-933.33331,0,933.33331)"
      />
      <path
        fill="#0177a9"
        d="m 0.0718736,0.8385724 0.1062518,-0.18 h 0.1921864 l -0.1156257,0.18 z"
        transform="matrix(853.33331,0,0,-933.33331,0,933.33331)"
      />
      <path
        fill="#0083bb"
        d="m 0.3687489,0.6585724 -0.1156225,0.18 h 0.0921861 l 0.1140629,-0.18 z"
        transform="matrix(853.33331,0,0,-933.33331,0,933.33331)"
      />
      <path
        fill="#018dc8"
        d="m 0.3437496,0.8385724 0.1140629,-0.18 0.1953121,-0.3100003 0.1078115,0.1671428 -0.2078118,0.3228575 z"
        transform="matrix(853.33331,0,0,-933.33331,0,933.33331)"
      />
      <path
        fill="#019add"
        d="m 0.6671871,0.6585724 h 0.084375 l -0.1249996,0.18 H 0.5515614 Z"
        transform="matrix(853.33331,0,0,-933.33331,0,933.33331)"
      />
      <path
        fill="#00aaf0"
        d="m 0.7499993,0.6585724 h 0.1046889 l -0.1265625,0.18 H 0.6249996 Z"
        transform="matrix(853.33331,0,0,-933.33331,0,933.33331)"
      />
      <path
        fill="#00b4ff"
        d="m 0.8531254,0.6585724 0.1171885,0.18 h -0.243751 z"
        transform="matrix(853.33331,0,0,-933.33331,0,933.33331)"
      />
    </svg>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-[#12161C] text-white">
      <section className="min-h-screen px-5 py-5 sm:px-8 lg:px-10">
        <div className="mx-auto flex min-h-[calc(100vh-2.5rem)] max-w-7xl flex-col">
          <header className="flex items-center justify-between gap-4 rounded-2xl  bg-[#181E23] px-4 py-3">
            <div className="flex items-center gap-3">
              <LogoMark />

              <div>
                <span className="block text-lg font-black tracking-tight sm:text-xl">
                  Textream
                </span>
                <span className="block text-xs font-semibold text-[#647482]">
                  Stream control center
                </span>
              </div>
            </div>

            <a
              href="/virtual-deck/demo"
              className="inline-flex items-center gap-2 rounded-xl  bg-[#12161C] px-4 py-2 text-sm font-black text-white transition hover:border-[#3987DB] hover:text-[#3987DB]"
            >
              Demo
              <ArrowRight className="size-4" aria-hidden="true" />
            </a>
          </header>

          <div className="grid flex-1 items-center gap-10 py-12 lg:grid-cols-[1fr_0.9fr] lg:py-16">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-[#181E23] px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-[#3987DB]">
                <Sparkles className="size-4" aria-hidden="true" />
                Controle inteligente
              </div>

              <h1 className="max-w-4xl text-5xl font-black leading-[0.95] tracking-[-0.06em] text-white sm:text-7xl lg:text-8xl">
                Sua live, seus controles, um só painel.
              </h1>

              <p className="mt-7 max-w-2xl text-base leading-8 text-[#53616d] sm:text-lg">
                O Textream é uma central de controle para streamers que reúne
                OBS, macros, mouse, teclado, deck físico e deck virtual em uma
                experiência simples, visual e direta.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="/virtual-deck/demo"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#181E23] px-5 py-3 text-sm font-black text-white transition hover:bg-[#016995]"
                >
                  Ver deck virtual
                  <ArrowRight className="size-4" aria-hidden="true" />
                </a>

                <div className="inline-flex items-center gap-2 rounded-xl bg-[#12161C] px-5 py-3 text-sm font-black text-white">
                  <Activity className="size-4 text-[#0177a9]" aria-hidden="true" />
                  OBS, macros e cenas
                </div>
              </div>

              <div className="mt-9 grid max-w-xl gap-3 text-sm font-semibold text-[#53616d] sm:grid-cols-3">
                {["Sem complicação", "Visual limpo", "Controle local"].map(
                  (item) => (
                    <div key={item} className="flex items-center gap-2">
                      <CheckCircle2
                        className="size-4 text-[#0177a9]"
                        aria-hidden="true"
                      />
                      {item}
                    </div>
                  ),
                )}
              </div>
            </div>

            <div className="rounded-[2rem] bg-[#181E23] p-4">
              <div className="mb-4 flex items-center justify-between border-b border-[#34373a] pb-4">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-[0.24em] text-[#0177a9]">
                    Exemplo
                  </div>
                  <h2 className="mt-1 text-lg font-black text-white">
                    Card do deck virtual
                  </h2>
                </div>

                <TabletSmartphone
                  className="size-5 text-[#647482]"
                  aria-hidden="true"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                {deckPreviewButtons.map((button) => (
                  <div
                    key={button.label}
                    className={`aspect-square rounded-2xl ${button.bg} p-3`}
                  >
                    <div className="flex h-full flex-col items-center justify-between">
                      <div className="flex size-12 items-center justify-center rounded-xl bg-white/15 text-white">
                        {renderDeckIcon(button.iconId, button.actionType, {
                          size: 28,
                          className: "text-white",
                        })}
                      </div>

                      <span className="w-full truncate text-center text-sm font-black text-white">
                        {button.label}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 rounded-2xl bg-[#12161C] p-4">
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#d4dbe0]">
                  Funcionamento
                </div>

                <p className="mt-2 text-sm leading-6 text-[#c2cdd6]">
                  Cada botão pode representar uma cena, fonte, áudio, gravação,
                  transmissão ou atalho configurado dentro do Textream.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 pb-8 sm:grid-cols-2 lg:grid-cols-4">
            {featureCards.map((feature) => {
              const Icon = feature.icon;

              return (
                <article
                  key={feature.title}
                  className="rounded-2xl bg-[#181E23] p-5 transition hover:border-[#0177a9]"
                >
                  <div className="mb-8 flex size-12 items-center justify-center rounded-xl  bg-[#12161C] text-[#3987DB]">
                    <Icon className="size-6" aria-hidden="true" />
                  </div>

                  <h2 className="text-lg font-black text-white">
                    {feature.title}
                  </h2>

                  <p className="mt-3 text-sm leading-6 text-[#53616d]">
                    {feature.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}