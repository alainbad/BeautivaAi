import type {
  AppStoreServerAPIClient as AppStoreServerAPIClientType,
  SignedDataVerifier as SignedDataVerifierType,
} from "@apple/app-store-server-library";
import { serverEnv } from "./env";
import { AppError } from "./response";

/**
 * @apple/app-store-server-library performs disallowed global-scope I/O the
 * moment it's imported — Cloudflare Workers only allows that inside a
 * request handler, not at module load. Since src/server.ts pulls this file
 * in unconditionally (for the Apple notifications webhook), a static import
 * here crashed every route, not just IAP ones. Must stay a dynamic import,
 * resolved lazily inside the handlers below.
 */
async function loadAppleLib() {
  return import("@apple/app-store-server-library");
}

/**
 * Apple's root CA certificates (DER, base64-encoded), required to verify the
 * signature chain on every JWS payload Apple sends us. The app deploys to
 * Cloudflare Workers (no filesystem), so these are read from an env var
 * instead of bundled .cer files — see README for how to generate the value.
 */
function loadAppleRootCertificates(): Buffer[] {
  const raw = process.env.APPLE_IAP_ROOT_CERTS_BASE64;
  if (!raw) {
    throw new AppError(
      "Missing APPLE_IAP_ROOT_CERTS_BASE64. Download Apple's root certificate from https://www.apple.com/certificateauthority/ and set it as described in README.md.",
      500,
    );
  }
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => Buffer.from(s, "base64"));
}

let verifier: SignedDataVerifierType | undefined;

/** Verifies + decodes JWS payloads (transactions, renewal info, notifications) signed by Apple. */
export async function getAppleSignedDataVerifier(): Promise<SignedDataVerifierType> {
  if (!verifier) {
    const { SignedDataVerifier, Environment } = await loadAppleLib();
    verifier = new SignedDataVerifier(
      loadAppleRootCertificates(),
      true,
      serverEnv.appleIapEnvironment === "Production" ? Environment.PRODUCTION : Environment.SANDBOX,
      serverEnv.appleIapBundleId,
      serverEnv.appleIapAppAppleId,
    );
  }
  return verifier;
}

let apiClient: AppStoreServerAPIClientType | undefined;

/** Calls Apple's App Store Server API (subscription status lookups, refund history, etc). */
export async function getAppStoreServerApiClient(): Promise<AppStoreServerAPIClientType> {
  if (!apiClient) {
    const { AppStoreServerAPIClient, Environment } = await loadAppleLib();
    apiClient = new AppStoreServerAPIClient(
      serverEnv.appleIapPrivateKey,
      serverEnv.appleIapKeyId,
      serverEnv.appleIapIssuerId,
      serverEnv.appleIapBundleId,
      serverEnv.appleIapEnvironment === "Production" ? Environment.PRODUCTION : Environment.SANDBOX,
    );
  }
  return apiClient;
}
