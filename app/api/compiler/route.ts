import { z } from "zod";
import { compileSource } from "@/src/lib/ai/compiler";
import { verifyClaims } from "@/src/lib/verification/claims";

const bodySchema = z.object({ source: z.string().min(1).max(20_000) });

export async function POST(request: Request) {
  try {
    const { source } = bodySchema.parse(await request.json());
    const extraction = await compileSource(source);
    const verification = await verifyClaims(extraction);
    return Response.json({
      ...extraction,
      verification,
      policyAuthority: "DETERMINISTIC_VERIFIER",
      instructionSafety: "Source treated as untrusted data; embedded instructions are ignored.",
    });
  } catch (error) {
    if (error instanceof z.ZodError) return Response.json({ error: "Invalid compiler input", issues: error.issues }, { status: 400 });
    return Response.json({ error: error instanceof Error ? error.message : "Compiler unavailable" }, { status: 503 });
  }
}

