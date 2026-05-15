import { OPENAI_API_KEY } from "@api/env/server";
import { BadRequestException, Injectable } from "@nestjs/common";
import OpenAI from "openai";

@Injectable()
export class OpenAIClient {
  private readonly client: OpenAI | null = OPENAI_API_KEY
    ? new OpenAI({ apiKey: OPENAI_API_KEY })
    : null;

  getClient(): OpenAI {
    if (!this.client) {
      throw new BadRequestException("OPENAI_API_KEY is not configured.");
    }
    return this.client;
  }
}
