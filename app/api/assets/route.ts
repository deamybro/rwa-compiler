import { compilePassport } from "@/src/lib/passport/compiler";

const preferredAssets = ["NVDAx", "AAPLx", "TSLAx"];

export async function GET() {
  const settled = await Promise.allSettled(preferredAssets.map((symbol) => compilePassport(symbol)));
  const assets = settled.map((item, index) => item.status === "fulfilled"
    ? { ...item.value, selectedBecause: "Recognizable, liquid xStock with a verified current X Layer deployment." }
    : { symbol: preferredAssets[index], error: item.reason instanceof Error ? item.reason.message : "Live source unavailable" });
  return Response.json({ mode: "LIVE", assets, source: "xStocks public v2 API" }, {
    headers: { "cache-control": "public, max-age=15, stale-while-revalidate=45" },
  });
}
