import { prisma } from "@/lib/db";
import { getAiProvider } from "@/lib/ai";
import type {
  ConsultInput,
  DiagnoseInput,
  EnhanceInput,
  GenerateInput,
} from "@/lib/ai/types";
import type { AiJobType } from "@prisma/client";

async function runJob<T>(
  type: AiJobType,
  input: unknown,
  execute: () => Promise<T & { provider: string }>,
): Promise<{ jobId: string; result: T & { provider: string } }> {
  const started = Date.now();
  const job = await prisma.aiJob.create({
    data: {
      type,
      status: "RUNNING",
      inputJson: JSON.stringify(input),
      provider: process.env.AI_PROVIDER ?? "mock",
    },
  });

  try {
    const result = await execute();
    await prisma.aiJob.update({
      where: { id: job.id },
      data: {
        status: "SUCCEEDED",
        provider: result.provider,
        outputJson: JSON.stringify(result),
        latencyMs: Date.now() - started,
        finishedAt: new Date(),
      },
    });
    return { jobId: job.id, result };
  } catch (error) {
    const message = error instanceof Error ? error.message : "AI job failed";
    await prisma.aiJob.update({
      where: { id: job.id },
      data: {
        status: "FAILED",
        error: message,
        latencyMs: Date.now() - started,
        finishedAt: new Date(),
      },
    });
    throw error;
  }
}

export async function runEnhance(input: EnhanceInput) {
  const ai = getAiProvider();
  return runJob("ENHANCE", input, () => ai.enhanceDesign(input));
}

export async function runDiagnose(input: DiagnoseInput) {
  const ai = getAiProvider();
  return runJob("DIAGNOSE", input, () => ai.diagnoseDesign(input));
}

export async function runGenerate(input: GenerateInput) {
  const ai = getAiProvider();
  return runJob("GENERATE", input, () => ai.generateDesign(input));
}

export async function runStyleConsult(input: ConsultInput) {
  const ai = getAiProvider();
  return runJob("STYLE_CONSULT", input, () => ai.consultStyle(input));
}

export async function runDesignConsult(input: ConsultInput) {
  const ai = getAiProvider();
  return runJob("DESIGN_CONSULT", input, () => ai.consultDesign(input));
}
