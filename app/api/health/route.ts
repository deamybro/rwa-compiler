export async function GET() {
  return Response.json({
    ok: true,
    service: "rwa-compiler",
    version: "1.0.0",
    aiConfigured: Boolean(process.env.AI_API_KEY),
    timestamp: new Date().toISOString(),
  });
}

