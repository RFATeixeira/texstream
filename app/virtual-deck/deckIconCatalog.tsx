import type { ReactNode } from "react";
import type { IconType } from "react-icons";
import {
  FaBell,
  FaBolt,
  FaCamera,
  FaClock,
  FaCog,
  FaComments,
  FaDesktop,
  FaDiscord,
  FaEye,
  FaEyeSlash,
  FaFire,
  FaGamepad,
  FaGlobe,
  FaHeart,
  FaHome,
  FaImage,
  FaKeyboard,
  FaMicrophone,
  FaMicrophoneSlash,
  FaMusic,
  FaPause,
  FaPlay,
  FaPowerOff,
  FaSave,
  FaStar,
  FaStop,
  FaSyncAlt,
  FaTwitch,
  FaUser,
  FaUsers,
  FaVideo,
  FaVideoSlash,
  FaVolumeMute,
  FaVolumeUp,
  FaYoutube,
} from "react-icons/fa";

type IconProps = {
  className?: string;
  size?: number;
};

type DeckIconOption = {
  id: string;
  icon: IconType | ((props: IconProps) => ReactNode);
  aliases?: string[];
};

function ObsIcon({ size = 16, ...props }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height={size}
      viewBox="0 0 993 993"
      width={size}
      {...props}
    >
      <circle
        cx="496.5"
        cy="496.5"
        r="452"
        fill="#12161C"
        stroke="#fff"
        strokeWidth="56"
      />
      <path
        fill="#fff"
        transform="translate(-18 -20)"
        d="m684.91 370.5a199.24 199.24 0 0 1-277.24 70.456 202.75 202.75 0 0 1-44.913-37.773 198.92 198.92 0 0 1-49.898-141.13c0.28387-5.7896 0.76859-11.563 1.5268-17.31 0.74726-5.664 1.7459-11.303 2.9776-16.874q1.8966-8.5785 4.5472-16.962 2.572-8.1598 5.8635-16.073c2.2746-5.4851 4.8105-10.854 7.5465-16.122 2.8812-5.5476 6.0731-10.945 9.4812-16.184q4.7149-7.2487 10.044-14.062c3.8543-4.9508 7.95-9.7272 12.271-14.276q6.5417-6.8876 13.669-13.162c4.8385-4.2627 9.9124-8.2498 15.14-12.022q4.0422-2.917 8.2364-5.6119a244.39 244.39 0 0 0-109.08 323.49q0.82056 1.704 1.6675 3.3952 0.38468 0.7681 0.77476 1.5335a4.6004 4.6004 0 0 0 0.46987 0.91713c0.32364 0.35883 0.40473 0.29867 0.89987 0.28969 2.578-0.04676 5.1581-0.03471 7.7358 0.021q7.1444 0.15426 14.266 0.8147a199.58 199.58 0 0 1 178.16 166.37 201.33 201.33 0 0 1 0.64133 60.166 198.75 198.75 0 0 1-46.161 101.86 202.19 202.19 0 0 1-49.777 41.784 199.86 199.86 0 0 1-124.15 26.494 203.07 203.07 0 0 1-23.203-4.0299c-4.9544-1.1634-9.8599-2.531-14.711-4.0712a242.6 242.6 0 0 0 68.547 18.973 247.04 247.04 0 0 0 66.41-0.79809 243.53 243.53 0 0 0 108.67-44.887 246.04 246.04 0 0 0 59.733-63.074q1.0412-1.5871 2.0576-3.1902c0.263-0.41478 0.85074-1.0689 0.77441-1.5089a8.4945 8.4945 0 0 0-1.0506-1.9447q-2.0028-3.7574-3.8436-7.5982-3.698-7.7162-6.7219-15.732a198.02 198.02 0 0 1-9.3408-33.367 200.87 200.87 0 0 1 0.041-73.98 197.88 197.88 0 0 1 21.357-59.255 199.08 199.08 0 0 1 173.09-103.06q7.3368-0.05093 14.663 0.42449 7.066 0.47 14.088 1.4179 6.952 0.95079 13.827 2.3939 6.7304 1.4208 13.355 3.2902 6.4892 1.8409 12.843 4.1182 6.4407 2.3126 12.708 5.0639 6.3891 2.7902 12.561 6.0459 6.1656 3.2428 12.1 6.9069c3.7136 2.2975 7.3644 4.705 10.913 7.2512q5.4899 3.9392 10.726 8.2081c3.603 2.9308 7.0801 6.0188 10.462 9.202q5.4007 5.0836 10.408 10.563 4.9978 5.4473 9.5701 11.27c3.4 4.3183 6.6383 8.7721 9.6604 13.363 3.1045 4.7163 6.0393 9.5555 8.7483 14.515a200.21 200.21 0 0 1 10.068 21.366 206.97 206.97 0 0 1 7.9727 24.371 243.74 243.74 0 0 0-51.678-120.94 245.66 245.66 0 0 0-75.012-62.482 242.86 242.86 0 0 0-95.948-28.304q-4.267-0.3414-8.5442-0.53426z"
        shapeRendering="geometricPrecision"
      />
    </svg>
  );
}

