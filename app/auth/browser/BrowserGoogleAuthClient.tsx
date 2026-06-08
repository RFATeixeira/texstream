"use client";

import {
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { LoaderCircle } from "lucide-react";
import { useState } from "react";
import { getFirebaseAuth, isFirebaseConfigured } from "../../../lib/firebase";

function TextreamLogoIcon({ size = 36 }: { size?: number }) {
  return (
    <svg
      aria-hidden="true"
      height={size}
      viewBox="0 0 853.33331 933.33331"
      width={size}
    >
      <path
        fill="#0177a9"
        d="M 0.5,0.1114279 0.21875,0.59 H 0.4140621 L 0.6093743,0.2799997 Z"
        transform="matrix(853.33331,0,0,-933.33331,0,933.33331)"
      />
      <path
        fill="#0083bb"
        d="m 0.3687489,0.6585724 -0.1156225,0.18 h 0.0921861 l 0.1140629,-0.18 z"
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

export function BrowserGoogleAuthClient() {
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function signInAndReturnCredential() {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    try {
      const auth = getFirebaseAuth();

      if (!auth || !isFirebaseConfigured) {
        setMessage("Firebase nao configurado.");
        return;
      }

      const callbackUrl = new URLSearchParams(window.location.search).get("callback");

      if (!callbackUrl) {
        setMessage("Callback local nao encontrado.");
        return;
      }

      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: "select_account",
      });

      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);

      if (!credential?.accessToken && !credential?.idToken) {
        setMessage("Credencial Google nao retornada.");
        return;
      }

      await fetch(callbackUrl, {
        body: JSON.stringify({
          accessToken: credential.accessToken ?? "",
          idToken: credential.idToken ?? "",
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      setMessage("Login concluido. Pode voltar ao Textream.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Erro ao autenticar.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-[#12161C] p-5 text-white">
      <div className="w-full max-w-md rounded-2xl bg-[#181E24] p-6 text-center">
        <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-2xl bg-[#1B242E] text-[#55A8FF]">
          <TextreamLogoIcon />
        </div>
        <h1 className="text-xl font-bold">Login no navegador</h1>
        <p className="mt-3 text-sm leading-6 text-slate-400">
          Use a mesma conta Google conectada ao Textream.
        </p>

        <button
          className="mt-6 flex w-full items-center justify-center gap-3 rounded-xl bg-white px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-70"
          disabled={isSubmitting}
          onClick={signInAndReturnCredential}
          type="button"
        >
          {isSubmitting ? (
            <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <span className="flex size-5 items-center justify-center rounded-full bg-slate-950 text-xs font-bold text-white">
              G
            </span>
          )}
          {isSubmitting ? "Aguarde" : "Continuar com Google"}
        </button>

        {message && (
          <div className="mt-5 rounded-xl bg-white/5 px-3 py-2 text-xs text-slate-300">
            {message}
          </div>
        )}
      </div>
    </main>
  );
}
