// 消息类型定义
export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  [key: string]: any;
}

// 定义 BodyBuilder 函数类型 (更新)
export type BodyBuilderFn = (payload: {
  // 当前用户的消息内容
  currentMessage: string;
  // 历史消息（包含id）
  history: Message[];
}) => any;

// 聊天界面属性
export interface ChatInterfaceProps {
  apiRoute: string;
  method?: "GET" | "POST";
  initialMessage?: string;
  title?: string;
  className?: string;
  initialHistory?: Message[]; // 支持传入历史记录
  bodyBuilder?: BodyBuilderFn; // 自定义请求体构建函数
  userAvatar?: string; // 用户头像 URL
  aiAvatar?: string; // AI 头像 URL
  userName?: string; // 用户名称
  aiName?: string; // AI 名称
  disabled?: boolean; // 全局禁用输入
  placeholder?: string; // 输入框占位符
}

// 消息输入属性
export interface MessageInputProps {
  inputValue: string;
  setInputValue: (value: string) => void;
  onSend: () => void; // 简化为 onSend 回调
  isTyping: boolean;
  disabled?: boolean;
  placeholder?: string;
}

// 扩展的消息输入属性（包含停止功能）
export interface ExtendedInputProps extends MessageInputProps {
  onStop?: () => void;
}

// 聊天消息属性
export interface ChatMessageProps {
  message: Message;
  isLoading?: boolean;
  isLast?: boolean;
  containerHeight?: number;
  isAutoScroll?: boolean;
  onUpdate?: () => void;
  userAvatar?: string;
  aiAvatar?: string;
  userName?: string;
  aiName?: string;
}

// 流式Markdown属性
export interface StreamingMarkdownProps {
  content: string;
  speed?: number;
  className?: string;
  onUpdate?: () => void;
}

// 代码块属性
export interface CodeBlockProps {
  language: string;
  value: string;
}
