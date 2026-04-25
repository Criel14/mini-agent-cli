import type { DeepSeekMessage } from "./llm-types.js";
/**
 * 定义 LLM 的【请求】类型
 * 这里用 DeepSeek 支持的格式
 */


/**
 * 工具定义（提供给模型）
 */
export type DeepSeekToolDefinition = {
  type: "function";
  function: {
    name: string; // 工具名称
    description?: string; // 工具描述

    // 参数定义
    parameters?: {
      type: "object"; // 固定值

      /**
       * 参数字段定义
       *
       * key = 参数名
       * value = 参数的类型描述（JSON）
       *
       * 示例：
       * {
       *     path: {
       *         type: "string",
       *         description: "要读取的文件路径",
       *     },
       * },
       */
      properties: Record<string, any>;

      required?: string[]; // 必填字段
      additionalProperties?: boolean; // 是否允许额外字段，一般都为 false
    };
  };
};

/**
 * ChatCompletion 请求体
 */
export type DeepSeekChatCompletionRequest = {
  model: string; // 模型名称
  messages: DeepSeekMessage[]; // 消息记忆
  max_tokens?: number; // 最大生成 token 数
  stream?: boolean; // 是否流式
  tools?: DeepSeekToolDefinition[]; // 工具列表

  // 工具调用策略
  tool_choice?:
  | "auto" // 模型自己决定
  | "none" // 不允许调用
  | {
    type: "function";
    function: { name: string }; // 指定函数
  };

  // 是否 JSON 输出模式
  response_format?: {
    type: "json_object";
  };
};