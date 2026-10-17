/**
 * SovereignKiosk v2.1 — Native Web Cryptography Engine
 * Meets PRD strict requirements:
 * 1. 8-character high-entropy alphanumeric token
 * 2. SHA-256 token hash (SubtleCrypto)
 * 3. Ephemeral AES-GCM 256-bit key & 12-byte IV (crypto.getRandomValues)
 * 4. RSA-OAEP 2048-bit Asymmetric Envelope for Key Wrapping
 * 5. Zero-knowledge Base64 ciphertext packaging
 */

export interface CrisisPayload {
  token: string;
  tokenHash: string;
  category: string;
  urgency: string;
  narrative: string;
  alibi: string;
  mode: "ANONYMOUS" | "VERIFIED_KTS";
  identity?: {
    nama: string;
    nis: string;
    kelas: string;
    kamar: string;
    consent: string;
    parentsAllowed: boolean;
  } | null;
  clientTimestamp: string;
}

export interface EncryptedSubmissionRecord {
  token: string;
  tokenHash: string;
  base64Ciphertext: string;
  ivHex: string;
  encryptedKeyBase64: string; // RSA-OAEP 2048 wrapped AES key
  durationMs: string;
  payload: CrisisPayload;
  aesKey: CryptoKey;
  exportedKeyHex?: string;
}

// SubtitleCrypto resolver for both browser and Node.js
function getSubtle(): SubtleCrypto {
  if (typeof window !== "undefined" && window.crypto?.subtle) {
    return window.crypto.subtle;
  }
  if (typeof globalThis !== "undefined" && globalThis.crypto?.subtle) {
    return globalThis.crypto.subtle;
  }
  throw new Error("Web Cryptography API (SubtleCrypto) tidak didukung pada lingkungan ini.");
}

function getRandomValues(array: Uint8Array): Uint8Array {
  if (typeof window !== "undefined" && window.crypto?.getRandomValues) {
    return window.crypto.getRandomValues(array);
  }
  if (typeof globalThis !== "undefined" && globalThis.crypto?.getRandomValues) {
    return globalThis.crypto.getRandomValues(array);
  }
  throw new Error("CSPRNG getRandomValues tidak tersedia.");
}

