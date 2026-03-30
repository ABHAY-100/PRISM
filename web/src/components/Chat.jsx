import { useState, useRef, useEffect, useCallback } from 'preact/hooks';
import { Sparkles } from 'lucide-preact';
import { Message } from './Message';
import { MessageInput } from './MessageInput';
import './Chat.css';

export const Chat = () => {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! How can I help you today?' },
  ]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '' });
  const scrollRef = useRef(null);

  const showToast = (message) => {
    setToast({ visible: true, message });
    setTimeout(() => setToast({ visible: false, message: '' }), 2000);
  };

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const onSend = async (message) => {
    setMessages((prev) => [...prev, { role: 'user', content: message }]);
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: 'web-user',
          message_content: message,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch response');
      }

      const data = await response.json();
      setMessages((prev) => [...prev, { role: 'assistant', content: data.response }]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: "Sorry, I'm having trouble connecting to the server. Please check your connection." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class="chat-wrapper">
      <main class="message-list" ref={scrollRef}>
        {messages.map((m, idx) => (
          <Message 
            key={idx} 
            role={m.role} 
            content={m.content} 
            onCopy={() => showToast('Copied to clipboard!')} 
          />
        ))}
        {loading && (
          <div class="message-wrapper assistant">
            <div class="message-avatar shadow-sm">
              <Sparkles size={18} strokeWidth={2} />
            </div>
            <div class="message-bubble typing">
              <span class="dot" />
              <span class="dot" />
              <span class="dot" />
            </div>
          </div>
        )}
      </main>

      <footer class="chat-footer">
        <MessageInput onSend={onSend} loading={loading} />
      </footer>

      {toast.visible && (
        <div class="toast shadow-sm">
          {toast.message}
        </div>
      )}
    </div>
  );
};


