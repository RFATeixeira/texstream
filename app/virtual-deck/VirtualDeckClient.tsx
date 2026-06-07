"use client";

import {
  ArrowLeft,
  Bell,
  CircleHelp,
  LoaderCircle,
  LogOut,
  RadioTower,
  WifiOff,
} from "lucide-react";
import type { CSSProperties, ReactNode, SVGProps } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { renderDeckIcon } from "./deckIconCatalog";

type VirtualDeck = {
  id: string;
  name: string;
  rows: number;
  columns: number;
  color?: string;
};

type MacroTemplate = {
  id: string;
  name: string;
  deviceId: string;
  key: string;
  actionType?: string;
  obsSceneName?: string;
  obsSourceName?: string;
  obsAudioInputName?: string;
  origin?: string;
  deckTitle?: string;
  deckImageOn?: string;
  deckImageOff?: string;
  deckVisualType?: "icon" | "image";
  deckIcon?: string;
  deckStateActive?: boolean;
};

type LoadState = "loading" | "ready" | "error";
type IconProps = SVGProps<SVGSVGElement> & {
  size?: number;
  strokeWidth?: number;
};
type UserProfile = {
  displayName: string;
  email: string;
  photoUrl: string;
};

const BACKEND_PARAM_KEYS = ["host", "backendHost", "port", "backendPort"];
const USER_PARAM_KEYS = [
  "displayName",
  "userName",
  "name",
  "email",
  "userEmail",
  "photoURL",
  "photoUrl",
  "userPhoto",
  "avatar",
];

function IconBase({
  size = 16,
  strokeWidth = 2,
  children,
  ...props
}: IconProps) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height={size}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={strokeWidth}
      viewBox="0 0 24 24"
      width={size}
      {...props}
    >
      {children}
    </svg>
  );
}

function DashboardNavIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M4 13a8 8 0 0 1 16 0" />
      <path d="M12 13l4-4" />
      <path d="M4 13v5a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5" />
      <path d="M8 17h.01M12 17h.01M16 17h.01" />
    </IconBase>
  );
}

function TextreamDeckIcon(props: IconProps) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height={props.size ?? 25}
      viewBox="0 0 25 25"
      width={props.size ?? 25}
      {...props}
    >
      <path
        d="M4 14.333H6.83301C8.48975 14.333 9.83283 15.6763 9.83301 17.333V20.167C9.83283 21.8237 8.48975 23.167 6.83301 23.167H4C2.34326 23.167 1.00018 21.8237 1 20.167V17.333C1.00017 15.6763 2.34325 14.333 4 14.333ZM18.167 14.333H21C22.6567 14.333 23.9998 15.6763 24 17.333V20.167C23.9998 21.8237 22.6567 23.167 21 23.167H18.167C16.5102 23.167 15.1672 21.8237 15.167 20.167V17.333C15.1672 15.6763 16.5102 14.333 18.167 14.333ZM4 1H6.83301C8.48986 1 9.83301 2.34315 9.83301 4V6.83301C9.83301 8.48986 8.48986 9.83301 6.83301 9.83301H4C2.34315 9.83301 1 8.48986 1 6.83301V4C1 2.34315 2.34315 1 4 1ZM18.167 1H21C22.6569 1 24 2.34315 24 4V6.83301C24 8.48986 22.6569 9.83301 21 9.83301H18.167C16.5101 9.83301 15.167 8.48986 15.167 6.83301V4C15.167 2.34315 16.5101 1 18.167 1Z"
        stroke="currentColor"
        strokeWidth={props.strokeWidth ?? 2}
      />
    </svg>
  );
}

function TextreamLogoIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      height={size}
      viewBox="0 0 853.33331 933.33331"
      width={size}
      {...props}
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

function getBackendUrl() {
  const params = new URLSearchParams(window.location.search);
  const host =
    params.get("host") ||
    params.get("backendHost") ||
    window.localStorage.getItem("textream:virtual-deck-host") ||
    window.location.hostname ||
    "127.0.0.1";
  const port = params.get("port") || params.get("backendPort") || "3434";

  window.localStorage.setItem("textream:virtual-deck-host", host);

  if (host.startsWith("http://") || host.startsWith("https://")) {
    return host.replace(/\/$/, "");
  }

  return `http://${host}:${port}`;
}

