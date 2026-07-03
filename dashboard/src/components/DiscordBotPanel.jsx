import React, { useState } from 'react';
import { MoreVertical, Smile, Send } from 'lucide-react';

export const DiscordBotPanel = () => {
  const [messages, setMessages] = useState([
    { id: 1, author: 'Boss bot', time: '10:15 PM', text: 'Hello! Checking on usage.' }
  ]);
  const [input, setInput] = useState('');

  const handleSend = (e) => {
    e.preventDefault();
    if (input.trim()) {
      setMessages([...messages, { 
        id: Date.now(), 
        author: 'You', 
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), 
        text: input.trim() 
      }]);
      setInput('');
    }
  };

  return (
    <div className="panel" style={{ height: '300px' }}>
      <div className="panel-title">
        Discord Bot
        <MoreVertical size={16} color="var(--text-secondary)" />
      </div>
      
      <div className="discord-panel">
        <div className="discord-messages">
          {messages.map(msg => (
            <div key={msg.id} className="discord-msg">
              <div className="discord-avatar">
                <svg width="24" height="24" viewBox="0 0 127.14 96.36" fill="#fff">
                  <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1,105.25,105.25,0,0,0,32.19-16.14c2.64-27.38-4.51-51.11-18.9-72.15ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.31,60,73.31,53s5-12.74,11.43-12.74S96.2,46,96.09,53,91,65.69,84.69,65.69Z"/>
                </svg>
              </div>
              <div>
                <span className="discord-author">{msg.author}</span>
                <span className="discord-time">{msg.time}</span>
                <div className="discord-text">{msg.text}</div>
              </div>
            </div>
          ))}
        </div>
        
        <form className="discord-input-container" onSubmit={handleSend}>
          <div style={{ position: 'relative' }}>
            <input 
              type="text" 
              className="discord-input" 
              placeholder="Message..." 
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <div style={{ position: 'absolute', right: '12px', top: '10px', display: 'flex', gap: '8px', color: '#949ba4' }}>
              <Smile size={18} />
              <button type="submit" style={{ background: 'none', border: 'none', padding: 0, color: 'inherit', cursor: 'pointer' }}>
                <Send size={18} />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