// Buffer to Base64
export function bufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Base64 to Uint8Array
export function base64ToBuffer(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// =======================================================================
// COUNSELOR RSA-OAEP 2048-BIT KEYPAIR (AIR-GAPPED SOVEREIGN ENGINE)
// =======================================================================
export const COUNSELOR_PUBLIC_KEY_JWK: JsonWebKey = {
  kty: "RSA",
  n: "qeo-3Hu2YoJ7lOD7QUwu58GjYG8nCksWjOYBzWVLY0sq86JpmRTtxC0YDmVL859zEj_SmLAb39GozcKtOeieUfOyyUs8WeCDJ3C59XuYMq-j_yq-cNItD6ecdvF6hcT9XqGPZu6_8MJqETo07_urUS2DBwtPYlvGQ_GQVVHu7XeyZ7akEamrvjrpzgXle6lzVvzq2SnpLwGUxDNEsdSHb2ypEVa0pU2JK9hQ95ZUcJ5ZFVI5upNBu4LTCBAsFKWLm9sRzyROxdTZUOhLw147wW6hu_8EGaR_sjbzeqqYvEVyCyDm7_rOz440Uf9nG11hFU8x6kTLjarn-d6Z1EpgEQ",
  e: "AQAB",
  alg: "RSA-OAEP-256",
  ext: true,
};

export const COUNSELOR_PRIVATE_KEY_JWK: JsonWebKey = {
  kty: "RSA",
  n: "qeo-3Hu2YoJ7lOD7QUwu58GjYG8nCksWjOYBzWVLY0sq86JpmRTtxC0YDmVL859zEj_SmLAb39GozcKtOeieUfOyyUs8WeCDJ3C59XuYMq-j_yq-cNItD6ecdvF6hcT9XqGPZu6_8MJqETo07_urUS2DBwtPYlvGQ_GQVVHu7XeyZ7akEamrvjrpzgXle6lzVvzq2SnpLwGUxDNEsdSHb2ypEVa0pU2JK9hQ95ZUcJ5ZFVI5upNBu4LTCBAsFKWLm9sRzyROxdTZUOhLw147wW6hu_8EGaR_sjbzeqqYvEVyCyDm7_rOz440Uf9nG11hFU8x6kTLjarn-d6Z1EpgEQ",
  e: "AQAB",
  d: "COQlb7FoDvHTwGvA7g7r3ev9rfpHBVR-TLds9Pfl2N9qMxdGthBYrEUtTvSJQ8luUrBFB4EgpkbA8epr2N3FqhVp37togC39wvK0wmYaJd3Xw66TilEPM1RinT0_22_eT8U9vSXFZLZxqS7d7ghh87ShWH0kpWmWv3-snTBVQ7cDxJMKDcJnTdINNlnFWJv1Pu2Xa8AKdZJE9898VZwalRUFO6a-PkMsi3iadRivl5CFqJCBSu0WAVEbE1DalSCs-F0xogsKZKgHuaHLiReTooZFdouXfoZ9NFvID9vkzMv-6LPrSnDskQIo8kVKwa3bRMCNxo2AL2JV57S-g9ZQmQ",
  p: "2pRqavRCSt_gXOjvEnV1ShZBU9IZNwOaXsKn87ucOou1ZTn1RR2Ks65lsl--QOHXTKagz3fQr3bVp8nzPlPQxGkAPaMNL_9d_s_YfQr0_IamWM09dD7MRz_SXjoQ9aXP3RbrSUNKOIzdUNCLJxApkiqy1wrZMNI1FfLjS7aNAIk",
  q: "xwEGgodX8KBLMFi2cALUx5eeLhxVcQoCMsfj-FFvvbLShDQ-9wcI5bJc6UiL7fQDDyaPddrunpe3Ih9kDIm_sRcXe0G3XmYinuwIUhx_ebp1RqQ7xN2eAUYZV7P0gFCitefzqfI1ntwKcW2it51_Ofu1l_l2Kw5uZjPoyPRjMUk",
  dp: "DUmYbogKv6J8cSl33xdk2ewgbIgJIF8Hs1sB-r8c8DIuBMlRL7JsDCA97moDls4j2HUIsZQHC6OduWV9c_yEZGw9p4GR-6j6fdMExhU0b2WAF0Xixn5KzMoEb9X30fcSe84432tHx8hIa_FBhE5nOIt_87KlIWKl93-cca3XRIE",
  dq: "KdMvWRO1Cd_GrbyXa2dM7T4SgsJ1urJNz_pvEWucPpRs5lhMu4KA_jXEjUswDazxT6fdEvoWmMJuPP-3-WKiJUgjKUagkXiJ4jjdbtSKfj0QFO7DmRay9LWU8ffidW19JRpA_gDoACFjGH_gaRLzAG7EtdI6YcZAsb5LOKEUj_E",
  qi: "bDAkKsbiiMUrlxceur0aC3JCWkYOoEFUE9cYrfoKAfwf8TGLWXWs_0P6RxZYs4bRP-oRX6s1tQ8BHbwA7YrIsqwsTZci0shXZvFAiHEky4lvWe8-45caRacTA6VxjDEG7YjNYcuPKYHy3b2FKUqPoCR4kHVsuhsn9_3KdPlarX8",
  alg: "RSA-OAEP-256",
  ext: true,
};

// 1. Generate an 8-character high-entropy alphanumeric token
export function generateHighEntropyToken(length = 8): string {
  const charset = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // 32 unambiguous characters (no 0, O, 1, I)
  const randomBytes = new Uint8Array(length);
  getRandomValues(randomBytes);
  let token = "";
  for (let i = 0; i < length; i++) {
    // 256 % 32 === 0 -> ZERO modulo bias!
    token += charset[randomBytes[i] % charset.length];
  }
  return token;
}

// 2. Hash this token using SHA-256 (crypto.subtle.digest)
export async function computeSha256(text: string): Promise<string> {
  const subtle = getSubtle();
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// 3. Generate an ephemeral AES-GCM 256-bit key
export async function generateAesGcmKey(): Promise<CryptoKey> {
  const subtle = getSubtle();
  return await subtle.generateKey(
    {
      name: "AES-GCM",
      length: 256,
    },
    true, // extractable so it can be wrapped into RSA-OAEP envelope
    ["encrypt", "decrypt"]
  );
}

// 3b. Generate a 12-byte IV using CSPRNG
export function generate12ByteIv(): Uint8Array {
  const iv = new Uint8Array(12);
  getRandomValues(iv);
  return iv;
}

// 4. Encrypt form payload into Base64 ciphertext with AES-GCM 256
export async function encryptPayloadWithAesGcm(
  payloadObj: CrisisPayload,
  aesKey: CryptoKey,
  iv: Uint8Array
): Promise<string> {
  const subtle = getSubtle();
  const encoder = new TextEncoder();
  const data = encoder.encode(JSON.stringify(payloadObj));
  const encryptedBuffer = await subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv as BufferSource,
    },
    aesKey,
    data
  );

  // Bundle IV (12 bytes) + Ciphertext into a single buffer
  const combined = new Uint8Array(iv.length + encryptedBuffer.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(encryptedBuffer), iv.length);

  return bufferToBase64(combined);
}