async function apiGet<T>(path: string) {
  const response = await fetch(`${getBackendUrl()}${path}`);

  if (!response.ok) {
    throw new Error(`API ${response.status}`);
  }

  return response.json() as Promise<T>;
}

function buildDeckHref(deck: VirtualDeck) {
  const url = new URL(`/virtual-deck/${deck.id}`, window.location.origin);
  const current = new URLSearchParams(window.location.search);

  for (const key of [...BACKEND_PARAM_KEYS, ...USER_PARAM_KEYS]) {
    const value = current.get(key);

    if (value) {
      url.searchParams.set(key, value);
    }
  }

  url.searchParams.set("rows", String(deck.rows));
  url.searchParams.set("columns", String(deck.columns));

  const color = normalizeDeckColor(deck.color);

  if (color) {
    url.searchParams.set("color", color);
  }

  return url.toString();
}

function getUserProfileFromUrl() {
  if (typeof window === "undefined") {
    return {
      displayName: "",
      email: "",
      photoUrl: "",
    };
  }

  const params = new URLSearchParams(window.location.search);
  const displayName =
    params.get("displayName") || params.get("userName") || params.get("name") || "";
  const email = params.get("email") || params.get("userEmail") || "";
  const photoUrl =
    params.get("photoURL") ||
    params.get("photoUrl") ||
    params.get("userPhoto") ||
    params.get("avatar") ||
    "";

  const profile = {
    displayName: displayName.trim(),
    email: email.trim(),
    photoUrl: photoUrl.trim(),
  };

  if (profile.displayName || profile.email || profile.photoUrl) {
    window.localStorage.setItem(
      "textream:virtual-deck-user",
      JSON.stringify(profile)
    );

    return profile;
  }

  try {
    const cachedProfile = window.localStorage.getItem("textream:virtual-deck-user");

    if (cachedProfile) {
      return {
        displayName: "",
        email: "",
        photoUrl: "",
        ...JSON.parse(cachedProfile),
      } as UserProfile;
    }
  } catch {
    window.localStorage.removeItem("textream:virtual-deck-user");
  }

  return profile;
}

function getUserInitial(profile: UserProfile) {
  return (profile.displayName || profile.email || "T")
    .trim()
    .charAt(0)
    .toUpperCase();
}

function normalizeDeckColor(color?: string) {
  const trimmedColor = color?.trim() ?? "";

  return /^#[0-9a-f]{6}$/i.test(trimmedColor) ? trimmedColor.toUpperCase() : "";
}

function getDeckMacros(macros: MacroTemplate[], deckId: string) {
  return macros.filter(
    (macro) => (macro.origin ?? "macros") === "deck" && macro.deviceId === deckId
  );
}

function getActionLabel(macro?: MacroTemplate) {
  if (!macro) {
    return "Livre";
  }

  if (macro.deckTitle?.trim()) {
    return macro.deckTitle.trim();
  }

  if (macro.actionType === "obs-scene") {
    return macro.obsSceneName?.trim() || "Cena";
  }

  if (macro.actionType === "obs-source-visibility") {
    return macro.obsSourceName?.trim() || "Fonte";
  }

  if (macro.actionType === "obs-audio-mute") {
    return macro.obsAudioInputName?.trim() || "Audio";
  }

  return macro.name?.trim() || "Macro";
}

function getImageSrc(macro?: MacroTemplate) {
  if (!macro || macro.deckVisualType !== "image") {
    return "";
  }

  if (macro.deckStateActive && macro.deckImageOn?.trim()) {
    return macro.deckImageOn.trim();
  }

  if (!macro.deckStateActive && macro.deckImageOff?.trim()) {
    return macro.deckImageOff.trim();
  }

  return macro.deckImageOn?.trim() || macro.deckImageOff?.trim() || "";
}

