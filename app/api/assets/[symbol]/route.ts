import { compilePassport } from "@/src/lib/passport/compiler";

export async function GET(_request: Request, context: { params: Promise<{ symbol: string }> }) {
  try {
    const { symbol } = await context.params;
    const result = await compilePassport(symbol);
    return Response.json({ mode: "LIVE", ...result }, {
      headers: { "cache-control": "public, max-age=15, stale-while-revalidate=45" },
    });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unable to compile Passport" }, { status: 503 });
  }
}

