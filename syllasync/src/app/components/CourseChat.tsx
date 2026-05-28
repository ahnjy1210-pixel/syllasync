"use client";

import { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { Send, MessageSquare } from "lucide-react";

interface Message {
  id?: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  content: string;
  timestamp: string;
}

interface CourseChatProps {
  courseId: string;
  currentUserId: string;
  currentUserName: string;
  currentUserRole: string;
}

export default function CourseChat({ courseId, currentUserId, currentUserName, currentUserRole }: CourseChatProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load message history from DB when courseId changes
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await fetch(`/api/courses/${courseId}/messages`);
        if (res.ok) {
          const data = await res.json();
          const mapped = data.map((m: any) => ({
            id: m.id,
            senderId: m.senderId,
            senderName: m.sender.name,
            senderRole: m.sender.role,
            content: m.content,
            timestamp: m.timestamp,
          }));
          setMessages(mapped);
        }
      } catch (error) {
        console.error("Failed to load message history:", error);
      }
    };

    fetchMessages();
  }, [courseId]);

  // Set up socket connection
  useEffect(() => {
    const newSocket = io();
    
    newSocket.on("connect", () => {
      newSocket.emit("join_course", courseId);
    });

    newSocket.on("receive_message", (message: Message) => {
      setMessages((prev) => {
        if (message.id && prev.some((m) => m.id === message.id)) {
          return prev;
        }
        return [...prev, message];
      });
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [courseId]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const messageText = newMessage.trim();
    setNewMessage("");

    try {
      const res = await fetch(`/api/courses/${courseId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: messageText }),
      });

      if (res.ok) {
        const savedMsg = await res.json();
        if (socket) {
          const messageData: Message = {
            id: savedMsg.id,
            senderId: currentUserId,
            senderName: currentUserName,
            senderRole: currentUserRole,
            content: savedMsg.content,
            timestamp: savedMsg.timestamp,
          };
          socket.emit("send_message", { ...messageData, courseId });
        }
      } else {
        console.error("Failed to save message on server");
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="flex flex-col h-[500px] bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 bg-white/80 backdrop-blur flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-st-purple" />
        <h3 className="font-bold text-st-dark text-sm">Live Course Chat</h3>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 text-sm">
            <MessageSquare className="h-8 w-8 text-gray-200 mb-2" />
            <p>No messages yet. Be the first to say hello!</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isMe = msg.senderId === currentUserId;
            return (
              <div key={index} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                {!isMe && (
                  <span className="text-xs font-bold text-gray-500 mb-1 ml-1">
                    {msg.senderName}{" "}
                    {msg.senderRole === "PROFESSOR" && (
                      <span className="text-st-purple font-extrabold">(Professor)</span>
                    )}
                  </span>
                )}
                <div 
                  className={`max-w-[80%] px-4 py-2.5 rounded-2xl shadow-sm text-sm ${
                    isMe 
                      ? 'bg-st-purple text-white rounded-tr-none' 
                      : 'bg-white border border-gray-200/80 text-st-dark rounded-tl-none'
                  }`}
                >
                  <p className="leading-relaxed break-words">{msg.content}</p>
                </div>
                <span className="text-[10px] text-gray-400 mt-1 ml-1 mr-1">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="p-4 border-t border-gray-100 bg-white">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-st-purple/20 focus:border-st-purple outline-none transition-all placeholder:text-gray-400 text-st-dark"
          />
          <button 
            type="submit" 
            disabled={!newMessage.trim()}
            className="bg-st-purple hover:bg-st-indigo disabled:opacity-50 text-white p-2.5 rounded-xl transition-all shadow-[0_4px_12px_rgba(59,7,100,0.15)] flex items-center justify-center shrink-0 cursor-pointer"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </form>
    </div>
  );
}
