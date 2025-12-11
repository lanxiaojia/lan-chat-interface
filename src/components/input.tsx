import { Send, Square } from "lucide-react";
import { FC, useEffect, useRef } from "react";
import { ExtendedInputProps } from "../types";

const MessageInput: FC<ExtendedInputProps> = ({
  inputValue,
  setInputValue,
  onSend,
  isTyping,
  onStop,
  disabled = false,
  placeholder = "输入消息...",
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
      // 🟢 禁用状态下不允许发送
      if (!disabled) {
        onSend();
      }
    }
  };

  return (
    <div className="lan-w-full lan-p-4 lan-border-gray-100 lan-bg-white">
      <div
        className={`lan-relative lan-flex lan-items-end lan-gap-2 lan-rounded-[28px] lan-px-4 lan-py-3 lan-transition-all lan-duration-200 lan-ease-in-out
          ${
            disabled
              ? "lan-bg-gray-100 lan-cursor-not-allowed lan-opacity-70"
              : "lan-bg-[#f0f4f9] lan-focus-within:lan-bg-white lan-focus-within:lan-shadow-md lan-focus-within:lan-ring-1 lan-focus-within:lan-ring-gray-200"
          }
        `}
      >
        <textarea
          value={inputValue}
          ref={textareaRef}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder} // 🟢 使用传入的 placeholder
          disabled={disabled} // 🟢 绑定 disabled
          className={`lan-flex-1 lan-max-h-[200px] lan-bg-transparent lan-border-none lan-focus:lan-ring-0 lan-resize-none lan-py-2 lan-text-base lan-text-gray-800 lan-placeholder-gray-500 lan-outline-none lan-overflow-y-auto scrollbar-none 
            ${disabled ? "lan-cursor-not-allowed" : ""}
          `}
          rows={1}
          style={{ minHeight: "24px" }}
        />

        {isTyping ? (
          <button
            onClick={onStop}
            className="lan-w-8 lan-h-8 lan-mb-1 lan-rounded-full lan-bg-red-500 lan-text-white lan-hover:lan-bg-red-600 lan-hover:lan-shadow-md lan-active:lan-scale-95 lan-transition-all lan-duration-200 lan-group lan-flex lan-items-center lan-justify-center"
            title="停止生成"
          >
            <Square size={16} fill="currentColor" strokeWidth={0} />
          </button>
        ) : (
          <button
            onClick={onSend}
            // 🟢 禁用逻辑：输入为空 或 全局被禁用
            disabled={!inputValue.trim() || disabled}
            className={`lan-w-8 lan-h-8 lan-mb-1 lan-rounded-full lan-flex lan-items-center lan-justify-center lan-transition-all lan-duration-200 lan-group ${
              inputValue.trim() && !disabled
                ? "lan-bg-blue-600 lan-text-white lan-shadow-md lan-hover:lan-bg-blue-700 lan-hover:lan-shadow-lg lan-active:lan-scale-95"
                : "lan-bg-gray-200 lan-text-gray-400 lan-cursor-not-allowed"
            }`}
          >
            <Send size={16} strokeWidth={2.5} />
          </button>
        )}
      </div>
    </div>
  );
};

export default MessageInput;
