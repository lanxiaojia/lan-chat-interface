// 消息类型定义
export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  [key: string]: any;
}

// 聊天界面属性
export interface ChatInterfaceProps {
  apiRoute: string;
  method?: "GET" | "POST";
  initialMessage?: string;
  title?: string;
  className?: string;
  initialHistory?: Message[]; // 支持传入历史记录
}

// 消息输入属性
export interface MessageInputProps {
  inputValue: string;
  setInputValue: (value: string) => void;
  onSend: () => void; // 简化为 onSend 回调
  isTyping: boolean;
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
