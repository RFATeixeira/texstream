"use client";

import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
import {
  ArrowLeft,
  Bell,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  LoaderCircle,
  LogOut,
  Mic,
  MicOff,
  RadioTower,
  Volume2,
  WifiOff,
} from "lucide-react";
import type { CSSProperties, ReactNode, SVGProps } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getFirebaseAuth, isFirebaseConfigured } from "../../lib/firebase";
import { renderDeckIcon } from "./deckIconCatalog";

type VirtualDeck = {
  id: string;
  name: string;
  rows: number;
  columns: number;
  color?: string;
  pageCount?: number;
  volumeControllers?: VolumeController[] | null;
};

type VolumeController = {
  id: string;
  name: string;
  inputName: string;
  orientation: "horizontal" | "vertical";
  position?: "top" | "right" | "bottom" | "left" | string;
  page?: number;
  row: number;
  column: number;
  volume: number;
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
  page?: number;
  pageIndex?: number;
  pageNumber?: number;
  deckPage?: number;
};

type ObsSnapshot = {
  connected: boolean;
  currentProgramSceneName?: string;
};

type LoadState = "loading" | "ready" | "error";
type IconProps = SVGProps<SVGSVGElement> & {
  size?: number;
  strokeWidth?: number;
};
type UserProfile = {
  id: string;
  displayName: string;
  email: string;
  photoUrl: string;
};

const BACKEND_PARAM_KEYS = ["host", "backendHost", "port", "backendPort"];
const USER_PARAM_KEYS = [
  "id",
  "userId",
  "uid",
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
const USER_STORAGE_KEY = "textream:virtual-deck-user";
const BACKEND_HOST_STORAGE_KEY = "textream:virtual-deck-host";

function getEmptyUserProfile(): UserProfile {
  return {
    id: "",
    displayName: "",
    email: "",
    photoUrl: "",
  };
}

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
  const requestedHost =
    params.get("host") ||
    params.get("backendHost") ||
    window.localStorage.getItem(BACKEND_HOST_STORAGE_KEY) ||
    "127.0.0.1";
  const host = getSafeBackendHost(requestedHost);
  const port = params.get("port") || params.get("backendPort") || "3434";

  window.localStorage.setItem(BACKEND_HOST_STORAGE_KEY, host);

  if (host.startsWith("http://") || host.startsWith("https://")) {
    return host.replace(/\/$/, "");
  }

  return `http://${host}:${port}`;
}

function getSafeBackendHost(host: string) {
  const trimmedHost = host.trim();

  if (isCurrentWebAppHost(trimmedHost)) {
    window.localStorage.removeItem(BACKEND_HOST_STORAGE_KEY);

    return "127.0.0.1";
  }

  return trimmedHost || "127.0.0.1";
}

function isCurrentWebAppHost(host: string) {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    const parsedHost = host.startsWith("http://") || host.startsWith("https://")
      ? new URL(host).hostname
      : host.split(":")[0];

    return parsedHost.toLowerCase() === window.location.hostname.toLowerCase();
  } catch {
    return false;
  }
}

function isMixedContentBackendUrl(backendUrl: string) {
  if (typeof window === "undefined") {
    return false;
  }

  return window.location.protocol === "https:" && backendUrl.startsWith("http://");
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
  url.searchParams.set("pageCount", String(getDeckPageCount(deck)));

  const color = normalizeDeckColor(deck.color);

  if (color) {
    url.searchParams.set("color", color);
  }

  return url.toString();
}

function saveUserProfile(profile: UserProfile) {
  window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(profile));
}

function clearUserProfile() {
  window.localStorage.removeItem(USER_STORAGE_KEY);
}

function isLoggedIn(profile: UserProfile) {
  return Boolean(profile.id || profile.displayName || profile.email || profile.photoUrl);
}

function getUserProfileFromFirebaseUser(user: User): UserProfile {
  return {
    id: user.uid,
    displayName: user.displayName ?? "",
    email: user.email ?? "",
    photoUrl: user.photoURL ?? "",
  };
}

function useSyncedUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const auth = getFirebaseAuth();

    if (!auth) {
      clearUserProfile();
      setProfile(getEmptyUserProfile());
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const firebaseProfile = getUserProfileFromFirebaseUser(user);
        saveUserProfile(firebaseProfile);
        setProfile(firebaseProfile);
        return;
      }

      clearUserProfile();
      setProfile(getEmptyUserProfile());
    });

    return unsubscribe;
  }, []);

  const syncProfile = useCallback((nextProfile: UserProfile) => {
    saveUserProfile(nextProfile);
    setProfile(nextProfile);
  }, []);

  return [profile, syncProfile] as const;
}

async function signInWithGoogle() {
  const auth = getFirebaseAuth();

  if (!auth) {
    throw new Error("Firebase nao configurado.");
  }

  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({
    prompt: "select_account",
  });

  const result = await signInWithPopup(auth, provider);

  return getUserProfileFromFirebaseUser(result.user);
}

async function signOutGoogle() {
  const auth = getFirebaseAuth();

  if (auth) {
    await signOut(auth);
  }

  clearUserProfile();
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

function getDeckPageCount(deck?: VirtualDeck, fallbackPageCount = 1) {
  return Math.max(1, Math.min(20, Number(deck?.pageCount) || fallbackPageCount));
}

function getMacroPage(macro: MacroTemplate) {
  if (typeof macro.pageIndex === "number" && Number.isFinite(macro.pageIndex)) {
    return Math.max(1, macro.pageIndex + 1);
  }

  const page = macro.page ?? macro.pageNumber ?? macro.deckPage;

  if (typeof page === "number" && Number.isFinite(page)) {
    return Math.max(1, page);
  }

  return 1;
}

function getVolumeControllerPage(controller: VolumeController) {
  return Math.max(1, Number(controller.page) || 1);
}

function getVolumeControllerCell(controller: VolumeController, rows: number, columns: number) {
  const position = controller.position?.toLowerCase();
  let row = Math.min(rows, Math.max(1, Number(controller.row) || 1));
  let column = Math.min(columns, Math.max(1, Number(controller.column) || 1));

  if (controller.orientation === "vertical") {
    if (position === "left") {
      column = 1;
    }

    if (position === "right") {
      column = columns;
    }
  }

  if (controller.orientation === "horizontal") {
    if (position === "top") {
      row = 1;
    }

    if (position === "bottom") {
      row = rows;
    }
  }

  return { row, column };
}

function getVolumeControllerSide(controller: VolumeController) {
  const position = controller.position?.toLowerCase();

  if (controller.orientation === "vertical") {
    return position === "left" ? "left" : "right";
  }

  return position === "top" ? "top" : "bottom";
}

function clampVolume(volume: number) {
  return Math.min(100, Math.max(0, Math.round(volume)));
}

function getVolumeOverrideKey(deckId: string, controllerId: string) {
  return `${deckId}:${controllerId}`;
}

function applyVolumeOverrides(
  decks: VirtualDeck[],
  volumeOverrides: Record<string, number>
) {
  return decks.map((deck) => ({
    ...deck,
    volumeControllers: deck.volumeControllers
      ? deck.volumeControllers.map((controller) => {
          const override =
            volumeOverrides[getVolumeOverrideKey(deck.id, controller.id)];

          return typeof override === "number"
            ? {
                ...controller,
                volume: override,
              }
            : controller;
        })
      : deck.volumeControllers,
  }));
}

function applyMacroStateOverrides(
  macros: MacroTemplate[],
  macroStateOverrides: Record<string, boolean>
) {
  return macros.map((macro) => {
    const override = macroStateOverrides[macro.id];

    return typeof override === "boolean"
      ? {
          ...macro,
          deckStateActive: override,
        }
      : macro;
  });
}

async function setVolumeControllerVolume(
  controller: VolumeController,
  volume: number
) {
  const payload = JSON.stringify({
    volume,
    inputName: controller.inputName,
  });
  const requests = [{ method: "POST", path: "/obs/audio-volume" }];

  for (const request of requests) {
    try {
      const response = await fetch(`${getBackendUrl()}${request.path}`, {
        body: payload,
        headers: {
          "Content-Type": "application/json",
        },
        method: request.method,
      });

      if (response.ok) {
        return;
      }
    } catch {
      continue;
    }
  }

  console.warn("Nao foi possivel ajustar o volume.");
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

function isActiveSceneMacro(macro: MacroTemplate | undefined, activeSceneName: string) {
  return Boolean(
    macro?.actionType === "obs-scene" &&
      macro.obsSceneName?.trim() &&
      activeSceneName.trim() &&
      macro.obsSceneName.trim().toLowerCase() === activeSceneName.trim().toLowerCase()
  );
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
  if (macro?.actionType === "obs-audio-mute") {
    const Icon = macro.deckStateActive ? MicOff : Mic;

    return <Icon className="size-14 sm:size-16" aria-hidden="true" />;
  }

  return renderDeckIcon(macro?.deckIcon, macro?.actionType, {
    className: "size-14 sm:size-16",
  });
}

function VolumeControllerTile({
  className = "",
  controller,
  onCommit,
  onVolumeChange,
  style,
}: {
  className?: string;
  controller: VolumeController;
  onCommit: (controller: VolumeController, volume: number) => void;
  onVolumeChange: (controllerId: string, volume: number) => void;
  style?: CSSProperties;
}) {
  const volume = clampVolume(Number(controller.volume) || 0);
  const isVertical = controller.orientation === "vertical";

  return (
    <div
      className={[
        "relative flex overflow-hidden rounded-4xl border-2 border-[#3B424C] bg-[#181E23] p-3",
        isVertical
          ? "min-h-0 flex-col items-center justify-between"
          : "min-w-0 items-center gap-4",
        className,
      ].join(" ")}
      onClick={(event) => event.stopPropagation()}
      onPointerDown={(event) => event.stopPropagation()}
      onTouchEnd={(event) => event.stopPropagation()}
      style={style}
    >
      <div
        className={[
          "flex min-w-0 items-center gap-2",
          isVertical ? "w-full flex-col text-center" : "flex-[0.8]",
        ].join(" ")}
      >
        <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[#1B242E] text-[#3A93F5]">
          <Volume2 className="size-6" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <div className="truncate text-sm font-bold text-white">
            {controller.name || controller.inputName || "Volume"}
          </div>
          <div className="mt-1 truncate text-xs font-semibold text-[#8E949C]">
            {volume}%
          </div>
        </div>
      </div>

      <div
        className={[
          "relative flex items-center justify-center",
          isVertical ? "min-h-0 w-full flex-1 py-5" : "min-w-0 flex-[2.6]",
        ].join(" ")}
      >
        <input
          aria-label={`Volume ${controller.name || controller.inputName || ""}`.trim()}
          className={[
            "virtual-volume-range",
            isVertical
              ? "virtual-volume-range-vertical absolute"
              : "virtual-volume-range-horizontal w-full",
          ].join(" ")}
          max={100}
          min={0}
          onChange={(event) =>
            onVolumeChange(controller.id, clampVolume(Number(event.target.value)))
          }
          onKeyUp={(event) =>
            onCommit(controller, clampVolume(Number(event.currentTarget.value)))
          }
          onPointerUp={(event) =>
            onCommit(controller, clampVolume(Number(event.currentTarget.value)))
          }
          onTouchEnd={(event) =>
            onCommit(controller, clampVolume(Number(event.currentTarget.value)))
          }
          type="range"
          value={volume}
        />
      </div>
    </div>
  );
}

function UserAvatar({ profile }: { profile: UserProfile }) {
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

function LoginRequired({
  message,
  onLogin,
  onRetry,
  retrying,
  signingIn,
}: {
  message: string;
  onLogin: () => void;
  onRetry: () => void;
  retrying: boolean;
  signingIn: boolean;
}) {
  const [host, setHost] = useState(() => {
    if (typeof window === "undefined") {
      return "";
    }

    return (
      window.localStorage.getItem(BACKEND_HOST_STORAGE_KEY) ||
      "127.0.0.1"
    );
  });

  function handleRetry() {
    const nextHost = host.trim();

    if (nextHost) {
      window.localStorage.setItem(BACKEND_HOST_STORAGE_KEY, nextHost);
    }

    onRetry();
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-[#12161C] p-5 text-white">
      <div className="w-full max-w-md rounded-2xl bg-[#181E24] p-6">
        <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-2xl bg-[#1B242E] text-[#55A8FF]">
          <TextreamLogoIcon size={36} />
        </div>
        <h1 className="text-center text-xl font-bold">Login necessario</h1>
        <p className="mt-3 text-center text-sm leading-6 text-slate-400">
          Entre com a mesma conta Google usada no Textream Desktop.
        </p>

        {!isFirebaseConfigured && (
          <div className="mt-5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-100">
            Configure as variaveis NEXT_PUBLIC_FIREBASE_* para ativar o login.
          </div>
        )}

        {message && (
          <div className="mt-5 rounded-xl bg-white/5 px-3 py-2 text-xs text-slate-300">
            {message}
          </div>
        )}

        <button
          className="mt-6 flex w-full items-center justify-center gap-3 rounded-xl bg-white px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-70"
          disabled={!isFirebaseConfigured || signingIn}
          onClick={onLogin}
          type="button"
        >
          {signingIn ? (
            <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <span className="flex size-5 items-center justify-center rounded-full bg-slate-950 text-xs font-bold text-white">
              G
            </span>
          )}
          {signingIn ? "Aguarde" : "Entrar com Google"}
        </button>

        <div className="mt-5 grid gap-3">
          <input
            className="h-12 rounded-xl border border-white/10 bg-[#12161C] px-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-[#3987DB]"
            onChange={(event) => setHost(event.target.value)}
            placeholder="Host do app desktop"
            type="text"
            value={host}
          />
          <button
            className="flex h-12 items-center justify-center gap-2 rounded-xl bg-[#19273A] px-4 text-sm font-bold text-white transition hover:bg-[#223754] disabled:cursor-not-allowed disabled:opacity-70"
            disabled={retrying}
            onClick={handleRetry}
            type="button"
          >
            {retrying && (
              <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
            )}
            Sincronizar host do app desktop
          </button>
        </div>
      </div>
    </main>
  );
}

function AuthLoading() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-[#12161C] text-white">
      <LoaderCircle className="size-7 animate-spin text-[#00b4ff]" aria-hidden="true" />
    </main>
  );
}

function Shell({
  children,
  onSignOut,
  profile,
}: {
  children: ReactNode;
  onSignOut: () => void;
  profile: UserProfile;
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
              onClick={onSignOut}
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
              <UserAvatar profile={profile} />
            </div>
          </header>

          {children}
        </div>
      </div>
    </main>
  );
}

export function VirtualDeckHome() {
  const [profile, syncProfile] = useSyncedUserProfile();
  const [decks, setDecks] = useState<VirtualDeck[]>([]);
  const [macros, setMacros] = useState<MacroTemplate[]>([]);
  const [state, setState] = useState<LoadState>("loading");
  const [authMessage, setAuthMessage] = useState("");
  const [authState, setAuthState] = useState<"idle" | "signing-in">("idle");
  const [hasCheckedDesktopSession, setHasCheckedDesktopSession] = useState(false);
  const loggedIn = profile ? isLoggedIn(profile) : false;

  const load = useCallback(async () => {
    try {
      setState((current) => (current === "ready" ? current : "loading"));
      const [nextDecks, nextMacros] = await Promise.all([
        apiGet<VirtualDeck[]>("/virtual-decks"),
        apiGet<MacroTemplate[]>("/macros"),
      ]);

      setDecks(nextDecks);
      setMacros(nextMacros);
      setHasCheckedDesktopSession(true);

      setState("ready");
    } catch {
      setHasCheckedDesktopSession(true);
      setState("error");
    }
  }, []);

  useEffect(() => {
    if (!profile || !loggedIn) {
      return;
    }

    void load();
    const interval = window.setInterval(load, 5000);

    return () => window.clearInterval(interval);
  }, [load, loggedIn, profile]);

  const handleGoogleLogin = useCallback(async () => {
    if (authState === "signing-in") {
      return;
    }

    setAuthState("signing-in");
    setAuthMessage("");

    try {
      const nextProfile = await signInWithGoogle();
      syncProfile(nextProfile);
      setState("loading");
      setHasCheckedDesktopSession(false);
    } catch (error) {
      setAuthMessage(error instanceof Error ? error.message : "Erro ao autenticar.");
    } finally {
      setAuthState("idle");
    }
  }, [authState, syncProfile]);

  const handleSignOut = useCallback(() => {
    void signOutGoogle();
    syncProfile(getEmptyUserProfile());
    setDecks([]);
    setMacros([]);
    setState("loading");
    setHasCheckedDesktopSession(false);
  }, [syncProfile]);

  if (!profile) {
    return <AuthLoading />;
  }

  if (!loggedIn) {
    return (
      <LoginRequired
        message={authMessage}
        onLogin={handleGoogleLogin}
        onRetry={() => {
          setState("loading");
          setHasCheckedDesktopSession(false);
          void load();
        }}
        retrying={state === "loading"}
        signingIn={authState === "signing-in"}
      />
    );
  }

  return (
    <Shell onSignOut={handleSignOut} profile={profile}>
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
                    className="h-4 w-4 rounded-full"
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
            <div className="font-semibold">
              Nao foi possivel conectar ao host do Textream.
            </div>
            <div className="mt-2 leading-6 text-[#d89aa4]">
              {(() => {
                const backendUrl = getBackendUrl();

                if (isMixedContentBackendUrl(backendUrl)) {
                  return (
                    <>
                      Tentando acessar {backendUrl}, mas esta pagina esta em
                      HTTPS. O navegador pode bloquear conexoes para o backend
                      local em HTTP. Abra o deck pelo endereco local gerado pelo
                      Textream Desktop ou configure um backend HTTPS.
                    </>
                  );
                }

                return (
                  <>
                    Tentando acessar {backendUrl}. Abra o deck pelo link/QR do
                    Textream Desktop ou informe o IP do computador onde o app
                    esta rodando.
                  </>
                );
              })()}
            </div>
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
  const [profile, syncProfile] = useSyncedUserProfile();
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
  const fallbackPageCount = Math.min(
    20,
    Math.max(1, Number(params.get("pageCount")) || 1)
  );
  const [decks, setDecks] = useState<VirtualDeck[]>([]);
  const [macros, setMacros] = useState<MacroTemplate[]>([]);
  const [obsSnapshot, setObsSnapshot] = useState<ObsSnapshot | null>(null);
  const [state, setState] = useState<LoadState>("loading");
  const [authMessage, setAuthMessage] = useState("");
  const [authState, setAuthState] = useState<"idle" | "signing-in">("idle");
  const [hasCheckedDesktopSession, setHasCheckedDesktopSession] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const volumeOverridesRef = useRef<Record<string, number>>({});
  const macroStateOverridesRef = useRef<Record<string, boolean>>({});
  const loggedIn = profile ? isLoggedIn(profile) : false;
  const deck = decks.find((item) => item.id === deckId);
  const rows = deck?.rows ?? fallbackRows;
  const columns = deck?.columns ?? fallbackColumns;
  const pageCount = getDeckPageCount(deck, fallbackPageCount);
  const hasMultiplePages = pageCount > 1;

  const load = useCallback(async () => {
    try {
      const [nextDecks, nextMacros, nextObsSnapshot] = await Promise.all([
        apiGet<VirtualDeck[]>("/virtual-decks"),
        apiGet<MacroTemplate[]>("/macros"),
        apiGet<ObsSnapshot>("/obs/snapshot").catch(() => null),
      ]);

      setDecks(applyVolumeOverrides(nextDecks, volumeOverridesRef.current));
      setMacros(applyMacroStateOverrides(nextMacros, macroStateOverridesRef.current));
      setObsSnapshot(nextObsSnapshot);
      setHasCheckedDesktopSession(true);

      setState("ready");
    } catch {
      setHasCheckedDesktopSession(true);
      setState("error");
    }
  }, []);

  useEffect(() => {
    if (!profile || !loggedIn) {
      return;
    }

    void load();
    const interval = window.setInterval(load, 3000);

    return () => window.clearInterval(interval);
  }, [load, loggedIn, profile]);

  const handleGoogleLogin = useCallback(async () => {
    if (authState === "signing-in") {
      return;
    }

    setAuthState("signing-in");
    setAuthMessage("");

    try {
      const nextProfile = await signInWithGoogle();
      syncProfile(nextProfile);
      setState("loading");
      setHasCheckedDesktopSession(false);
    } catch (error) {
      setAuthMessage(error instanceof Error ? error.message : "Erro ao autenticar.");
    } finally {
      setAuthState("idle");
    }
  }, [authState, syncProfile]);

  useEffect(() => {
    setCurrentPage((page) => Math.min(pageCount, Math.max(1, page)));
  }, [pageCount]);

  if (!profile) {
    return <AuthLoading />;
  }

  if (!loggedIn) {
    return (
      <LoginRequired
        message={authMessage}
        onLogin={handleGoogleLogin}
        onRetry={() => {
          setState("loading");
          setHasCheckedDesktopSession(false);
          void load();
        }}
        retrying={state === "loading"}
        signingIn={authState === "signing-in"}
      />
    );
  }

  const deckMacros = getDeckMacros(macros, deckId).filter(
    (macro) => getMacroPage(macro) === currentPage
  );
  const volumeControllers = (deck?.volumeControllers ?? []).filter(
    (controller) => getVolumeControllerPage(controller) === currentPage
  );
  const activeSceneName = obsSnapshot?.currentProgramSceneName ?? "";
  const topVolumeControllers = volumeControllers.filter(
    (controller) => getVolumeControllerSide(controller) === "top"
  );
  const rightVolumeControllers = volumeControllers.filter(
    (controller) => getVolumeControllerSide(controller) === "right"
  );
  const bottomVolumeControllers = volumeControllers.filter(
    (controller) => getVolumeControllerSide(controller) === "bottom"
  );
  const leftVolumeControllers = volumeControllers.filter(
    (controller) => getVolumeControllerSide(controller) === "left"
  );
  const cells = Array.from({ length: rows * columns }, (_, index) => {
    const row = Math.floor(index / columns) + 1;
    const column = (index % columns) + 1;

    return {
      key: `cell-${row}-${column}`,
      label: `${index + 1}`,
      row,
      column,
    };
  });
  const largestAxis = Math.max(rows, columns);
  const gapReduction = (Math.max(0, largestAxis - 3) * 0.18).toFixed(2);
  const sideControlCount =
    leftVolumeControllers.length + rightVolumeControllers.length;
  const sideControlGapCount =
    Math.max(0, leftVolumeControllers.length - 1) +
    Math.max(0, rightVolumeControllers.length - 1) +
    (leftVolumeControllers.length ? 1 : 0) +
    (rightVolumeControllers.length ? 1 : 0);
  const stackedControlCount =
    topVolumeControllers.length + bottomVolumeControllers.length;
  const stackedControlGapCount =
    Math.max(0, topVolumeControllers.length - 1) +
    Math.max(0, bottomVolumeControllers.length - 1) +
    (topVolumeControllers.length ? 1 : 0) +
    (bottomVolumeControllers.length ? 1 : 0);
  const gridStyle = {
    "--deck-columns": columns,
    "--deck-rows": rows,
    "--deck-gap": `clamp(0.45rem, calc(2rem - ${gapReduction}rem), 2rem)`,
    "--volume-control-size": "clamp(7rem, 16cqw, 11rem)",
    "--deck-side-control-count": sideControlCount,
    "--deck-side-control-gap-count": sideControlGapCount,
    "--deck-stacked-control-count": stackedControlCount,
    "--deck-stacked-control-gap-count": stackedControlGapCount,
    "--deck-cell-size":
      "min(calc((100cqw - var(--deck-side-control-count) * var(--volume-control-size) - var(--deck-side-control-gap-count) * var(--deck-gap) - (var(--deck-columns) - 1) * var(--deck-gap)) / var(--deck-columns)), calc((100cqh - var(--deck-stacked-control-count) * var(--volume-control-size) - var(--deck-stacked-control-gap-count) * var(--deck-gap) - (var(--deck-rows) - 1) * var(--deck-gap)) / var(--deck-rows)))",
    gap: "var(--deck-gap)",
    gridTemplateColumns: `repeat(${columns}, var(--deck-cell-size))`,
    gridTemplateRows: `repeat(${rows}, var(--deck-cell-size))`,
  } as CSSProperties & Record<string, string | number>;
  const deckFrameStyle = {
    ...gridStyle,
    "--deck-grid-width":
      "calc(var(--deck-columns) * var(--deck-cell-size) + (var(--deck-columns) - 1) * var(--deck-gap))",
    "--deck-grid-height":
      "calc(var(--deck-rows) * var(--deck-cell-size) + (var(--deck-rows) - 1) * var(--deck-gap))",
  } as CSSProperties & Record<string, string | number>;
  const deckGapStyle = { gap: "var(--deck-gap)" } as CSSProperties;
  const stackedControlsStyle = {
    gap: "var(--deck-gap)",
    width: "var(--deck-grid-width)",
  } as CSSProperties;
  const horizontalControlStyle = {
    height: "var(--volume-control-size)",
  } as CSSProperties;
  const sideControlsStyle = {
    gap: "var(--deck-gap)",
    height: "var(--deck-grid-height)",
  } as CSSProperties;
  const verticalControlStyle = {
    width: "var(--volume-control-size)",
  } as CSSProperties;

  async function runMacro(macro: MacroTemplate) {
    if (macro.actionType === "obs-audio-mute") {
      const nextActive = !macro.deckStateActive;

      macroStateOverridesRef.current = {
        ...macroStateOverridesRef.current,
        [macro.id]: nextActive,
      };

      setMacros((currentMacros) =>
        currentMacros.map((currentMacro) =>
          currentMacro.id === macro.id
            ? {
                ...currentMacro,
                deckStateActive: nextActive,
              }
            : currentMacro
        )
      );
    }

    try {
      await fetch(`${getBackendUrl()}/macros/${macro.id}/run`, {
        method: "POST",
      });
      void load();
    } catch (error) {
      console.error("Erro ao executar macro virtual:", error);
    }
  }

  function updateVolumeController(controllerId: string, volume: number) {
    volumeOverridesRef.current = {
      ...volumeOverridesRef.current,
      [getVolumeOverrideKey(deckId, controllerId)]: volume,
    };

    setDecks((currentDecks) =>
      currentDecks.map((currentDeck) => {
        if (currentDeck.id !== deckId) {
          return currentDeck;
        }

        return {
          ...currentDeck,
          volumeControllers: (currentDeck.volumeControllers ?? []).map(
            (controller) =>
              controller.id === controllerId
                ? {
                    ...controller,
                    volume,
                  }
                : controller
          ),
        };
      })
    );
  }

  async function commitVolumeController(
    controller: VolumeController,
    volume: number
  ) {
    try {
      updateVolumeController(controller.id, volume);
      await setVolumeControllerVolume(controller, volume);
      void load();
    } catch (error) {
      console.error("Erro ao ajustar volume virtual:", error);
    }
  }

  function goToPreviousPage() {
    setCurrentPage((page) => (page <= 1 ? pageCount : page - 1));
  }

  function goToNextPage() {
    setCurrentPage((page) => (page >= pageCount ? 1 : page + 1));
  }

  function handleTouchEnd(touchEndX: number) {
    if (!hasMultiplePages || touchStartX === null) {
      setTouchStartX(null);
      return;
    }

    const distance = touchStartX - touchEndX;
    const swipeThreshold = 48;

    if (Math.abs(distance) >= swipeThreshold) {
      if (distance > 0) {
        goToNextPage();
      } else {
        goToPreviousPage();
      }
    }

    setTouchStartX(null);
  }

  return (
    <main className="h-dvh overflow-hidden bg-[#12161C] text-white">
      <div className="flex h-full">
        <section
          className="relative flex min-w-0 flex-1 flex-col p-2 sm:p-4"
          onTouchEnd={(event) => handleTouchEnd(event.changedTouches[0]?.clientX ?? 0)}
          onTouchStart={(event) => {
            if (hasMultiplePages) {
              setTouchStartX(event.touches[0]?.clientX ?? null);
            }
          }}
        >
          <a
            aria-label="Voltar para decks virtuais"
            className="absolute  left-3 top-3 z-20 flex size-10 items-center justify-center  text-[#00b4ff] transition sm:left-5 sm:top-5"
            href={deckListHref}
            title="Voltar"
          >
            <ArrowLeft className="size-8" aria-hidden="true" />
          </a>

          <div className="pointer-events-none absolute right-3 top-3 z-20 flex size-10 items-center justify-center text-[#9fb0bf] sm:right-5 sm:top-5">
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

          {hasMultiplePages && (
            <>
              <button
                aria-label="Pagina anterior"
                className="absolute left-3 top-1/2 z-20 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-[#181E24]/90 text-[#00b4ff] shadow-[0_12px_30px_rgba(0,0,0,0.3)] backdrop-blur transition active:scale-95 sm:left-5"
                onClick={goToPreviousPage}
                type="button"
              >
                <ChevronLeft className="size-7" aria-hidden="true" />
              </button>
              <button
                aria-label="Proxima pagina"
                className="absolute right-3 top-1/2 z-20 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-[#181E24]/90 text-[#00b4ff] shadow-[0_12px_30px_rgba(0,0,0,0.3)] backdrop-blur transition active:scale-95 sm:right-5"
                onClick={goToNextPage}
                type="button"
              >
                <ChevronRight className="size-7" aria-hidden="true" />
              </button>
            </>
          )}

          <div className="flex flex-1 items-center justify-center overflow-hidden rounded-md p-2 pb-8 @container-size sm:p-3 sm:pb-9">
            <div
              className="flex flex-col items-center justify-center"
              style={deckFrameStyle}
            >
              {topVolumeControllers.length > 0 && (
                <div
                  className="grid"
                  style={stackedControlsStyle}
                >
                  {topVolumeControllers.map((controller) => (
                    <VolumeControllerTile
                      key={controller.id}
                      className="w-full"
                      controller={controller}
                      onCommit={(nextController, volume) =>
                        void commitVolumeController(nextController, volume)
                      }
                      onVolumeChange={updateVolumeController}
                      style={horizontalControlStyle}
                    />
                  ))}
                </div>
              )}

              <div
                className="flex items-center justify-center"
                style={deckGapStyle}
              >
                {leftVolumeControllers.length > 0 && (
                  <div className="flex" style={sideControlsStyle}>
                    {leftVolumeControllers.map((controller) => (
                      <VolumeControllerTile
                        key={controller.id}
                        className="h-full"
                        controller={controller}
                        onCommit={(nextController, volume) =>
                          void commitVolumeController(nextController, volume)
                        }
                        onVolumeChange={updateVolumeController}
                        style={verticalControlStyle}
                      />
                    ))}
                  </div>
                )}

                <div className="grid place-content-center" style={gridStyle}>
                  {cells.map((cell) => {
                    const macro = deckMacros.find(
                      (item) => item.key.toLowerCase() === cell.key.toLowerCase()
                    );
                    const imageSrc = getImageSrc(macro);
                    const isActiveScene = isActiveSceneMacro(macro, activeSceneName);

                    return (
                      <button
                        key={cell.key}
                        aria-disabled={!macro}
                        className={[
                          "group relative flex size-full aspect-square touch-manipulation flex-col items-center justify-center gap-3 overflow-hidden rounded-4xl border-2 bg-[#181E23] p-3 text-center transition",
                          isActiveScene
                            ? "border-[#00b4ff] shadow-[0_0_0_2px_rgba(0,180,255,0.28),0_0_28px_rgba(0,180,255,0.18)]"
                            : "border-[#3B424C]",
                        ].join(" ")}
                        onClick={macro ? () => void runMacro(macro) : undefined}
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

                {rightVolumeControllers.length > 0 && (
                  <div className="flex" style={sideControlsStyle}>
                    {rightVolumeControllers.map((controller) => (
                      <VolumeControllerTile
                        key={controller.id}
                        className="h-full"
                        controller={controller}
                        onCommit={(nextController, volume) =>
                          void commitVolumeController(nextController, volume)
                        }
                        onVolumeChange={updateVolumeController}
                        style={verticalControlStyle}
                      />
                    ))}
                  </div>
                )}
              </div>

              {bottomVolumeControllers.length > 0 && (
                <div
                  className="grid"
                  style={stackedControlsStyle}
                >
                  {bottomVolumeControllers.map((controller) => (
                    <VolumeControllerTile
                      key={controller.id}
                      className="w-full"
                      controller={controller}
                      onCommit={(nextController, volume) =>
                        void commitVolumeController(nextController, volume)
                      }
                      onVolumeChange={updateVolumeController}
                      style={horizontalControlStyle}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {hasMultiplePages && (
            <div
              aria-label={`Pagina ${currentPage} de ${pageCount}`}
              className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full bg-[#181E24]/85 px-3 py-2 backdrop-blur sm:bottom-4"
            >
              {Array.from({ length: pageCount }, (_, index) => {
                const page = index + 1;

                return (
                  <button
                    key={page}
                    aria-label={`Ir para pagina ${page}`}
                    aria-current={page === currentPage ? "page" : undefined}
                    className={[
                      "size-2.5 rounded-full transition",
                      page === currentPage
                        ? "bg-[#00b4ff]"
                        : "bg-white/25 active:bg-white/50",
                    ].join(" ")}
                    onClick={() => setCurrentPage(page)}
                    type="button"
                  />
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
