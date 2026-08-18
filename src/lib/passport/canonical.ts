import { keccak256, stringToHex } from "viem";

function normalize(value: unknown): unknown {
  if (value === null || typeof value !== "object") {
    if (typeof value === "bigint") return value.toString();
    return value;
  }

  if (Array.isArray(value)) return value.map(normalize);

  return Object.keys(value as Record<string, unknown>)
    .sort()
    .reduce<Record<string, unknown>>((result, key) => {
      const item = (value as Record<string, unknown>)[key];
      if (item !== undefined) result[key] = normalize(item);
      return result;
    }, {});
}

export function canonicalJson(value: unknown): string {
  return JSON.stringify(normalize(value));
}

export function canonicalHash(value: unknown): `0x${string}` {
  return keccak256(stringToHex(canonicalJson(value)));
}

