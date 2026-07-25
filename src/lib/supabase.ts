import { createClient } from "@supabase/supabase-js";
import { App as CapacitorApp } from "@capacitor/app";
import { Browser } from "@capacitor/browser";
import { Capacitor } from "@capacitor/core";

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL?.trim() ||
  "https://ahyxzrvdxmakxmnwkpzc.supabase.co";

const supabasePublishableKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim() ||
  "sb_publishable_Vuzti8g4jRnOepKCSQYF8A_RW7F6Qtk";
const nativeRedirectUrl = "com.theundercovertrainer.mindfulai://auth-callback";

export const isSupabaseConfigured = Boolean(supabaseUrl && supabasePublishableKey);
export const isNativeApp = Capacitor.isNativePlatform();

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabasePublishableKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: !isNativeApp,
      },
    })
  : null;

export function getAuthRedirectUrl() {
  if (isNativeApp) return nativeRedirectUrl;
  return new URL(import.meta.env.BASE_URL, window.location.href).href;
}

async function createSessionFromNativeUrl(url: string) {
  if (!supabase || !url.startsWith(nativeRedirectUrl)) return;
  const parsed = new URL(url);
  const query = new URLSearchParams(parsed.search);
  const fragment = new URLSearchParams(parsed.hash.replace(/^#/, ""));
  const errorDescription = query.get("error_description") ?? fragment.get("error_description");
  if (errorDescription) throw new Error(errorDescription);

  const code = query.get("code");
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) throw error;
  } else {
    const accessToken = fragment.get("access_token") ?? query.get("access_token");
    const refreshToken = fragment.get("refresh_token") ?? query.get("refresh_token");
    if (!accessToken || !refreshToken) return;
    const { error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    if (error) throw error;
  }

  await Browser.close().catch(() => undefined);
}

export async function initializeNativeAuth() {
  if (!isNativeApp || !supabase) return;

  const launch = await CapacitorApp.getLaunchUrl();
  if (launch?.url) await createSessionFromNativeUrl(launch.url);

  await CapacitorApp.addListener("appUrlOpen", ({ url }) => {
    createSessionFromNativeUrl(url).catch((error) => console.error("Anmeldelink konnte nicht verarbeitet werden.", error));
  });
}

export async function openExternalAuth(url: string) {
  if (isNativeApp) {
    await Browser.open({ url, presentationStyle: "popover" });
    return;
  }
  window.location.assign(url);
}
