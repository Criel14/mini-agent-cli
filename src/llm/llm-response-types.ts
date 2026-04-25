/**
 * 定义 LLM 的【响应】类型
 * 这里用 DeepSeek 支持的格式
 */


/**
 * 工具调用（模型返回）
 */
export type DeepSeekToolCall = {
  id: string; // 函数调用 id（用于和 tool role 消息关联）
  type: "function"; // 固定值
  function: {
    name: string; // 工具名称
    /**
     * JSON字符串，需要自己 parse
     * 
     * 示例：
     * {
     *     "path": "./test.txt"
     * }
     */
    arguments: string;
  };
};

/**
 * llm 返回的 assistant 角色消息
 */
export type DeepSeekAssistantMessage = {
  role: "assistant";
  content: string | null; // 模型回答的内容，如果触发 tool_call，这里是 null
  reasoning_content?: string; // 推理内容（下一轮对话请求时，不传回去）
  tool_calls?: DeepSeekToolCall[]; // 工具调用（可能没有，可能多个）
};

/**
 * 单个 choice（llm 响应一个 choice 数组，但默认只有1个元素）
 */
export type DeepSeekChoice = {
  index: number; // 在数组中的索引，一般永远是0
  message: DeepSeekAssistantMessage; // 模型输出的内容

  /**
   * 结束原因
   * - stop 正常结束，可以返回结果
   * - length token 用完被截断
   * - tool_calls 触发工具调用
   */
  finish_reason: "stop" | "length" | "tool_calls";
};

/**
 * token 使用统计
 */
export type DeepSeekUsage = {
  prompt_tokens: number; // 输入 token
  completion_tokens: number; // 输出 token
  total_tokens: number; // 总 token
  completion_tokens_details?: {
    reasoning_tokens?: number; // 推理 token
  };
};

/**
 * 一个完整响应
 */
export type DeepSeekChatCompletionResponse = {
  id: string; // 本次请求的唯一 id
  object: "chat.completion"; // 固定值
  created: number; // 创建时间（Unix 时间戳，秒）
  model: string; // 模型名称
  choices: DeepSeekChoice[]; // choice 数组，默认只有1个元素
  usage: DeepSeekUsage; // token 使用统计
};

/**
 * 一个流式响应块
 */
export type DeepSeekStreamChunk = {
  id: string; // 本次请求的唯一 id
  object: "chat.completion.chunk"; // 固定值
  created: number; // 创建时间（Unix 时间戳，秒）
  model: string; // 模型名称

  choices: {
    index: number;

    // 增量数据
    delta: {
      content?: string; // 内容增量
      reasoning_content?: string; // 推理增量
      tool_calls?: Partial<DeepSeekToolCall>[]; // 工具调用增量，这里 Partial 将所有字段变为可选，因为流式返回是不完整的
    };

    finish_reason?: "stop" | "length" | "tool_calls"; // 结束原因
  }[];
};