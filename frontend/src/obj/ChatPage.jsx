import { useState } from "react";
import React from "react";
export default function ChatApp1() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages([...messages, { text: input, time: new Date().toLocaleTimeString() }]);
    setInput("");
  };

  return (
    <div className="max-w-md mx-auto p-4 bg-white shadow-xl rounded-2xl h-[600px] flex flex-col">
      <h2 className="text-xl font-bold mb-4">Chat</h2>
      <div className="flex-1 overflow-y-auto space-y-2 mb-4 p-2 border rounded bg-gray-50">
        {messages.map((msg, i) => (
          <div key={i} className="flex justify-start">
            <div className="bg-blue-500 text-white px-4 py-2 rounded-lg">
              <p>{msg.text}</p>
              <span className="text-xs text-gray-200">{msg.time}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 border rounded px-3 py-2"
          placeholder="Type a message..."
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button onClick={sendMessage} className="bg-blue-600 text-white px-4 py-2 rounded">
          Send
        </button>
      </div>
    </div>
  );
}
