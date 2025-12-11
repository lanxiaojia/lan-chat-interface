import { Send, Square } from "lucide-react";
import { FC, useEffect, useRef } from "react";
import { ExtendedInputProps } from "../types";

const MessageInput: FC<ExtendedInputProps> = ({
  inputValue,
  setInputValue,
  onSend,
  isTyping,
  onStop,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      const newHeight = textarea.scrollHeight;
      const minHeight = 24;
      const maxHeight = 200;
      const finalHeight = Math.min(Math.max(newHeight, minHeight), maxHeight);
      textarea.style.height = `${finalHeight}px`;
    }
  }, [inputValue]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="lan-w-full lan-p-4 lan-border-gray-100 lan-bg-white">
      <div className="lan-relative lan-flex lan-items-end lan-gap-2 lan-bg-[#f0f4f9] lan-rounded-[28px] lan-px-4 lan-py-3 lan-focus-within:lan-bg-white lan-focus-within:lan-shadow-md lan-focus-within:lan-ring-1 lan-focus-within:lan-ring-gray-200 lan-transition-all lan-duration-200 lan-ease-in-out">
        <textarea
          value={inputValue}
          ref={textareaRef}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="输入消息..."
          className="lan-flex-1 lan-max-h-[200px] lan-bg-transparent lan-border-none lan-focus:lan-ring-0 lan-resize-none lan-py-2 lan-text-base lan-text-gray-800 lan-placeholder-gray-500 lan-outline-none lan-overflow-y-auto scrollbar-none"
          rows={1}
          style={{ minHeight: "24px" }}
        />

        {isTyping ? (
          // 🔴 停止按钮
          <button
            onClick={onStop}
            // 🟢 核心修改：使用 w-8 h-8 固定宽高，去掉 p-2，确保正圆
            className="lan-w-8 lan-h-8 lan-mb-1 lan-rounded-full lan-bg-red-500 lan-text-white lan-hover:lan-bg-red-600 lan-hover:lan-shadow-md lan-active:lan-scale-95 lan-transition-all lan-duration-200 lan-group lan-flex lan-items-center lan-justify-center"
            title="停止生成"
          >
            <Square size={16} fill="currentColor" strokeWidth={0} />
          </button>
        ) : (
          // 🔵 发送按钮
          <button
            onClick={onSend}
            disabled={!inputValue.trim()}
            // 🟢 核心修改：同样使用 w-8 h-8，样式与停止按钮保持高度一致
            className={`lan-w-8 lan-h-8 lan-mb-1 lan-rounded-full lan-flex lan-items-center lan-justify-center lan-transition-all lan-duration-200 lan-group ${
              inputValue.trim()
                ? "lan-bg-blue-600 lan-text-white lan-shadow-md lan-hover:lan-bg-blue-700 lan-hover:lan-shadow-lg lan-active:lan-scale-95"
                : "lan-bg-gray-200 lan-text-gray-400 lan-cursor-not-allowed"
            }`}
          >
            {/* 这里的 ml-0.5 是为了视觉平衡，不影响按钮物理大小 */}
            <Send size={16} strokeWidth={2.5} />
          </button>
        )}
      </div>

      {/* <div className="text-center mt-2 text-xs text-gray-400">
        AI content may be inaccurate.
      </div> */}
    </div>
  );
};

export default MessageInput;