function DeckIcon({ macro }: { macro?: MacroTemplate }) {
  return renderDeckIcon(macro?.deckIcon, macro?.actionType, {
    className: "size-14 sm:size-16",
  });
}

function UserAvatar() {
  const [profile] = useState(getUserProfileFromUrl);
  const [photoUrl, setPhotoUrl] = useState(profile.photoUrl);

  if (photoUrl) {
    return (
      <img
        alt={profile.displayName || profile.email || "Usuario"}
        className="size-10 rounded-full object-cover"
        onError={() => setPhotoUrl("")}
        src={photoUrl}
      />
    );
  }

  return (
    <div
      aria-label={profile.displayName || profile.email || "Usuario"}
      className="flex size-10 items-center justify-center rounded-full bg-[#1B242E] text-sm font-bold text-[#55A8FF]"
      role="img"
    >
      {getUserInitial(profile)}
    </div>
  );
}

function Shell({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <main className="min-h-dvh bg-[#12161C] text-white p-4 h-screen">
      <div className="flex h-full w-full">
        <aside className="hidden w-72 shrink-0 bg-[#181E24] p-5 md:flex rounded-2xl">
          <div className="flex h-full w-full flex-col">
            <div className="flex items-center gap-3">
              <TextreamLogoIcon size={60} />
              <div className="min-w-0">
                <div className="truncate text-3xl font-bold">Textream</div>
              </div>
            </div>

            <nav className="mt-10 grid gap-2">
              <a
                className="flex items-center gap-3 rounded-xl bg-[#19273A] p-4 text-sm font-semibold text-white"
                href="/virtual-deck"
              >
                <TextreamDeckIcon
                  size={22}
                  strokeWidth={2.2}
                  className="text-[#3987DB]"
                />
                Decks virtuais
              </a>
            </nav>

            <button
              className="mt-auto flex items-center gap-3 rounded-xl bg-[#381A1B] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#552122] hover:text-white"
              type="button"
            >
              <LogOut className="size-5 text-[#A31B1B]" aria-hidden="true" />
              Desconectar
            </button>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col px-4 py-5 sm:px-6 lg:px-8">
          <header className="mb-8 flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="mb-5 flex items-center gap-3 md:hidden">
                <TextreamLogoIcon size={34} />
                <div className="font-bold">Textream</div>
              </div>
              <div className="flex items-center gap-3">
                <TextreamDeckIcon size={30} className="text-[#55A8FF]" />
                <h1 className="truncate text-2xl font-bold text-white">
                  Decks virtuais
                </h1>
              </div>
              <p className="mt-2 text-sm text-slate-400">
                Selecione um deck para controlar sua live
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <button
                className="flex size-10 items-center justify-center text-[#c8d2dc] transition hover:border-[#00b4ff]/60 hover:text-white"
                type="button"
                aria-label="Notificacoes"
                title="Notificacoes"
              >
                <Bell className="size-5" aria-hidden="true" />
              </button>
              <button
                className="flex size-10 items-center justify-center text-[#c8d2dc] transition hover:border-[#00b4ff]/60 hover:text-white"
                type="button"
                aria-label="Ajuda"
                title="Ajuda"
              >
                <CircleHelp className="size-5" aria-hidden="true" />
              </button>
              <UserAvatar />
            </div>
          </header>

          {children}
        </div>
      </div>
    </main>
  );
}

