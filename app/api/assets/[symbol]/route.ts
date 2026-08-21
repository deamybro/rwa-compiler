import { verifyRegistryPassport } from "@/src/lib/onchain/registry";
import { compilePassport } from "@/src/lib/passport/compiler";

export async function GET(_request: Request, context: { params: Promise<{ symbol: string }> }) {
  try {
    const { symbol } = await context.params;
    const result = await compilePassport(symbol);
    const onchain = await verifyRegistryPassport(result.passport.asset.symbol, result.hash);
    return Response.json({ mode: "LIVE", ...result, onchain }, {
      headers: { "cache-control": "public, max-age=15, stale-while-revalidate=45" },
    });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unable to compile Passport" }, { status: 503 });
  }
}

