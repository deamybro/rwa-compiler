import { compilePassport } from "@/src/lib/passport/compiler";

export async function GET(_request: Request, context: { params: Promise<{ symbol: string }> }) {
  try {
    const { symbol } = await context.params;
    const { passport, hash } = await compilePassport(symbol);
    return Response.json({ passport, passportHash: hash, canonicalHashAlgorithm: "keccak256(canonical-json)" }, {
      headers: { "cache-control": "public, max-age=15, stale-while-revalidate=45" },
    });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unable to compile Passport" }, { status: 503 });
  }
}

