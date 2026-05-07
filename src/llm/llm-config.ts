/**
 * 大模型 api 的相关参数配置
 */

type LLMConfig = {
    apiKey: string | undefined,
    baseUrl: string,
    model: string,
    temperature: number,
    maxTokens: number,
}

export const llmConfig: LLMConfig = {
    apiKey: process.env.DEEPSEEK_API_KEY,
    baseUrl: process.env.DEEPSEEK_BASE_URL ?? "https://api.deepseek.com",
    model: process.env.DEEPSEEK_MODEL ?? "deepseek-v4-flash",
    temperature: Number(process.env.DEEPSEEK_TEMPERATURE ?? 0.6),
    maxTokens: Number(process.env.DEEPSEEK_MAX_TOKENS ?? 8192),
} 