import { useState, useRef, useEffect } from 'preact/hooks';
import { ArrowUp } from 'lucide-preact';

export const MessageInput = ({ onSend, loading }) => {
  const [text, setText] = useState('');
  const textareaRef = useRef(null);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (text.trim() && !loading) {
      onSend(text);
      setText('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [text]);

  return (
    <form class="input-form" onSubmit={handleSubmit}>
      <div class="input-container">
        <textarea
          ref={textareaRef}
          class="chat-input"
          placeholder="What's on your mind?"
          style={{ paddingLeft: '8px' }}
          value={text}
          onInput={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
          rows={1}
        />
        <button type="submit" class="send-button" disabled={!text.trim() || loading}>
          {loading ? (
            <div class="spinner" />
          ) : (
            <ArrowUp size={19} strokeWidth={2.2} color="var(--code-bg)" />
          )}
        </button>
      </div>
    </form>
  );
};
