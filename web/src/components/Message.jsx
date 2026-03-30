import { memo } from 'preact/compat';
import { User, Sparkles, Copy } from 'lucide-preact';
import { marked } from 'marked';

export const Message = memo(({ role, content, onCopy }) => {
  const isUser = role === 'user';
  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    if (onCopy) onCopy();
  };

  const parsedContent = marked.parse(content);
  
  return (
    <div class={`message-wrapper ${isUser ? 'user' : 'assistant'}`}>
      <div class="message-avatar shadow-sm">
        {isUser ? (
          <User size={18} strokeWidth={2} />
        ) : (
          <Sparkles size={18} strokeWidth={2} />
        )}
      </div>
      <div class="message-bubble">
        <div 
          class="message-content" 
          dangerouslySetInnerHTML={{ __html: parsedContent }} 
        />
        {!isUser && (
          <div class="message-actions">
            <button title="Copy" class="action-btn" onClick={handleCopy}>
              <Copy size={13} strokeWidth={2.4} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
});