export function VirtualDeckHome() {
  const [decks, setDecks] = useState<VirtualDeck[]>([]);
  const [macros, setMacros] = useState<MacroTemplate[]>([]);
  const [state, setState] = useState<LoadState>("loading");

  const load = useCallback(async () => {
    try {
      setState((current) => (current === "ready" ? current : "loading"));
      const [nextDecks, nextMacros] = await Promise.all([
        apiGet<VirtualDeck[]>("/virtual-decks"),
        apiGet<MacroTemplate[]>("/macros"),
      ]);

      setDecks(nextDecks);
      setMacros(nextMacros);
      setState("ready");
    } catch {
      setState("error");
    }
  }, []);

  useEffect(() => {
    void load();
    const interval = window.setInterval(load, 5000);

    return () => window.clearInterval(interval);
  }, [load]);

  return (
    <Shell>
      <div className="grid flex-1 content-start gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {decks.map((deck) => {
          const configuredKeys = getDeckMacros(macros, deck.id).length;
          const totalKeys = deck.rows * deck.columns;
          const deckColor = normalizeDeckColor(deck.color) || "#EF4444";

          return (
            <a
              key={deck.id}
              className="group relative overflow-hidden rounded-2xl border-2 border-transparent bg-[#181E23] px-6 py-8 text-left transition hover:border-[#3987DB]/50 hover:bg-[#191E25] active:scale-[0.98]"
              href={buildDeckHref(deck)}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#1B242E] text-[#3987DB]">
                    <TextreamDeckIcon size={34} strokeWidth={2.5} />
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold uppercase text-[#3987DB]">
                      {deck.name}
                    </div>
                    <div className="mt-1 text-sm tracking-[0.16em] text-white first-letter:uppercase">
                      VIRTUAL
                    </div>
                    <div className="mt-1 text-xs tracking-[0.16em] text-[#8E949C] first-letter:uppercase">
                      {deck.rows} x {deck.columns} celular/tablet
                    </div>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-3">
                  <div
                    aria-hidden="true"
                    className="h-4 w-4 rounded-full shadow-[0_0_14px_currentColor]"
                    style={{
                      backgroundColor: deckColor,
                      color: deckColor,
                    }}
                  />
                </div>
              </div>
            </a>
          );
        })}

        {state === "loading" && (
          <div className="rounded-2xl bg-[#181E24] p-5 text-sm text-[#8E949C] sm:col-span-2 xl:col-span-3">
            Carregando decks...
          </div>
        )}

        {state === "error" && (
          <div className="rounded-2xl border border-dashed border-[#543236] bg-[#171114] p-5 text-sm text-[#f0b8bf] sm:col-span-2 xl:col-span-3">
            Nao foi possivel conectar ao host do Textream.
          </div>
        )}

        {state === "ready" && decks.length === 0 && (
          <div className="rounded-2xl border border-dashed border-white/15 bg-[#181E24] p-5 text-sm text-[#8E949C] sm:col-span-2 xl:col-span-3">
            Nenhum deck virtual criado ainda.
          </div>
        )}
      </div>
    </Shell>
  );
}

