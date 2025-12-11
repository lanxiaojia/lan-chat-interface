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
- **react-markdown** - Markdown 解析器
- **react-syntax-highlighter** - 代码高亮库
- **Server-Sent Events (SSE)** - 实时消息推送

## 安装

```bash
npm install lan-chat-interface
```

## 使用示例

### 基本聊天界面（带 SSE 支持）

```tsx
import React from "react";
import { ChatInterface } from "lan-chat-interface";

const App: React.FC = () => {
  return (
    <div className="h-screen w-full">
      <ChatInterface
        apiRoute="https://your-sse-endpoint.com/chat"
        method="POST"
        title="AI 聊天助手"
        initialMessage="你好，我是 AI 助手，有什么可以帮你？"
      />
    </div>
  );
};

export default App;
```

### 带历史记录的聊天界面

```tsx
import React from "react";
import { ChatInterface } from "lan-chat-interface";
import "lan-chat-interface/styles.css";
import { Message } from "lan-chat-interface/types";

const App: React.FC = () => {
  // 历史消息记录
  const initialHistory: Message[] = [
    {
      id: "1",
      role: "user",
      content: "你好，介绍一下自己",
    },
    {
      id: "2",
      role: "assistant",
      content: "你好！我是一个基于人工智能的聊天助手，很高兴为您服务。",
    },
  ];

  return (
    <div className="h-screen w-full">
      <ChatInterface
        apiRoute="https://your-sse-endpoint.com/chat"
        title="AI 聊天助手"
        initialHistory={initialHistory}
      />
    </div>
  );
};

export default App;
```

## 组件说明

### ChatInterface

主聊天界面组件，包含消息列表和输入区域，内部集成了 SSE 实时通信功能。

#### 属性

| 属性名           | 类型              | 描述                     |
| ---------------- | ----------------- | ------------------------ |
| `apiRoute`       | `string`          | SSE 服务器接口地址       |
| `method`         | `"GET" \| "POST"` | 请求方法（默认：GET）    |
| `initialMessage` | `string`          | 初始欢迎消息（可选）     |
| `title`          | `string`          | 聊天窗口标题（可选）     |
| `className`      | `string`          | 自定义样式类名（可选）   |
| `initialHistory` | `Message[]`       | 初始历史消息记录（可选） |

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

用于处理 Server-Sent Events 实时聊天的 Hook（内部使用）。

#### 说明

该 Hook 已被 ChatInterface 组件内部集成，通常不需要直接使用。如果需要自定义聊天逻辑，可以查看源代码实现。

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
  role: "user" | "assistant";
  content: string;
  [key: string]: any;
}
```

## 许可证

MIT
