import { apiEnv } from "@api/env/server";
import { BadRequestException, Injectable } from "@nestjs/common";
import OpenAI from "openai";

@Injectable()
export class OpenAIClient {
  private readonly client: OpenAI | null = apiEnv.OPENAI_API_KEY ? new OpenAI({ apiKey: apiEnv.OPENAI_API_KEY }) : null;

  getClient(): OpenAI {
    if (!this.client) {
      throw new BadRequestException("OPENAI_API_KEY is not configured.");
    }
    return this.client;
  }

  getClientFor(apiKey: string): OpenAI {
    return new OpenAI({ apiKey });
  }
}
