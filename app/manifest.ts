import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Textream",
    short_name: "Textream",
    description: "Deck virtual do Textream.",
    start_url: "/virtual-deck",
    scope: "/",
    display: "fullscreen",
    background_color: "#12161C",
    theme_color: "#12161C",
    orientation: "any",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
