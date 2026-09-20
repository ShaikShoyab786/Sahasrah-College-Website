import {
  createHash,
  randomBytes,
  scrypt as nodeScrypt,
  timingSafeEqual,
} from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(nodeScrypt);
const SESSION_COOKIE = "sahasara_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;

function secret() {
  return process.env.SESSION_SECRET ?? "development-only-session-secret";
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
  return `scrypt:${salt}:${derivedKey.toString("hex")}`;
}

export async function verifyPassword(password: string, storedHash: string) {
  const [algorithm, salt, key] = storedHash.split(":");
  if (algorithm !== "scrypt" || !salt || !key) return false;
  const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
  const expected = Buffer.from(key, "hex");
  return expected.length === derivedKey.length && timingSafeEqual(expected, derivedKey);
}

export function hashSessionToken(token: string) {
  return createHash("sha256").update(`${secret()}:${token}`).digest("hex");
}

export function createSessionToken() {
  return randomBytes(32).toString("base64url");
}

export function getSessionCookieName() {
  return SESSION_COOKIE;
}

export function getSessionTtl() {
  return SESSION_TTL_MS;
}