const deckIconOptions: DeckIconOption[] = [
  { id: "auto", icon: FaKeyboard },
  { id: "obs", icon: ObsIcon },
  { id: "FaMicrophone", icon: FaMicrophone, aliases: ["microphone", "mic"] },
  {
    id: "FaMicrophoneSlash",
    icon: FaMicrophoneSlash,
    aliases: ["microphone-muted", "microphone-slash", "mic-off", "mic-muted"],
  },
  { id: "FaEye", icon: FaEye, aliases: ["eye"] },
  { id: "FaEyeSlash", icon: FaEyeSlash, aliases: ["eye-off"] },
  { id: "FaKeyboard", icon: FaKeyboard, aliases: ["keyboard"] },
  { id: "FaPlay", icon: FaPlay, aliases: ["play"] },
  { id: "FaPause", icon: FaPause, aliases: ["pause"] },
  { id: "FaStop", icon: FaStop, aliases: ["stop"] },
  {
    id: "FaVolumeUp",
    icon: FaVolumeUp,
    aliases: ["volume", "volume-up", "volume-high", "sound", "speaker"],
  },
  {
    id: "FaVolumeMute",
    icon: FaVolumeMute,
    aliases: ["volume-muted", "volume-mute", "volume-off", "volume-xmark", "sound-off"],
  },
  { id: "FaCamera", icon: FaCamera, aliases: ["camera"] },
  { id: "FaVideo", icon: FaVideo, aliases: ["video"] },
  { id: "FaVideoSlash", icon: FaVideoSlash, aliases: ["video-off"] },
  { id: "FaDesktop", icon: FaDesktop, aliases: ["monitor", "display", "screen"] },
  {
    id: "FaGamepad",
    icon: FaGamepad,
    aliases: ["gamepad", "game-controller"],
  },
  { id: "FaComments", icon: FaComments, aliases: ["chat"] },
  { id: "FaBell", icon: FaBell, aliases: ["bell"] },
  { id: "FaMusic", icon: FaMusic, aliases: ["music"] },
  { id: "FaImage", icon: FaImage, aliases: ["image"] },
  { id: "FaGlobe", icon: FaGlobe, aliases: ["browser", "globe", "web"] },
  { id: "FaCog", icon: FaCog, aliases: ["settings"] },
  { id: "FaStar", icon: FaStar, aliases: ["star"] },
  { id: "FaHeart", icon: FaHeart, aliases: ["heart"] },
  { id: "FaHome", icon: FaHome, aliases: ["home"] },
  { id: "FaUser", icon: FaUser, aliases: ["user"] },
  { id: "FaUsers", icon: FaUsers, aliases: ["users"] },
  { id: "FaBolt", icon: FaBolt, aliases: ["bolt"] },
  { id: "FaFire", icon: FaFire, aliases: ["fire"] },
  { id: "FaClock", icon: FaClock, aliases: ["clock"] },
  { id: "FaSave", icon: FaSave, aliases: ["save"] },
  { id: "FaSyncAlt", icon: FaSyncAlt, aliases: ["refresh"] },
  { id: "FaPowerOff", icon: FaPowerOff, aliases: ["power"] },
  { id: "FaYoutube", icon: FaYoutube, aliases: ["youtube"] },
  { id: "FaTwitch", icon: FaTwitch, aliases: ["twitch"] },
  { id: "FaDiscord", icon: FaDiscord, aliases: ["discord"] },
];

const deckIconById = new Map<string, DeckIconOption>();

for (const option of deckIconOptions) {
  deckIconById.set(option.id, option);
  deckIconById.set(option.id.toLowerCase(), option);
  deckIconById.set(normalizeIconLookupKey(option.id), option);

  for (const alias of option.aliases ?? []) {
    deckIconById.set(alias.toLowerCase(), option);
    deckIconById.set(normalizeIconLookupKey(alias), option);
  }
}

function normalizeIconLookupKey(iconId: string) {
  return iconId.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function resolveDeckIconId(iconId?: string, actionType?: string) {
  const normalizedIconId = iconId?.toLowerCase().trim() || "auto";
  const compactIconId = normalizeIconLookupKey(iconId?.trim() || "auto");

  if (normalizedIconId !== "auto" && deckIconById.has(normalizedIconId)) {
    return deckIconById.get(normalizedIconId)?.id ?? "FaKeyboard";
  }

  if (compactIconId !== "auto" && deckIconById.has(compactIconId)) {
    return deckIconById.get(compactIconId)?.id ?? "FaKeyboard";
  }

  if (actionType?.startsWith("obs-")) {
    return "obs";
  }

  if (actionType === "soundboard-audio") {
    return "FaVolumeUp";
  }

  if (actionType === "soundboard-stop") {
    return "FaVolumeMute";
  }

  return deckIconById.get(normalizedIconId)?.id ?? "FaKeyboard";
}

export function renderDeckIcon(
  iconId?: string,
  actionType?: string,
  options: IconProps = {}
) {
  const option =
    deckIconById.get(resolveDeckIconId(iconId, actionType)) ??
    deckIconOptions[0];
  const Icon = option.icon;

  return <Icon size={options.size ?? 64} className={options.className} />;
}
