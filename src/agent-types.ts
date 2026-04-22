/**
 * 定义 LLM 的响应结果类型，用 openai 的标准
 */

/**
 * 给模型看的工具描述
 */
export type OpenAIFunctionTool = {
    type: "function";
    name: string; // 工具名称
    description: string; // 工具描述
    parameters: {
        type: "object"; // 约定好参数的类型是【对象】
        properties: Record<string, unknown>; // 参数类型定义，以字符串为key，值任意
        required?: string[]; // 必填参数名列表
        additionalProperties?: boolean; // 是否允许出现额外字段
    };
    strict?: boolean; // 是否要求模型严格按照格式输出参数
};

/**
 * 模型要求执行的函数调用
 */
export type OpenAIResponseFunctionCall = {
    id: string; // 本次调用的 id
    call_id: string; // 工具调用的 id，需要和响应结果的 id 关联
    type: "function_call";
    name: string; // 工具名称
    arguments: string; // 这里是参数的 JSON 字符串，需要自己 parse
};

/**
 * 模型输出的内容块列表的一项
 */
type OutputTextBlock = {
  type: "output_text";
  text: string;
};

/**
 * 模型输出的普通消息
 */
export type OpenAIResponseMessage = {
    type: "message";
    role: "assistant";
    content: OutputTextBlock[]; // 模型输出的内容块列表
};

/**
 * 模型推理过程
 * 通常不会真正消费完整 reasoning 内容，因此这里保留最小的结构
 */
export type OpenAIResponseReasoning = {
    type: "reasoning";
    id?: string; // 可能会用到的 id字段
};

/**
 * 响应结果的联合类型，作为响应数组的一部分
 */
export type OpenAIResponseOutputItem =
    | OpenAIResponseFunctionCall // 函数调用
    | OpenAIResponseMessage // 普通消息
    | OpenAIResponseReasoning; // 推理过程

/**
 * 响应结果
 */
export type OpenAIResponse = {
    id: string;
    output: OpenAIResponseOutputItem[]; // 模型输出的列表，可能为普通消息、函数调用、推理过程
};