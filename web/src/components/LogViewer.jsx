import { useState, useEffect, useRef } from 'preact/hooks';
import { Terminal, X, Trash2, ChevronUp, ChevronDown, Circle } from 'lucide-preact';
import './LogViewer.css';

export function LogViewer() {
  const [logs, setLogs] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const logsEndRef = useRef(null);

  useEffect(() => {
    const apiBase = import.meta.env.VITE_API_BASE_URL || `http://localhost:8000`;
    const sseUrl = `${apiBase}/logs/stream`;
    const es = new EventSource(sseUrl);

    es.onopen = () => setIsConnected(true);
    es.onmessage = (event) => {
      setLogs(prev => {
        const newLogs = [...prev, event.data];
        return newLogs.length > 300 ? newLogs.slice(-300) : newLogs;
      });
    };
    es.onerror = () => setIsConnected(false);

    return () => es.close();
  }, []);

  useEffect(() => {
    if (logsEndRef.current && isExpanded) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, isExpanded]);

  const getLogType = (log) => {
    if (log.includes(' ERROR ')) return 'error';
    if (log.includes(' WARNING ')) return 'warning';
    if (log.includes(' DEBUG ')) return 'debug';
    return 'info';
  };

  if (!isExpanded) {
    return (
      <button class="log-trigger shadow-sm" onClick={() => setIsExpanded(true)} title="Show Logs">
        <Terminal size={18} />
        <span class={`status-dot ${isConnected ? 'online' : 'offline'}`} />
      </button>
    );
  }

  return (
    <div class="log-panel shadow-lg">
      <header class="log-panel-header">
        <div class="header-left">
          <Terminal size={16} />
          <h3>System Logs</h3>
          <span class="log-count">{logs.length}</span>
        </div>
        <div class="header-actions">
          <button onClick={() => setLogs([])} title="Clear Logs" class="icon-button">
            <Trash2 size={14} />
          </button>
          <button onClick={() => setIsExpanded(false)} title="Close" class="icon-button">
            <X size={16} />
          </button>
        </div>
      </header>
      
      <div class="log-content">
        {logs.length === 0 ? (
          <div class="log-empty">No logs available</div>
        ) : (
          logs.map((log, index) => (
            <div key={index} class={`log-row ${getLogType(log)}`}>
              <span class="log-timestamp">{log.split(' - ')[0] || ''}</span>
              <span class="log-message">{log.split(' - ').slice(1).join(' - ')}</span>
            </div>
          ))
        )}
        <div ref={logsEndRef} />
      </div>
    </div>
  );
}
