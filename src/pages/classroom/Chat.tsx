import React, { useState, useEffect, useRef, JSX } from "react";
import { Client } from "@stomp/stompjs";
import moment from "moment";
import { getChatHistory } from "../../api/ChatApi";
import { useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

interface ChatMessage {
  id: number;
  senderId: number;
  senderName: string;
  content: string;
  timestamp: string; //  "2025-03-27 13:35"
  image?: string; 
}

const Chat = () => {
  const { classroomId } = useParams<{ classroomId: string }>();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState<string>("");
  const [user, setUser] = useState<{ id: number; name: string } | null>(null);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);
  const [stompClient, setStompClient] = useState<Client | null>(null);
  const [connected, setConnected] = useState(false);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);

  const chatContainerRef = useRef<HTMLDivElement>(null);

  const getDayLabel = (ts: string) => {
    const msgMoment = moment(ts, "YYYY-MM-DD HH:mm");
    const today = moment().startOf("day");
    const msgDay = msgMoment.clone().startOf("day");

    // Compare difference in days
    const dayDiff = today.diff(msgDay, "days");

    if (dayDiff === 0) return "Today";
    if (dayDiff === 1) return "Yesterday";
    return msgMoment.format("DD MMM YYYY"); //  "27 Mar 2025"
  };

  // Decoding user from JWT token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        console.log("Decoded JWT payload:", payload);

        setUser({
          id: payload.userId,
          name: payload.sub, // username
        });
      } catch (error) {
        console.error("Failed to decode JWT token", error);
      }
    }
  }, []);

  //  Fetching chat history
  useEffect(() => {
    if (!classroomId) return;
    const fetchHistory = async () => {
      try {
        const history = await getChatHistory(classroomId);

        const sorted = [...history].sort((a, b) =>
          moment(a.timestamp, "YYYY-MM-DD HH:mm").diff(
            moment(b.timestamp, "YYYY-MM-DD HH:mm")
          )
        );
        setMessages(Array.isArray(sorted) ? sorted : []);
      } catch (error) {
        console.error("Error fetching chat history:", error);
        setMessages([]);
      }
    };
    fetchHistory();
  }, [classroomId]);

  // Setting WebSocket Connection
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

        // Subscribe to the chat topic
        client.subscribe(`/topic/classroom/${classroomId}`, (message) => {
          const receivedMessage: ChatMessage = JSON.parse(message.body);
          setMessages((prevMessages) => [...prevMessages, receivedMessage]);
        });
      },
      onStompError: (frame) => {
        console.error("[Chat]  STOMP error:", frame);
      },
      onWebSocketClose: () => {
        console.log("[Chat]  WebSocket Disconnected");
        setConnected(false);
      },
    });

    client.activate();
    return () => {
      client.deactivate();
    };
  }, [classroomId]);

  //auto scroll
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;
    if (!fileList || fileList.length === 0) {
      setSelectedFile(null);
      setFilePreview(null);
      return;
    }
    const file = fileList[0];
    setSelectedFile(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target && typeof e.target.result === "string") {
        setFilePreview(e.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  //  Send message via WebSocket
  const handleSendMessage = async () => {
    if (!message.trim() && !filePreview) return;
    if (!user || !stompClient) return;

    // Build the chat message
    const chatMessage = {
      senderId: user.id,
      senderName: user.name,
      content: message,
      timestamp: moment().format("YYYY-MM-DD HH:mm"),
      classroomId: classroomId,
      image: filePreview || undefined,
    };

    try {
      stompClient.publish({
        destination: "/app/chat",
        body: JSON.stringify(chatMessage),
      });
      // Clear input & file state
      setMessage("");
      setSelectedFile(null);
      setFilePreview(null);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // 7) Send message on Enter
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // redering with day divider
  const renderMessages = () => {
    let previousDayLabel = "";
    const elements: JSX.Element[] = [];

    messages.forEach((msg) => {
      // Figure out if we need a new day divider
      const currentDayLabel = getDayLabel(msg.timestamp);
      if (currentDayLabel !== previousDayLabel) {
        // Insert day divider
        elements.push(
          <div
            key={`divider-${msg.id}-${currentDayLabel}`}
            className="flex justify-center my-2"
          >
            <span className="text-xs font-semibold text-gray-500 px-2 py-1 bg-gray-200 rounded-full">
              {currentDayLabel}
            </span>
          </div>
        );
        previousDayLabel = currentDayLabel;
      }

      // Align bubble based on whether the message was sent by the current user
      const isMine = msg.senderName === user?.name;
      const displayName = msg.senderName || "Unknown";

      elements.push(
        <div
          key={msg.id}
          className={`flex flex-col ${isMine ? "items-end" : "items-start"}`}
        >
          {/* Sender Name */}
          <span className="text-xs font-semibold mb-1 text-gray-500">
            {displayName}
          </span>

          {/* Message Bubble */}
          <div
            className="relative p-3 max-w-[75%] break-words shadow-sm rounded-lg"
            style={{
              backgroundColor: isMine ? "#0065ea" : "#ffffff",
              color: isMine ? "#ffffff" : "#002d55",
              border: isMine ? "none" : "none",
              borderRadius: isMine
                ? "0.5rem 0.5rem 0 0.5rem"
                : "0.5rem 0.5rem 0.5rem 0",
            }}
          >
            {/* If text exists, show it */}
            {msg.content && <div>{msg.content}</div>}

            {/* If there's an image, show it */}
            {msg.image && (
  <img
    src={msg.image}
    alt="attachment"
    className="mt-2 rounded cursor-pointer"
    style={{ maxWidth: "200px" }}
    onClick={() => msg.image && setExpandedImage(msg.image)}
  />
)}

          </div>

          {/* Timestamp below the bubble */}
          <div
            className={`mt-1 text-[11px] ${
              isMine ? "text-right" : "text-left"
            } text-gray-400`}
          >
            {moment(msg.timestamp, "YYYY-MM-DD HH:mm").format("hh:mm A")}
          </div>
        </div>
      );
    });

    return elements;
  };

  return (
    <div className="flex flex-col h-full bg-gray-100">
      <header className="flex-none px-6 py-4 flex items-center justify-between bg-white border-b-2 border-gray-200 shadow-md">
        <h1 className="text-2xl font-bold text-blue-900">Classroom Chat</h1>
        <span className={`text-sm font-semibold ${connected ? "text-green-600" : "text-red-600"}`}>{connected ? "🟢 Online" : "🔴 Offline"}</span>
      </header>
      <main ref={chatContainerRef} className="flex-1 overflow-y-auto px-6 py-6 space-y-4 scrollbar-thin scrollbar-thumb-gray-300">
        {messages.length === 0 ? (
          <div className="text-gray-500 italic text-center mt-12">No messages yet. Start the conversation!</div>
        ) : renderMessages()}
      </main>
      <footer className="flex-none px-6 py-4 bg-white border-t-2 border-gray-200 shadow-inner flex items-center gap-3">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message…"
          className="flex-grow px-4 py-2 border-2 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400"
          disabled={!user}
        />
        <label className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-600 hover:opacity-90 transition">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828L18 9.828M8 7h.01" />
          </svg>
          <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
        </label>
        {filePreview && (
          <img src={filePreview} alt="preview" className="h-10 w-10 object-cover rounded-lg border-2 border-blue-500" />
        )}
        <button
          onClick={handleSendMessage}
          className="px-5 py-2 rounded-full text-white font-medium shadow-md hover:shadow-lg transition-colors disabled:opacity-50"
          style={{ backgroundColor: "#0065ea", border: "2px solid #002d55" }}
          disabled={!user}
        >Send</button>

      <AnimatePresence>
        {expandedImage && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="relative"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <button
                aria-label="Close preview"
                onClick={() => setExpandedImage(null)}
                className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-md hover:bg-gray-200 transition"
              >
                <X className="w-6 h-6 text-gray-800" />
              </button>
              <motion.img
                layoutId={expandedImage}
                src={expandedImage}
                alt="Expanded preview"
                className="max-w-[90vw] max-h-[90vh] rounded-lg shadow-lg"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      </footer>
    </div>
  );
};

export default Chat;