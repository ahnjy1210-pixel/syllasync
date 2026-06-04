"use client";

import { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { Send, MessageSquare, Paperclip, FileText, Search, Pencil, Check, X } from "lucide-react";

interface Message {
  id?: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  content: string;
  attachmentUrl?: string | null;
  attachmentName?: string | null;
  timestamp: string;
}

interface CourseChatProps {
  courseId: string;
  currentUserId: string;
  currentUserName: string;
  currentUserRole: string;
  totalStudentsCount?: number;
  enrolledStudentNames?: { id: string; name: string }[];
}

export default function CourseChat({
  courseId,
  currentUserId,
  currentUserName,
  currentUserRole,
  totalStudentsCount,
  enrolledStudentNames
}: CourseChatProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAttachmentForm, setShowAttachmentForm] = useState(false);
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [attachmentName, setAttachmentName] = useState("");
  // Editing state
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [now, setNow] = useState(Date.now());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Keep 'now' updated every 10 seconds to re-evaluate the 5-minute edit window
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 10000);
    return () => clearInterval(interval);
  }, []);

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
            attachmentUrl: m.attachmentUrl,
            attachmentName: m.attachmentName,
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
    if (!newMessage.trim() && !attachmentUrl.trim()) return;

    const messageText = newMessage.trim();
    const attUrl = attachmentUrl.trim();
    const attName = attachmentName.trim();

    setNewMessage("");
    setAttachmentUrl("");
    setAttachmentName("");
    setShowAttachmentForm(false);

    try {
      const res = await fetch(`/api/courses/${courseId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: messageText,
          attachmentUrl: attUrl || null,
          attachmentName: attName || null
        }),
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
            attachmentUrl: savedMsg.attachmentUrl,
            attachmentName: savedMsg.attachmentName,
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

  const startEditing = (msg: Message) => {
    setEditingMessageId(msg.id!);
    setEditContent(msg.content);
  };

  const cancelEditing = () => {
    setEditingMessageId(null);
    setEditContent("");
  };

  const saveEdit = async (msg: Message) => {
    if (!msg.id || !editContent.trim()) return;
    setEditLoading(true);
    try {
      const res = await fetch(`/api/courses/${courseId}/messages/${msg.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editContent.trim() })
      });

      if (res.ok) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === msg.id ? { ...m, content: editContent.trim() } : m
          )
        );
        cancelEditing();
      } else {
        const d = await res.json();
        alert(d.error || "Failed to edit message");
      }
    } catch {
      alert("Something went wrong while editing.");
    } finally {
      setEditLoading(false);
    }
  };

  const isWithin5Min = (timestamp: string) =>
    now - new Date(timestamp).getTime() < 5 * 60 * 1000;

  const filteredMessages = messages.filter((msg) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      msg.content.toLowerCase().includes(query) ||
      msg.senderName.toLowerCase().includes(query) ||
      (msg.attachmentName && msg.attachmentName.toLowerCase().includes(query))
    );
  });

  return (
    <div className="flex flex-col h-[520px] bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 bg-white/80 backdrop-blur flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-st-purple" />
          <h3 className="font-bold text-st-dark text-sm">Live Course Chat</h3>
        </div>
        <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1 max-w-[180px]">
          <Search className="h-3.5 w-3.5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search..."
            className="bg-transparent border-none text-xs outline-none w-full text-st-dark placeholder:text-gray-400"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="text-[10px] text-gray-450 hover:text-gray-700 font-bold ml-1">
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-55">
        {filteredMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 text-sm">
            <MessageSquare className="h-8 w-8 text-gray-200 mb-2" />
            <p>{searchQuery ? "No matching messages found." : "No messages yet. Be the first to say hello!"}</p>
          </div>
        ) : (
          filteredMessages.map((msg, index) => {
            const isMe = msg.senderId === currentUserId;
            const isEditing = editingMessageId === msg.id;
            const canEdit = isMe && !!msg.id && isWithin5Min(msg.timestamp);

            return (
              <div key={index} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                {!isMe && (
                  <span className="text-xs font-bold text-gray-500 mb-1 ml-1">
                    {msg.senderName}{" "}
                    {msg.senderRole === "PROFESSOR" && (
                      <span className="text-st-purple font-extrabold">(Professor)</span>
                    )}
                  </span>
                )}

                {isEditing ? (
                  /* Inline edit mode */
                  <div className="max-w-[80%] w-full space-y-2">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      rows={2}
                      autoFocus
                      className="w-full px-3 py-2 bg-white border border-st-purple/40 rounded-xl text-sm outline-none focus:ring-2 focus:ring-st-purple/20 text-st-dark resize-none"
                    />
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={cancelEditing}
                        className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
                      >
                        <X className="h-3 w-3" /> Cancel
                      </button>
                      <button
                        onClick={() => saveEdit(msg)}
                        disabled={editLoading || !editContent.trim()}
                        className="flex items-center gap-1 text-xs text-white bg-st-purple hover:bg-st-indigo px-2.5 py-1 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                      >
                        <Check className="h-3 w-3" />
                        {editLoading ? "Saving..." : "Save"}
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Normal message bubble */
                  <div className="group relative">
                    <div
                      className={`max-w-[80%] px-4 py-2.5 rounded-2xl shadow-sm text-sm ${
                        isMe
                          ? "bg-st-purple text-white rounded-tr-none"
                          : "bg-white border border-gray-200/80 text-st-dark rounded-tl-none"
                      }`}
                    >
                      {msg.content && <p className="leading-relaxed break-words">{msg.content}</p>}

                      {msg.attachmentUrl && (
                        <div className={msg.content ? "mt-2 pt-2 border-t border-white/10" : ""}>
                          <a
                            href={msg.attachmentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                              isMe
                                ? "bg-white/15 hover:bg-white/25 text-white border-white/20"
                                : "bg-gray-55 hover:bg-gray-100 text-st-purple border-gray-200"
                            }`}
                          >
                            <FileText className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate max-w-[150px]">{msg.attachmentName || "Attached File"}</span>
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Edit button - appears on hover, only for own messages within 5 min */}
                    {canEdit && (
                      <button
                        onClick={() => startEditing(msg)}
                        title="Edit message (within 5 min)"
                        className={`absolute top-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer p-1 rounded-md bg-white border border-gray-200 hover:border-st-purple/30 hover:text-st-purple text-gray-400 shadow-sm ${
                          isMe ? "-left-8" : "-right-8"
                        }`}
                      >
                        <Pencil className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                )}

                <span className="text-[10px] text-gray-400 mt-1 ml-1 mr-1">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="p-4 border-t border-gray-100 bg-white space-y-3">
        {showAttachmentForm && (
          <div className="p-3 bg-gray-55 border border-gray-250/80 rounded-2xl space-y-2 relative">
            <button
              type="button"
              onClick={() => {
                setShowAttachmentForm(false);
                setAttachmentUrl("");
                setAttachmentName("");
              }}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-xs font-bold"
            >
              ✕
            </button>
            <div className="text-[10px] font-bold text-st-purple uppercase tracking-wider">Attach Link / Document</div>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Name (e.g. Lab Notes)"
                value={attachmentName}
                onChange={(e) => setAttachmentName(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs outline-none text-st-dark placeholder:text-gray-400"
              />
              <input
                type="url"
                placeholder="URL (https://...)"
                value={attachmentUrl}
                onChange={(e) => setAttachmentUrl(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs outline-none text-st-dark placeholder:text-gray-400"
              />
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowAttachmentForm(!showAttachmentForm)}
            className={`p-2.5 rounded-xl transition-all border shrink-0 flex items-center justify-center cursor-pointer ${
              showAttachmentForm || attachmentUrl
                ? "bg-st-purple/10 border-st-purple/20 text-st-purple"
                : "bg-white hover:bg-gray-50 border-gray-300 text-gray-500"
            }`}
            title="Attach a link"
          >
            <Paperclip className="h-5 w-5" />
          </button>

          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={showAttachmentForm ? "Type message (optional if file attached)..." : "Type your message..."}
            className="flex-1 bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-st-purple/20 focus:border-st-purple outline-none transition-all placeholder:text-gray-400 text-st-dark"
          />

          <button
            type="submit"
            disabled={!newMessage.trim() && !attachmentUrl.trim()}
            className="bg-st-purple hover:bg-st-indigo disabled:opacity-50 text-white p-2.5 rounded-xl transition-all shadow-[0_4px_12px_rgba(59,7,100,0.15)] flex items-center justify-center shrink-0 cursor-pointer"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </form>
    </div>
  );
}