export function VirtualDeckTouch({ deckId }: { deckId: string }) {
  const params = useMemo(() => {
    if (typeof window === "undefined") {
      return new URLSearchParams();
    }

    return new URLSearchParams(window.location.search);
  }, []);
  const deckListHref = useMemo(() => {
    const nextParams = new URLSearchParams();

    for (const key of [...BACKEND_PARAM_KEYS, ...USER_PARAM_KEYS]) {
      const value = params.get(key);

      if (value) {
        nextParams.set(key, value);
      }
    }

    const query = nextParams.toString();

    return query ? `/virtual-deck?${query}` : "/virtual-deck";
  }, [params]);
  const fallbackRows = Math.min(8, Math.max(1, Number(params.get("rows")) || 3));
  const fallbackColumns = Math.min(
    8,
    Math.max(1, Number(params.get("columns")) || 4)
  );
  const [decks, setDecks] = useState<VirtualDeck[]>([]);
  const [macros, setMacros] = useState<MacroTemplate[]>([]);
  const [state, setState] = useState<LoadState>("loading");

  const load = useCallback(async () => {
    try {
      const [nextDecks, nextMacros] = await Promise.all([
        apiGet<VirtualDeck[]>("/virtual-decks"),
        apiGet<MacroTemplate[]>("/macros"),
      ]);

      setDecks(nextDecks);
      setMacros(nextMacros);
      setState("ready");
    } catch {
      setState("error");
    }
  }, []);

  useEffect(() => {
    void load();
    const interval = window.setInterval(load, 3000);

    return () => window.clearInterval(interval);
  }, [load]);

  const deck = decks.find((item) => item.id === deckId);
  const rows = deck?.rows ?? fallbackRows;
  const columns = deck?.columns ?? fallbackColumns;
  const deckMacros = getDeckMacros(macros, deckId);
  const cells = Array.from({ length: rows * columns }, (_, index) => {
    const row = Math.floor(index / columns) + 1;
    const column = (index % columns) + 1;

    return {
      key: `cell-${row}-${column}`,
      label: `${index + 1}`,
    };
  });
  const largestAxis = Math.max(rows, columns);
  const gapReduction = (Math.max(0, largestAxis - 3) * 0.18).toFixed(2);
  const gridStyle = {
    "--deck-columns": columns,
    "--deck-rows": rows,
    "--deck-gap": `clamp(0.45rem, calc(2rem - ${gapReduction}rem), 2rem)`,
    "--deck-cell-size":
      "min(calc((100cqw - (var(--deck-columns) - 1) * var(--deck-gap)) / var(--deck-columns)), calc((100cqh - (var(--deck-rows) - 1) * var(--deck-gap)) / var(--deck-rows)))",
    gap: "var(--deck-gap)",
    gridTemplateColumns: `repeat(${columns}, var(--deck-cell-size))`,
    gridTemplateRows: `repeat(${rows}, var(--deck-cell-size))`,
  } as CSSProperties & Record<string, string | number>;

  async function runMacro(macroId: string) {
    try {
      await fetch(`${getBackendUrl()}/macros/${macroId}/run`, {
        method: "POST",
      });
      void load();
    } catch (error) {
      console.error("Erro ao executar macro virtual:", error);
    }
  }

  return (
    <main className="h-dvh overflow-hidden bg-[#12161C] text-white">
      <div className="flex h-full">
        <section className="relative flex min-w-0 flex-1 flex-col p-2 sm:p-4">
          <a
            aria-label="Voltar para decks virtuais"
            className="absolute  left-3 top-3 z-20 flex size-10 items-center justify-center  text-[#00b4ff] transition sm:left-5 sm:top-5"
            href={deckListHref}
            title="Voltar"
          >
            <ArrowLeft className="size-8" aria-hidden="true" />
          </a>

          <div className="pointer-events-none absolute right-3 top-3 z-20 flex size-10 items-center justify-center rounded-md  text-[#9fb0bf] shadow-[0_10px_30px_rgba(0,0,0,0.28)] backdrop-blur sm:right-5 sm:top-5">
            {state === "loading" ? (
              <LoaderCircle
                className="size-5 animate-spin text-[#00b4ff]"
                aria-hidden="true"
              />
            ) : state === "error" ? (
              <WifiOff className="size-5 text-[#ff5b7a]" aria-hidden="true" />
            ) : (
              <RadioTower className="size-5 text-[#00b4ff]" aria-hidden="true" />
            )}
          </div>

          <div className="flex flex-1 items-center justify-center overflow-hidden rounded-md p-2 [container-type:size] sm:p-3">
            <div className="grid place-content-center" style={gridStyle}>
              {cells.map((cell) => {
                const macro = deckMacros.find(
                  (item) => item.key.toLowerCase() === cell.key.toLowerCase()
                );
                const imageSrc = getImageSrc(macro);

                return (
                  <button
                    key={cell.key}
                    aria-disabled={!macro}
                    className="group relative flex size-full aspect-square touch-manipulation flex-col items-center justify-center gap-3 overflow-hidden rounded-xl border-2 border-[#3B424C] bg-[#181E23] p-3 text-center"
                    onClick={macro ? () => void runMacro(macro.id) : undefined}
                    type="button"
                  >
                    {imageSrc && macro ? (
                      <img
                        alt=""
                        className={[
                          "absolute inset-0 size-full object-cover",
                          macro.deckStateActive
                            ? "grayscale-0"
                            : "grayscale brightness-50",
                        ].join(" ")}
                        src={imageSrc}
                      />
                    ) : (
                      <div className="relative z-10 flex items-center justify-center text-[#3A93F5]">
                        <DeckIcon macro={macro} />
                      </div>
                    )}
                    <div className="relative z-10 min-w-0 max-w-full">
                      <div className="max-w-full truncate text-base font-bold leading-tight sm:text-xl">
                        {getActionLabel(macro)}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
