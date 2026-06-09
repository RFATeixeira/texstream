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
  RadioTower,
  Volume2,
  VolumeX,
  WifiOff,
} from "lucide-react";

import {
  FaMicrophone,
  FaMicrophoneSlash,
  FaVolumeMute,
  FaVolumeUp,
} from "react-icons/fa";
import type { CSSProperties, ReactNode, SVGProps } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getFirebaseAuth, isFirebaseConfigured } from "../../lib/firebase";
import { renderDeckIcon } from "./deckIconCatalog";

type VirtualDeck = {
  id: string;
  name: string;
  rows: number;
  columns: number;
  color?: string;
  pageCount?: number;
  actionPositions?: Record<string, DeckActionPosition> | null;
  volumeControllers?: VolumeController[] | null;
};

type DeckActionPosition = {
  page?: number;
  row?: number;
  column?: number;
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

  // Opção vinda do backend para mostrar o botão interno de mute
  showMuteButton?: boolean;
  muteButtonEnabled?: boolean;
  hasMuteButton?: boolean;

  // Estado atual do mute vindo do OBS snapshot
  muted?: boolean;
};

type MacroTemplate = {
  id: string;
  name: string;
  deviceId: string;
  key: string;
  row?: number;
  column?: number;
  deckRow?: number;
  deckColumn?: number;
  x?: number;
  y?: number;
  index?: number;
  position?: number;
  slot?: number;
  buttonIndex?: number;
  deckIndex?: number;
  actionType?: string;
  obsSceneName?: string;
  obsSourceName?: string;
  obsAudioInputName?: string;
  obsAudioMuted?: boolean;
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

type ObsAudioInputState = {
  inputName: string;
  muted?: boolean;
  volume?: number;
};

type ObsSnapshot = {
  connected: boolean;
  audioInputStates?: ObsAudioInputState[];
  currentProgramSceneName?: string;
};

type TimedBooleanOverride = {
  updatedAt: number;
  value: boolean;
};

type TimedNumberOverride = {
  updatedAt: number;
  value: number;
};

type OptimisticMacroState = {
  previousActive?: boolean;
  previousSceneName?: string;
};

type ScreenWakeLockSentinel = {
  addEventListener?: (type: "release", listener: () => void) => void;
  release: () => Promise<void>;
};

type NavigatorWithWakeLock = Navigator & {
  wakeLock?: {
    request: (type: "screen") => Promise<ScreenWakeLockSentinel>;
  };
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
const OBS_SYNC_OVERRIDE_TTL_MS = 5000;
const OBS_SNAPSHOT_POLL_MS = 15000;
const DECK_CONFIG_SYNC_MS = 5000;
const BUTTON_ERROR_TTL_MS = 1800;

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

function getMacroActionPosition(
  macro: MacroTemplate,
  actionPositions?: Record<string, DeckActionPosition> | null
) {
  if (!actionPositions) {
    return undefined;
  }

  const directPosition = actionPositions[macro.key] ?? actionPositions[macro.id];

  if (directPosition) {
    return directPosition;
  }

  const normalizedCandidates = new Set(
    [
      macro.key,
      macro.id,
      macro.name,
      macro.deckTitle,
      macro.obsSceneName,
      macro.obsSourceName,
      macro.obsAudioInputName,
    ]
      .filter(Boolean)
      .map((value) => normalizeActionPositionKey(String(value)))
  );

  for (const [positionKey, position] of Object.entries(actionPositions)) {
    if (normalizedCandidates.has(normalizeActionPositionKey(positionKey))) {
      return position;
    }
  }

  return undefined;
}

function normalizeActionPositionKey(key: string) {
  return key.trim().toLowerCase();
}

function getMacroPage(
  macro: MacroTemplate,
  actionPositions?: Record<string, DeckActionPosition> | null
) {
  const actionPosition = getMacroActionPosition(macro, actionPositions);

  if (
    typeof actionPosition?.page === "number" &&
    Number.isFinite(actionPosition.page)
  ) {
    return Math.max(1, actionPosition.page);
  }

  if (typeof macro.pageIndex === "number" && Number.isFinite(macro.pageIndex)) {
    return Math.max(1, macro.pageIndex + 1);
  }

  const page = macro.page ?? macro.pageNumber ?? macro.deckPage;

  if (typeof page === "number" && Number.isFinite(page)) {
    return Math.max(1, page);
  }

  return 1;
}

function normalizeDeckCoordinate(value: number, max: number) {
  if (!Number.isFinite(value)) {
    return undefined;
  }

  if (value >= 1 && value <= max) {
    return value;
  }

  if (value >= 0 && value < max) {
    return value + 1;
  }

  return undefined;
}

function getMacroNumberField(macro: MacroTemplate, fieldName: string) {
  const value = (macro as unknown as Record<string, unknown>)[fieldName];

  return typeof value === "number" && Number.isFinite(value)
    ? value
    : undefined;
}

function getMacroCoordinateFields(macro: MacroTemplate) {
  const row =
    macro.row ??
    macro.deckRow ??
    macro.y ??
    getMacroNumberField(macro, "buttonRow") ??
    getMacroNumberField(macro, "positionRow");
  const column =
    macro.column ??
    macro.deckColumn ??
    macro.x ??
    getMacroNumberField(macro, "buttonColumn") ??
    getMacroNumberField(macro, "positionColumn");

  return { column, row };
}

function getCellKeyFromCoordinates(
  row: number | undefined,
  column: number | undefined,
  rows: number,
  columns: number
) {
  if (typeof row !== "number" || typeof column !== "number") {
    return undefined;
  }

  const normalizedRow = normalizeDeckCoordinate(row, rows);
  const normalizedColumn = normalizeDeckCoordinate(column, columns);

  if (!normalizedRow || !normalizedColumn) {
    return undefined;
  }

  return `cell-${normalizedRow}-${normalizedColumn}`;
}

function getCellKeyFromLinearIndex(index: number, rows: number, columns: number) {
  if (!Number.isFinite(index)) {
    return undefined;
  }

  const totalCells = rows * columns;
  const normalizedIndex =
    index >= 0 && index < totalCells
      ? index
      : index >= 1 && index <= totalCells
        ? index - 1
        : undefined;

  if (typeof normalizedIndex !== "number") {
    return undefined;
  }

  const row = Math.floor(normalizedIndex / columns) + 1;
  const column = (normalizedIndex % columns) + 1;

  return `cell-${row}-${column}`;
}

function getCellKeyFromMacroKey(key: string, rows: number, columns: number) {
  const normalizedKey = key.trim().toLowerCase();

  if (!normalizedKey) {
    return undefined;
  }

  const coordinateMatch = normalizedKey.match(
    /(?:cell|key|button|btn)?[-_: ]*(\d+)[-_,:x ]+(\d+)/
  );

  if (coordinateMatch) {
    return getCellKeyFromCoordinates(
      Number(coordinateMatch[1]),
      Number(coordinateMatch[2]),
      rows,
      columns
    );
  }

  const linearMatch = normalizedKey.match(/^(?:cell|key|button|btn|slot)?[-_: ]*(\d+)$/);

  if (linearMatch) {
    return getCellKeyFromLinearIndex(Number(linearMatch[1]), rows, columns);
  }

  return normalizedKey;
}

function getMacroCellKey(
  macro: MacroTemplate,
  rows: number,
  columns: number,
  actionPositions?: Record<string, DeckActionPosition> | null
) {
  const actionPosition = getMacroActionPosition(macro, actionPositions);
  const actionPositionCellKey = getCellKeyFromCoordinates(
    actionPosition?.row,
    actionPosition?.column,
    rows,
    columns
  );

  if (actionPositionCellKey) {
    return actionPositionCellKey;
  }

  const coordinates = getMacroCoordinateFields(macro);
  const coordinateCellKey = getCellKeyFromCoordinates(
    coordinates.row,
    coordinates.column,
    rows,
    columns
  );

  if (coordinateCellKey) {
    return coordinateCellKey;
  }

  const linearIndex =
    macro.index ??
    macro.position ??
    macro.slot ??
    macro.buttonIndex ??
    macro.deckIndex ??
    getMacroNumberField(macro, "order");
  const linearCellKey =
    typeof linearIndex === "number"
      ? getCellKeyFromLinearIndex(linearIndex, rows, columns)
      : undefined;

  if (linearCellKey) {
    return linearCellKey;
  }

  return getCellKeyFromMacroKey(macro.key ?? "", rows, columns);
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

function shouldShowVolumeMuteButton(controller: VolumeController) {
  return Boolean(
    controller.showMuteButton ??
    controller.muteButtonEnabled ??
    controller.hasMuteButton
  );
}

function normalizeAudioInputName(inputName?: string) {
  return inputName?.trim().toLowerCase() ?? "";
}

function getObsAudioInputState(
  obsSnapshot: ObsSnapshot | null,
  inputName?: string
) {
  const normalizedInputName = normalizeAudioInputName(inputName);

  if (!normalizedInputName) {
    return undefined;
  }

  return obsSnapshot?.audioInputStates?.find(
    (inputState) =>
      normalizeAudioInputName(inputState.inputName) === normalizedInputName
  );
}

function withOptimisticAudioMuted(
  obsSnapshot: ObsSnapshot | null,
  inputName: string | undefined,
  muted: boolean
) {
  const normalizedInputName = normalizeAudioInputName(inputName);

  if (!normalizedInputName) {
    return obsSnapshot;
  }

  const currentAudioInputStates = obsSnapshot?.audioInputStates ?? [];
  const inputExists = currentAudioInputStates.some(
    (inputState) =>
      normalizeAudioInputName(inputState.inputName) === normalizedInputName
  );
  const audioInputStates = inputExists
    ? currentAudioInputStates.map((inputState) =>
      normalizeAudioInputName(inputState.inputName) === normalizedInputName
        ? {
          ...inputState,
          muted,
        }
        : inputState
    )
    : [
      ...currentAudioInputStates,
      {
        inputName: inputName?.trim() ?? "",
        muted,
      },
    ];

  return {
    connected: obsSnapshot?.connected ?? true,
    ...obsSnapshot,
    audioInputStates,
  };
}

function isObsSourceMacro(macro: MacroTemplate) {
  return macro.actionType?.startsWith("obs-source") ?? false;
}

function getOptimisticSourceState(macro: MacroTemplate) {
  if (!isObsSourceMacro(macro)) {
    return undefined;
  }

  if (macro.actionType === "obs-source-show") {
    return true;
  }

  if (macro.actionType === "obs-source-hide") {
    return false;
  }

  if (typeof macro.deckStateActive === "boolean") {
    return !macro.deckStateActive;
  }

  return undefined;
}

function applyMacroState(
  macros: MacroTemplate[],
  macroId: string,
  deckStateActive: boolean
) {
  return macros.map((currentMacro) =>
    currentMacro.id === macroId
      ? {
        ...currentMacro,
        deckStateActive,
      }
      : currentMacro
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function getResponseSnapshot(value: unknown): ObsSnapshot | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const snapshot = value.obsSnapshot ?? value.snapshot ?? value.obs;

  if (isRecord(snapshot)) {
    return snapshot as ObsSnapshot;
  }

  if ("currentProgramSceneName" in value || "audioInputStates" in value) {
    return value as ObsSnapshot;
  }

  return undefined;
}

function getResponseMacro(value: unknown): MacroTemplate | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const macro = value.macro ?? value.button ?? value.deckButton;

  if (isRecord(macro)) {
    return macro as MacroTemplate;
  }

  if ("deckStateActive" in value || "actionType" in value) {
    return value as MacroTemplate;
  }

  return undefined;
}

function syncMacroWithObsAudioState(
  macro: MacroTemplate,
  obsSnapshot: ObsSnapshot | null,
  override?: TimedBooleanOverride
) {
  if (macro.actionType !== "obs-audio-mute") {
    return macro;
  }

  if (override && Date.now() - override.updatedAt < OBS_SYNC_OVERRIDE_TTL_MS) {
    return {
      ...macro,
      deckStateActive: override.value,
    };
  }

  const inputState = getObsAudioInputState(obsSnapshot, macro.obsAudioInputName);

  return typeof inputState?.muted === "boolean"
    ? {
      ...macro,
      deckStateActive: inputState.muted,
    }
    : macro;
}

function syncVolumeControllerWithObsAudioState(
  controller: VolumeController,
  obsSnapshot: ObsSnapshot | null,
  override?: TimedNumberOverride
) {
  const inputState = getObsAudioInputState(obsSnapshot, controller.inputName);
  const isVolumeOverrideActive =
    override && Date.now() - override.updatedAt < OBS_SYNC_OVERRIDE_TTL_MS;

  return {
    ...controller,
    volume: isVolumeOverrideActive
      ? override.value
      : typeof inputState?.volume === "number"
        ? clampVolume(inputState.volume)
        : controller.volume,
    muted:
      typeof inputState?.muted === "boolean"
        ? inputState.muted
        : controller.muted,
  };
}

function pruneMacroStateOverrides(
  overrides: Record<string, TimedBooleanOverride>,
  macros: MacroTemplate[],
  obsSnapshot: ObsSnapshot | null
) {
  const now = Date.now();
  const nextOverrides: Record<string, TimedBooleanOverride> = {};

  for (const [macroId, override] of Object.entries(overrides)) {
    const macro = macros.find((item) => item.id === macroId);
    const inputState = getObsAudioInputState(obsSnapshot, macro?.obsAudioInputName);
    const isExpired = now - override.updatedAt >= OBS_SYNC_OVERRIDE_TTL_MS;
    const isSynced = inputState?.muted === override.value;

    if (!isExpired && !isSynced) {
      nextOverrides[macroId] = override;
    }
  }

  return nextOverrides;
}

function pruneVolumeOverrides(
  overrides: Record<string, TimedNumberOverride>,
  decks: VirtualDeck[],
  obsSnapshot: ObsSnapshot | null
) {
  const now = Date.now();
  const nextOverrides: Record<string, TimedNumberOverride> = {};

  for (const [overrideKey, override] of Object.entries(overrides)) {
    const controller = decks
      .flatMap((deck) =>
        (deck.volumeControllers ?? []).map((volumeController) => ({
          deck,
          volumeController,
        }))
      )
      .find(
        (item) =>
          getVolumeOverrideKey(item.deck.id, item.volumeController.id) ===
          overrideKey
      )?.volumeController;
    const inputState = getObsAudioInputState(obsSnapshot, controller?.inputName);
    const isExpired = now - override.updatedAt >= OBS_SYNC_OVERRIDE_TTL_MS;
    const isSynced =
      typeof inputState?.volume === "number" &&
      clampVolume(inputState.volume) === override.value;

    if (!isExpired && !isSynced) {
      nextOverrides[overrideKey] = override;
    }
  }

  return nextOverrides;
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

type ObsMuteResult = {
  ok: boolean;
  inputName: string;
  muted: boolean;
  message?: string;
};

async function setVolumeControllerMuted(controller: VolumeController) {
  const response = await fetch(`${getBackendUrl()}/obs/audio-mute-toggle`, {
    body: JSON.stringify({
      inputName: controller.inputName,
    }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(`API ${response.status}`);
  }

  return response.json() as Promise<ObsMuteResult>;
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

  if (isObsSourceMacro(macro)) {
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
    const normalizedIcon = macro.deckIcon?.trim().toLowerCase() ?? "";
    const normalizedInputName = macro.obsAudioInputName?.trim().toLowerCase() ?? "";
    const useVolumeIcon =
      normalizedIcon.includes("volume") ||
      normalizedIcon.includes("speaker") ||
      normalizedIcon.includes("sound") ||
      (!normalizedIcon.includes("microphone") &&
        !normalizedIcon.includes("mic") &&
        !normalizedInputName.includes("microfone") &&
        !normalizedInputName.includes("microphone") &&
        !normalizedInputName.includes("mic"));
    const Icon = useVolumeIcon
      ? macro.deckStateActive
        ? FaVolumeMute
        : FaVolumeUp
      : macro.deckStateActive
        ? FaMicrophoneSlash
        : FaMicrophone;

    return <Icon className="size-14 sm:size-16" aria-hidden="true" />;
  }

  return renderDeckIcon(macro?.deckIcon, macro?.actionType, {
    className: "size-14 sm:size-16",
  });
}

function useScreenWakeLock(enabled: boolean) {
  useEffect(() => {
    if (!enabled || typeof navigator === "undefined") {
      return;
    }

    let wakeLock: ScreenWakeLockSentinel | null = null;
    let cancelled = false;

    async function requestWakeLock() {
      const wakeLockApi = (navigator as NavigatorWithWakeLock).wakeLock;

      if (wakeLock || !wakeLockApi || document.visibilityState !== "visible") {
        return;
      }

      try {
        wakeLock = await wakeLockApi.request("screen");
        wakeLock.addEventListener?.("release", () => {
          wakeLock = null;
        });
      } catch {
        wakeLock = null;
      }
    }

    function handleVisibilityChange() {
      if (!cancelled && document.visibilityState === "visible") {
        void requestWakeLock();
      }
    }

    void requestWakeLock();
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pointerdown", requestWakeLock);
    window.addEventListener("touchstart", requestWakeLock);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pointerdown", requestWakeLock);
      window.removeEventListener("touchstart", requestWakeLock);

      if (wakeLock) {
        void wakeLock.release();
      }
    };
  }, [enabled]);
}

function VolumeControllerTile({
  className = "",
  controller,
  onCommit,
  onMuteToggle,
  onVolumeChange,
  style,
}: {
  className?: string;
  controller: VolumeController;
  onCommit: (controller: VolumeController, volume: number) => void;
  onMuteToggle?: (controller: VolumeController) => void;
  onVolumeChange: (controllerId: string, volume: number) => void;
  style?: CSSProperties;
}) {
  const volume = clampVolume(Number(controller.volume) || 0);
  const isVertical = controller.orientation === "vertical";
  const showMuteButton = shouldShowVolumeMuteButton(controller);
  const muted = Boolean(controller.muted);
  const normalizedControllerName = `${controller.name} ${controller.inputName}`
    .trim()
    .toLowerCase();

  const useMicIcon =
    normalizedControllerName.includes("microfone") ||
    normalizedControllerName.includes("microphone") ||
    normalizedControllerName.includes("mic");

  const MuteIcon = useMicIcon
    ? muted
      ? FaMicrophoneSlash
      : FaMicrophone
    : muted
      ? FaVolumeMute
      : FaVolumeUp;

  const muteButton = showMuteButton ? (
    <button
      aria-label={`${muted ? "Desmutar" : "Mutar"} ${controller.name || controller.inputName || "Volume"
        }`.trim()}
      aria-pressed={muted}
      className={[
        "flex w-full h-28 border-2 border-gray-600 size-11 shrink-0 items-center justify-center rounded-2xl bg-[#1B242E] transition active:scale-95",
        muted ? "text-[#ff5b7a]" : "text-[#3A93F5]",
      ].join(" ")}
      onClick={(event) => {
        event.stopPropagation();
        onMuteToggle?.(controller);
      }}
      onPointerDown={(event) => event.stopPropagation()}
      onTouchEnd={(event) => event.stopPropagation()}
      title={muted ? "Desmutar" : "Mutar"}
      type="button"
    >
      <MuteIcon className="size-12" aria-hidden="true" />
    </button>
  ) : null;

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
        <div
          className={[
            "flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[#1B242E]",
            muted ? "text-[#ff5b7a]" : "text-[#3A93F5]",
          ].join(" ")}
        >
          <MuteIcon className="size-6" aria-hidden="true" />
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
          isVertical
            ? "min-h-0 w-full flex-1 flex-col gap-3 py-3"
            : "min-w-0 flex-[2.6] gap-3",
        ].join(" ")}
      >
        {!isVertical && muteButton}

        <div
          className={[
            "relative flex items-center justify-center",
            isVertical ? "min-h-0 w-full flex-1" : "min-w-0 flex-1",
          ].join(" ")}
        >
          <input
            aria-label={`Volume ${controller.name || controller.inputName || ""
              }`.trim()}
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

        {isVertical && muteButton}
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
  const [macroStateOverrides, setMacroStateOverrides] = useState<
    Record<string, TimedBooleanOverride>
  >({});
  const [macroPressErrors, setMacroPressErrors] = useState<Record<string, number>>(
    {}
  );
  const [volumeOverrides, setVolumeOverrides] = useState<
    Record<string, TimedNumberOverride>
  >({});
  const loggedIn = profile ? isLoggedIn(profile) : false;
  const deck = decks.find((item) => item.id === deckId);
  const rows = deck?.rows ?? fallbackRows;
  const columns = deck?.columns ?? fallbackColumns;
  const pageCount = getDeckPageCount(deck, fallbackPageCount);
  const hasMultiplePages = pageCount > 1;

  const refreshObsSnapshot = useCallback(async () => {
    const nextObsSnapshot = await apiGet<ObsSnapshot>("/obs/snapshot");

    setObsSnapshot(nextObsSnapshot);
  }, []);

  const refreshDeckConfig = useCallback(async () => {
    const [nextDecks, nextMacros] = await Promise.all([
      apiGet<VirtualDeck[]>("/virtual-decks"),
      apiGet<MacroTemplate[]>("/macros"),
    ]);

    setDecks(nextDecks);
    setMacros(nextMacros);
  }, []);

  const load = useCallback(async () => {
    try {
      const [nextDecks, nextMacros, nextObsSnapshot] = await Promise.all([
        apiGet<VirtualDeck[]>("/virtual-decks"),
        apiGet<MacroTemplate[]>("/macros"),
        apiGet<ObsSnapshot>("/obs/snapshot").catch(() => null),
      ]);

      setDecks(nextDecks);
      setMacros(nextMacros);
      setObsSnapshot(nextObsSnapshot);
      setMacroStateOverrides((currentOverrides) =>
        pruneMacroStateOverrides(currentOverrides, nextMacros, nextObsSnapshot)
      );
      setVolumeOverrides((currentOverrides) =>
        pruneVolumeOverrides(currentOverrides, nextDecks, nextObsSnapshot)
      );
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
    const obsInterval = window.setInterval(() => {
      void refreshObsSnapshot().catch(() => undefined);
    }, OBS_SNAPSHOT_POLL_MS);
    const deckConfigInterval = window.setInterval(() => {
      void refreshDeckConfig().catch(() => undefined);
    }, DECK_CONFIG_SYNC_MS);

    return () => {
      window.clearInterval(obsInterval);
      window.clearInterval(deckConfigInterval);
    };
  }, [load, loggedIn, profile, refreshDeckConfig, refreshObsSnapshot]);

  useScreenWakeLock(loggedIn);

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

  const deckMacros = getDeckMacros(macros, deckId)
    .filter((macro) => getMacroPage(macro, deck?.actionPositions) === currentPage)
    .map((macro) =>
      syncMacroWithObsAudioState(macro, obsSnapshot, macroStateOverrides[macro.id])
    );
  const deckMacroByCellKey = new Map<string, MacroTemplate>();
  const deckMacroCellPriority = new Map<string, number>();

  for (const macro of deckMacros) {
    const hasDesktopPosition = Boolean(
      getMacroActionPosition(macro, deck?.actionPositions)
    );
    const cellKey = getMacroCellKey(macro, rows, columns, deck?.actionPositions);
    const priority = hasDesktopPosition ? 2 : 1;
    const currentPriority = cellKey
      ? deckMacroCellPriority.get(cellKey) ?? 0
      : 0;

    if (cellKey && priority >= currentPriority) {
      deckMacroByCellKey.set(cellKey, macro);
      deckMacroCellPriority.set(cellKey, priority);
    }
  }
  const volumeControllers = (deck?.volumeControllers ?? [])
    .filter((controller) => getVolumeControllerPage(controller) === currentPage)
    .map((controller) =>
      syncVolumeControllerWithObsAudioState(
        controller,
        obsSnapshot,
        volumeOverrides[getVolumeOverrideKey(deckId, controller.id)]
      )
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
    (topVolumeControllers.length ? 1 : 0) +
    (bottomVolumeControllers.length ? 1 : 0);
  const stackedControlGapCount =
    (topVolumeControllers.length ? 1 : 0) +
    (bottomVolumeControllers.length ? 1 : 0);
  const gridStyle = {
    "--deck-columns": columns,
    "--deck-rows": rows,
    "--deck-gap": `clamp(0.45rem, calc(2rem - ${gapReduction}rem), 2rem)`,
    "--volume-control-size": "clamp(7rem, 16cqw, 11rem)",
    "--volume-horizontal-control-size": "clamp(4.75rem, 10cqw, 6.5rem)",
    "--deck-side-control-count": sideControlCount,
    "--deck-side-control-gap-count": sideControlGapCount,
    "--deck-stacked-control-count": stackedControlCount,
    "--deck-stacked-control-gap-count": stackedControlGapCount,
    "--deck-cell-size":
      "min(calc((100cqw - var(--deck-side-control-count) * var(--volume-control-size) - var(--deck-side-control-gap-count) * var(--deck-gap) - (var(--deck-columns) - 1) * var(--deck-gap)) / var(--deck-columns)), calc((100cqh - var(--deck-stacked-control-count) * var(--volume-horizontal-control-size) - var(--deck-stacked-control-gap-count) * var(--deck-gap) - (var(--deck-rows) - 1) * var(--deck-gap)) / var(--deck-rows)))",
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
  const topStackedControlsStyle = {
    ...stackedControlsStyle,
    gridTemplateColumns: `repeat(${topVolumeControllers.length}, minmax(0, 1fr))`,
  } as CSSProperties;
  const bottomStackedControlsStyle = {
    ...stackedControlsStyle,
    gridTemplateColumns: `repeat(${bottomVolumeControllers.length}, minmax(0, 1fr))`,
  } as CSSProperties;
  const horizontalControlStyle = {
    height: "var(--volume-horizontal-control-size)",
  } as CSSProperties;
  const sideControlsStyle = {
    gap: "var(--deck-gap)",
    height: "var(--deck-grid-height)",
  } as CSSProperties;
  const verticalControlStyle = {
    width: "var(--volume-control-size)",
  } as CSSProperties;

  async function runMacro(macro: MacroTemplate) {
    const optimisticState: OptimisticMacroState = {};
    const sourceState = getOptimisticSourceState(macro);

    setMacroPressErrors((currentErrors) => {
      const { [macro.id]: _removed, ...nextErrors } = currentErrors;

      return nextErrors;
    });

    if (macro.actionType === "obs-scene" && macro.obsSceneName?.trim()) {
      optimisticState.previousSceneName = activeSceneName;
      setObsSnapshot((currentSnapshot) => ({
        connected: currentSnapshot?.connected ?? true,
        ...currentSnapshot,
        currentProgramSceneName: macro.obsSceneName?.trim(),
      }));
    }

    if (macro.actionType === "obs-audio-mute") {
      const inputState = getObsAudioInputState(obsSnapshot, macro.obsAudioInputName);
      const currentActive =
        typeof inputState?.muted === "boolean"
          ? inputState.muted
          : Boolean(macro.deckStateActive);
      const nextActive = !currentActive;

      optimisticState.previousActive = currentActive;
      setMacroStateOverrides((currentOverrides) => ({
        ...currentOverrides,
        [macro.id]: {
          updatedAt: Date.now(),
          value: nextActive,
        },
      }));
      setObsSnapshot((currentSnapshot) =>
        withOptimisticAudioMuted(
          currentSnapshot,
          macro.obsAudioInputName,
          nextActive
        )
      );
      setMacros((currentMacros) => applyMacroState(currentMacros, macro.id, nextActive));
    }

    if (typeof sourceState === "boolean") {
      optimisticState.previousActive = macro.deckStateActive;
      setMacros((currentMacros) =>
        applyMacroState(currentMacros, macro.id, sourceState)
      );
    }

    try {
      const response = await fetch(`${getBackendUrl()}/macros/${macro.id}/run`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error(`API ${response.status}`);
      }

      const contentType = response.headers.get("content-type") ?? "";
      const responseBody = contentType.includes("application/json")
        ? ((await response.json()) as unknown)
        : undefined;
      const responseSnapshot = getResponseSnapshot(responseBody);
      const responseMacro = getResponseMacro(responseBody);

      if (responseSnapshot) {
        setObsSnapshot(responseSnapshot);
      }

      if (typeof responseMacro?.deckStateActive === "boolean") {
        const confirmedActive = responseMacro.deckStateActive;

        setMacros((currentMacros) =>
          applyMacroState(currentMacros, macro.id, confirmedActive)
        );
        if (macro.actionType === "obs-audio-mute") {
          setMacroStateOverrides((currentOverrides) => ({
            ...currentOverrides,
            [macro.id]: {
              updatedAt: Date.now(),
              value: confirmedActive,
            },
          }));
        }
      }
    } catch (error) {
      console.error("Erro ao executar macro virtual:", error);
      setMacroPressErrors((currentErrors) => ({
        ...currentErrors,
        [macro.id]: Date.now(),
      }));

      window.setTimeout(() => {
        setMacroPressErrors((currentErrors) => {
          if (!currentErrors[macro.id]) {
            return currentErrors;
          }

          const { [macro.id]: _removed, ...nextErrors } = currentErrors;

          return nextErrors;
        });
      }, BUTTON_ERROR_TTL_MS);

      if (macro.actionType === "obs-scene") {
        setObsSnapshot((currentSnapshot) => ({
          connected: currentSnapshot?.connected ?? true,
          ...currentSnapshot,
          currentProgramSceneName: optimisticState.previousSceneName,
        }));
      }

      if (
        (macro.actionType === "obs-audio-mute" || typeof sourceState === "boolean") &&
        typeof optimisticState.previousActive === "boolean"
      ) {
        const previousActive = optimisticState.previousActive;

        setMacros((currentMacros) =>
          applyMacroState(currentMacros, macro.id, previousActive)
        );
        setMacroStateOverrides((currentOverrides) => {
          const { [macro.id]: _removed, ...nextOverrides } = currentOverrides;

          return nextOverrides;
        });

        if (macro.actionType === "obs-audio-mute") {
          setObsSnapshot((currentSnapshot) =>
            withOptimisticAudioMuted(
              currentSnapshot,
              macro.obsAudioInputName,
              previousActive
            )
          );
        }
      }
    }
  }

  function updateVolumeController(controllerId: string, volume: number) {
    setVolumeOverrides((currentOverrides) => ({
      ...currentOverrides,
      [getVolumeOverrideKey(deckId, controllerId)]: {
        updatedAt: Date.now(),
        value: volume,
      },
    }));
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
    } catch (error) {
      console.error("Erro ao ajustar volume virtual:", error);
    }
  }


  function updateVolumeControllerMuted(controllerId: string, muted: boolean) {
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
                  muted,
                }
                : controller
          ),
        };
      })
    );
  }

  async function toggleVolumeControllerMute(controller: VolumeController) {
    const inputState = getObsAudioInputState(obsSnapshot, controller.inputName);
    const previousMuted =
      typeof inputState?.muted === "boolean"
        ? inputState.muted
        : Boolean(controller.muted);
    const nextMuted = !previousMuted;

    try {
      setObsSnapshot((currentSnapshot) =>
        withOptimisticAudioMuted(currentSnapshot, controller.inputName, nextMuted)
      );
      updateVolumeControllerMuted(controller.id, nextMuted);

      const result = await setVolumeControllerMuted(controller);
      const confirmedMuted =
        typeof result.muted === "boolean" ? result.muted : nextMuted;

      setObsSnapshot((currentSnapshot) =>
        withOptimisticAudioMuted(
          currentSnapshot,
          controller.inputName,
          confirmedMuted
        )
      );

      updateVolumeControllerMuted(controller.id, confirmedMuted);
    } catch (error) {
      console.error("Erro ao mutar volume virtual:", error);

      setObsSnapshot((currentSnapshot) =>
        withOptimisticAudioMuted(currentSnapshot, controller.inputName, previousMuted)
      );
      updateVolumeControllerMuted(controller.id, previousMuted);
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
                  style={topStackedControlsStyle}
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
                      onMuteToggle={(nextController) => {
                        void toggleVolumeControllerMute(nextController);
                      }}
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
                        onMuteToggle={(nextController) => {
                          void toggleVolumeControllerMute(nextController);
                        }}
                      />
                    ))}
                  </div>
                )}

                <div className="grid place-content-center" style={gridStyle}>
                  {cells.map((cell) => {
                    const macro = deckMacroByCellKey.get(cell.key);
                    const imageSrc = getImageSrc(macro);
                    const isActiveScene = isActiveSceneMacro(macro, activeSceneName);
                    const isMutedAudio = Boolean(
                      macro?.actionType === "obs-audio-mute" &&
                      macro.deckStateActive
                    );
                    const isStateActive = Boolean(
                      macro &&
                      macro.actionType !== "obs-scene" &&
                      macro.actionType !== "obs-audio-mute" &&
                      isObsSourceMacro(macro) &&
                      macro.deckStateActive
                    );
                    const hasPressError = Boolean(
                      macro && macroPressErrors[macro.id]
                    );

                    return (
                      <button
                        key={cell.key}
                        aria-disabled={!macro}
                        aria-pressed={
                          macro?.actionType === "obs-scene" ||
                            macro?.actionType === "obs-audio-mute" ||
                            (macro && isObsSourceMacro(macro))
                            ? Boolean(isActiveScene || macro?.deckStateActive)
                            : undefined
                        }
                        className={[
                          "group relative flex size-full aspect-square touch-manipulation flex-col items-center justify-center gap-3 overflow-hidden rounded-4xl border-2 bg-[#181E23] p-3 text-center transition active:scale-[0.98]",
                          hasPressError
                            ? "border-[#ff5b7a] shadow-[0_0_0_2px_rgba(255,91,122,0.25),0_0_24px_rgba(255,91,122,0.2)]"
                            : isMutedAudio
                              ? "border-[#ff3b5f] shadow-[0_0_0_2px_rgba(255,59,95,0.26),0_0_28px_rgba(255,59,95,0.2)]"
                              : isActiveScene || isStateActive
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
                        onMuteToggle={(nextController) => {
                          void toggleVolumeControllerMute(nextController);
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>

              {bottomVolumeControllers.length > 0 && (
                <div
                  className="grid"
                  style={bottomStackedControlsStyle}
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
                      onMuteToggle={(nextController) => {
                        void toggleVolumeControllerMute(nextController);
                      }}
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