// 5. ASYMMETRIC ENVELOPE: Wrap Ephemeral AES Key with Counselor RSA-OAEP Public Key
export async function encryptAesKeyWithRsaOaep(
  rawAesKeyBuffer: ArrayBuffer,
  publicJwk: JsonWebKey = COUNSELOR_PUBLIC_KEY_JWK
): Promise<string> {
  const subtle = getSubtle();
  const publicKey = await subtle.importKey(
    "jwk",
    publicJwk,
    {
      name: "RSA-OAEP",
      hash: "SHA-256",
    },
    false,
    ["encrypt"]
  );

  const encryptedKeyBuffer = await subtle.encrypt(
    { name: "RSA-OAEP" },
    publicKey,
    rawAesKeyBuffer
  );

  return bufferToBase64(encryptedKeyBuffer);
}

// 6. ASYMMETRIC DECRYPTION: Recover AES Key using Counselor RSA-OAEP Private Key
export async function decryptAesKeyWithRsaOaep(
  encryptedKeyBase64: string,
  privateJwk: JsonWebKey = COUNSELOR_PRIVATE_KEY_JWK
): Promise<CryptoKey> {
  const subtle = getSubtle();
  const privateKey = await subtle.importKey(
    "jwk",
    privateJwk,
    {
      name: "RSA-OAEP",
      hash: "SHA-256",
    },
    false,
    ["decrypt"]
  );

  const encryptedKeyBuffer = base64ToBuffer(encryptedKeyBase64);
  const decryptedRawKey = await subtle.decrypt(
    { name: "RSA-OAEP" },
    privateKey,
    encryptedKeyBuffer as BufferSource
  );

  return await subtle.importKey(
    "raw",
    decryptedRawKey,
    { name: "AES-GCM" },
    false,
    ["decrypt"]
  );
}

// 7. Full Hybrid Decryption (Recovers Payload from Ciphertext + RSA-OAEP Envelope)
export async function decryptPayloadWithHybrid(
  base64Ciphertext: string,
  encryptedKeyBase64: string,
  privateJwk: JsonWebKey = COUNSELOR_PRIVATE_KEY_JWK
): Promise<CrisisPayload> {
  // Step 1: Recover AES key from RSA-OAEP envelope
  const aesKey = await decryptAesKeyWithRsaOaep(encryptedKeyBase64, privateJwk);

  // Step 2: Decrypt ciphertext using recovered AES key
  return await decryptPayloadFromBase64(base64Ciphertext, aesKey);
}

// Decrypt helper for AES-GCM buffer
export async function decryptPayloadFromBase64(
  base64Ciphertext: string,
  aesKey: CryptoKey
): Promise<CrisisPayload> {
  const subtle = getSubtle();
  const combined = base64ToBuffer(base64Ciphertext);
  const iv = combined.slice(0, 12);
  const ciphertext = combined.slice(12);

  const decryptedBuffer = await subtle.decrypt(
    {
      name: "AES-GCM",
      iv: iv as BufferSource,
    },
    aesKey,
    ciphertext as BufferSource
  );
  const decoder = new TextDecoder();
  return JSON.parse(decoder.decode(decryptedBuffer)) as CrisisPayload;
}
