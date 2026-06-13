"use client";

import {
  getRedirectResult,
  GoogleAuthProvider,
  signInWithRedirect,
} from "firebase/auth";
import { LoaderCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
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
  const hasStartedLogin = useRef(false);

  useEffect(() => {
    async function signInAndReturnCredential() {
      if (hasStartedLogin.current) {
        return;
      }

      hasStartedLogin.current = true;
      setMessage("Abrindo login com Google...");

      const callbackUrl =
        new URLSearchParams(window.location.search).get("callback") ||
        window.sessionStorage.getItem("textream-browser-auth-callback");

      if (callbackUrl) {
        window.sessionStorage.setItem(
          "textream-browser-auth-callback",
          callbackUrl
        );
      }

      if (!callbackUrl) {
        setMessage("Callback local nao encontrado.");
        return;
      }

      const auth = getFirebaseAuth();

      if (!auth || !isFirebaseConfigured) {
        setMessage("Firebase nao configurado.");
        return;
      }

      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: "select_account",
      });

      try {
        const result = await getRedirectResult(auth);

        if (!result) {
          await signInWithRedirect(auth, provider);
          return;
        }

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

        window.sessionStorage.removeItem("textream-browser-auth-callback");
        setMessage("Login concluido. Pode voltar ao Textream.");
      } catch (error) {
        setMessage(
          error instanceof Error ? error.message : "Erro ao autenticar."
        );
      }
    }

    void signInAndReturnCredential();
  }, []);

  return (
    <main className="flex min-h-dvh items-center justify-center bg-[#12161C] p-5 text-white">
      <div className="w-full max-w-md rounded-2xl bg-[#181E24] p-6 text-center">
        <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-2xl bg-[#1B242E] text-[#55A8FF]">
          <TextreamLogoIcon />
        </div>
        <h1 className="text-xl font-bold">Login no navegador</h1>
        <p className="mt-3 text-sm leading-6 text-slate-400">
          Voce sera redirecionado para entrar com Google.
        </p>

        <div className="mt-6 flex items-center justify-center gap-3 rounded-xl bg-white/5 px-4 py-3 text-sm font-bold text-slate-200">
          <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
          Abrindo Google
        </div>

        {message && (
          <div className="mt-5 rounded-xl bg-white/5 px-3 py-2 text-xs text-slate-300">
            {message}
          </div>
        )}
      </div>
    </main>
  );
}
