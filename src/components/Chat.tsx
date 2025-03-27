import React, { useState, useEffect, useRef } from "react";
import { Client } from "@stomp/stompjs";
import moment from "moment";
import { getChatHistory } from "../api/ChatApi";

interface ChatMessage {
  id: number;
  senderId: number;
  senderName: string;
  content: string;
  timestamp: string;
}

const Chat: React.FC<{ classId: string }> = ({ classId }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState<string>("");
  const [user, setUser] = useState<{ id: number; name: string } | null>(null);
  const [stompClient, setStompClient] = useState<Client | null>(null);
  const [connected, setConnected] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // ✅ Decode user from JWT token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setUser({ id: payload.userId, name: payload.name });
      } catch (error) {
        console.error("Failed to decode JWT token", error);
      }
    }
  }, []);

  // ✅ Fetch chat history on load
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const history = await getChatHistory(classId);
        setMessages(Array.isArray(history) ? history : []);
      } catch (error) {
        console.error("Error fetching chat history:", error);
        setMessages([]);
      }
    };
    fetchHistory();
  }, [classId]);

  // ✅ Setup WebSocket Connection
  useEffect(() => {
    const client = new Client({
      brokerURL: "ws://localhost:8080/ws/websocket",
      reconnectDelay: 5000,
      debug: (str) => console.log("[STOMP Debug]:", str),
      connectHeaders: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      onConnect: () => {
        console.log("[Chat] ✅ Connected to WebSocket");
        setStompClient(client);
        setConnected(true);

        client.subscribe(`/topic/classroom/${classId}`, (message) => {
          const receivedMessage: ChatMessage = JSON.parse(message.body);
          setMessages((prevMessages) => [...prevMessages, receivedMessage]);
          //scrollToBottom();
        });
      },
      onStompError: (frame) => {
        console.error("[Chat] ❌ STOMP error:", frame);
      },
      onWebSocketClose: () => {
        console.log("[Chat] 🔌 WebSocket Disconnected");
        setConnected(false);
      },
    });

    client.activate();

    return () => {
      client.deactivate();
    };
  }, [classId]);

  // ✅ Scroll chat to bottom when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // ✅ Send message via WebSocket
  const handleSendMessage = async () => {
    if (!message.trim() || !user || !stompClient) return;

    const chatMessage = {
      senderId: user.id,
      senderName: user.name,
      content: message,
      timestamp: moment().format("YYYY-MM-DD HH:mm"),// ✅ Fix timestamp format
      classroomId: classId,
    };

    try {
      stompClient.publish({
        destination: `/app/chat`, // ✅ Adjust endpoint if needed /${classId}
        body: JSON.stringify(chatMessage),
      });

      setMessage("");
    //  scrollToBottom();
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="flex flex-col w-full max-w-2xl mx-auto p-4 border border-gray-300 rounded-lg shadow-lg bg-white">
      <div className="flex justify-between items-center mb-2 border-b pb-2">
        <h2 className="text-lg font-semibold">Classroom Chat</h2>
        <span className={`text-sm ${connected ? "text-green-600" : "text-red-600"}`}>
          {connected ? "🟢 Online" : "🔴 Offline"}
        </span>
      </div>

      <div
        ref={chatContainerRef}
        className="h-72 overflow-y-auto border p-2 rounded-md bg-gray-100 flex flex-col"
      >
        {messages.length === 0 ? (
          <p className="text-gray-500 text-center">No messages yet. Start the conversation!</p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`p-2 rounded-md my-1 ${
                msg.senderId === user?.id ? "bg-blue-200 self-end" : "bg-white self-start"
              } shadow`}
            >
              <p className="text-xs text-gray-600">
                {msg.senderName || "Unknown"} • {moment(msg.timestamp).format("hh:mm A")}
              </p>
              <p className="text-black">{msg.content}</p>
            </div>
          ))
        )}
      </div>

      <div className="flex mt-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-grow p-2 border rounded-l-md focus:outline-none"
          disabled={!user}
        />
        <button
          onClick={handleSendMessage}
          className="p-2 bg-blue-500 text-white rounded-r-md disabled:bg-gray-400"
          disabled={!user}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;
