import { Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";

@Injectable()
export class EmbeddingsService {
  constructor(private readonly http: HttpService) {}

  async create(text: string): Promise<number[]> {
    const results = await this.createBatch([text]);
    return results[0];
  }

  async createBatch(texts: string[]): Promise<number[][]> {
    const apiKey = process.env.OPENAI_API_KEY;
    const model = process.env.EMBEDDING_MODEL || "text-embedding-3-small";
    if (apiKey) {
      const { data } = await firstValueFrom(
        this.http.post<any>(
          "https://api.openai.com/v1/embeddings",
          { model, input: texts },
          { headers: { authorization: `Bearer ${apiKey}`, "content-type": "application/json" } },
        ),
      );
      return data.data.map((d: any) => d.embedding);
    }
    throw new Error("No embedding provider configured. Set OPENAI_API_KEY.");
  }
}
