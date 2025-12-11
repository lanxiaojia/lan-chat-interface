# lan-chat-interface

一个功能丰富、易于使用的聊天界面组件库，基于 React 和 TypeScript 构建，支持实时聊天、Markdown 渲染、代码高亮等功能。

## 功能特点

- 📱 **响应式设计**：适配各种屏幕尺寸
- 💬 **实时聊天**：支持 Server-Sent Events (SSE) 实时消息推送
- 📝 **Markdown 支持**：渲染富文本消息内容
- 💻 **代码高亮**：支持多种编程语言的代码块高亮显示
- 📋 **复制功能**：一键复制代码块内容
- 🎨 **自定义样式**：基于 Tailwind CSS，易于定制主题
- 🔧 **类型安全**：完整的 TypeScript 类型定义

## 技术栈

- **React** - UI 框架
- **TypeScript** - 类型安全的 JavaScript
- **Tailwind CSS** - 实用优先的 CSS 框架
- **tsup** - TypeScript 构建工具
- **marked** - Markdown 解析器
- **highlight.js** - 代码高亮库

## 安装

```bash
npm install lan-chat-interface
```

## 使用示例

### 基本聊天界面

```tsx
import React from "react";
import { ChatInterface } from "lan-chat-interface";
import { Message } from "lan-chat-interface/types";

const App: React.FC = () => {
  const [messages, setMessages] = React.useState<Message[]>([]);

  const handleSendMessage = (text: string) => {
    // 发送消息逻辑
    const newMessage: Message = {
      id: Date.now().toString(),
      content: text,
      isUser: true,
      timestamp: new Date(),
    };
    setMessages([...messages, newMessage]);

    // 模拟 AI 回复
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `你发送了: ${text}`,
        isUser: false,
        timestamp: new Date(),
      };
      setMessages([...messages, newMessage, aiMessage]);
    }, 1000);
  };

  return (
    <div className="h-screen w-full">
      <ChatInterface
        messages={messages}
        onSendMessage={handleSendMessage}
        placeholder="输入消息..."
      />
    </div>
  );
};

export default App;
```

### 使用 SSE 实时聊天

```tsx
import React from "react";
import { ChatInterface } from "lan-chat-interface";
import { useChatSSE } from "lan-chat-interface/hooks/useChatSSE";

const App: React.FC = () => {
  const { messages, inputValue, setInputValue, isLoading, handleSendMessage } =
    useChatSSE("https://your-sse-endpoint.com/chat");

  return (
    <div className="h-screen w-full">
      <ChatInterface
        messages={messages}
        onSendMessage={handleSendMessage}
        inputValue={inputValue}
        setInputValue={setInputValue}
        isLoading={isLoading}
        placeholder="输入消息..."
      />
    </div>
  );
};

export default App;
```

## 组件说明

### ChatInterface

主聊天界面组件，包含消息列表和输入区域。

#### 属性

| 属性名          | 类型                      | 描述                   |
| --------------- | ------------------------- | ---------------------- |
| `messages`      | `Message[]`               | 消息列表               |
| `onSendMessage` | `(text: string) => void`  | 发送消息回调           |
| `inputValue`    | `string`                  | 输入框内容（可选）     |
| `setInputValue` | `(value: string) => void` | 设置输入框内容（可选） |
| `isLoading`     | `boolean`                 | 是否加载中（可选）     |
| `placeholder`   | `string`                  | 输入框占位符（可选）   |

### Message

单条消息组件。

#### 属性

| 属性名    | 类型      | 描述     |
| --------- | --------- | -------- |
| `message` | `Message` | 消息对象 |

### CodeBlock

代码块组件，支持语法高亮和复制功能。

#### 属性

| 属性名     | 类型     | 描述             |
| ---------- | -------- | ---------------- |
| `code`     | `string` | 代码内容         |
| `language` | `string` | 编程语言（可选） |

### Input

聊天输入框组件。

#### 属性

| 属性名        | 类型                                                  | 描述               |
| ------------- | ----------------------------------------------------- | ------------------ |
| `value`       | `string`                                              | 输入框内容         |
| `onChange`    | `(e: React.ChangeEvent<HTMLTextAreaElement>) => void` | 内容变化回调       |
| `onSend`      | `() => void`                                          | 发送按钮点击回调   |
| `isLoading`   | `boolean`                                             | 是否加载中（可选） |
| `placeholder` | `string`                                              | 占位符（可选）     |

### Markdown

Markdown 渲染组件。

#### 属性

| 属性名    | 类型     | 描述          |
| --------- | -------- | ------------- |
| `content` | `string` | Markdown 内容 |

## 自定义 Hooks

### useChatSSE

用于处理 Server-Sent Events 实时聊天的 Hook。

#### 参数

| 参数名   | 类型     | 描述           |
| -------- | -------- | -------------- |
| `sseUrl` | `string` | SSE 服务器 URL |

#### 返回值

| 返回值              | 类型                      | 描述           |
| ------------------- | ------------------------- | -------------- |
| `messages`          | `Message[]`               | 消息列表       |
| `inputValue`        | `string`                  | 输入框内容     |
| `setInputValue`     | `(value: string) => void` | 设置输入框内容 |
| `isLoading`         | `boolean`                 | 是否加载中     |
| `handleSendMessage` | `() => void`              | 发送消息函数   |

### useCopyToClipboard

用于复制文本到剪贴板的 Hook。

#### 返回值

| 返回值            | 类型                                 | 描述         |
| ----------------- | ------------------------------------ | ------------ |
| `copyToClipboard` | `(text: string) => Promise<boolean>` | 复制文本函数 |
| `isCopied`        | `boolean`                            | 是否已复制   |

## 开发和构建

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

### 构建

```bash
npm run build
```

### 类型检查

```bash
npm run type-check
```

## 类型定义

### Message

```typescript
interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}
```

## 许可证

MIT
