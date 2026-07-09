import {
  AppStoreServerAPIClient,
  Environment,
  SignedDataVerifier,
} from "@apple/app-store-server-library";
import { serverEnv } from "./env";
import { AppError } from "./response";

function appleEnvironment(): Environment {
  return serverEnv.appleIapEnvironment === "Production"
    ? Environment.PRODUCTION
    : Environment.SANDBOX;
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

let verifier: SignedDataVerifier | undefined;

/** Verifies + decodes JWS payloads (transactions, renewal info, notifications) signed by Apple. */
export function getAppleSignedDataVerifier(): SignedDataVerifier {
  if (!verifier) {
    verifier = new SignedDataVerifier(
      loadAppleRootCertificates(),
      true,
      appleEnvironment(),
      serverEnv.appleIapBundleId,
      serverEnv.appleIapAppAppleId,
    );
  }
  return verifier;
}

let apiClient: AppStoreServerAPIClient | undefined;

/** Calls Apple's App Store Server API (subscription status lookups, refund history, etc). */
export function getAppStoreServerApiClient(): AppStoreServerAPIClient {
  if (!apiClient) {
    apiClient = new AppStoreServerAPIClient(
      serverEnv.appleIapPrivateKey,
      serverEnv.appleIapKeyId,
      serverEnv.appleIapIssuerId,
      serverEnv.appleIapBundleId,
      appleEnvironment(),
    );
  }
  return apiClient;
}
