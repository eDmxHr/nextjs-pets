import Pusher from "pusher-js";
import { useState, useEffect, useRef } from "react";

export default function Chat() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [socketId, setSocketId] = useState();
  const [messageLog, setMessageLog] = useState([]);
  const [userMessage, setUserMessage] = useState("");
  const chatField = useRef(null);
  const chatLogElement = useRef(null);

  useEffect(() => {
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHERKEY, {
      cluster: "us2",
    });
    pusher.connection.bind("connected", () => {
      setSocketId(pusher.connection.socket_id);
    });
    const channel = pusher.subscribe("private-petchat");
    channel.bind("message", (data) => {
      setMessageLog((prev) => [...prev, data]);
    });
  }, []);

  useEffect(() => {
    if (messageLog.length) {
      chatLogElement.current.scrollTop = chatLogElement.current.scrollHeight;
      if (!isChatOpen) {
        setUnreadCount((prev) => prev + 1);
      }
    }
  }, [messageLog]);

  function openChatClick() {
    setIsChatOpen(true);
    setUnreadCount(0);
    setTimeout(() => {
      chatField.current.focus();
    }, 350);
  }

  function closeChatClick() {
    setIsChatOpen(false);
  }

  function handleChatSubmit(e) {
    e.preventDefault();
    fetch("/admin/send-chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userMessage, socket_id: socketId }),
    });
    setMessageLog((prev) => [
      ...prev,
      { selfMessage: true, message: userMessage },
    ]);
    setUserMessage("");
  }

  function handleInputChange(e) {
    setUserMessage(e.target.value.trim());
  }

  return (
    <>
      <div className="open-chat" onClick={openChatClick}>
        {unreadCount > 0 && (
          <span className="chat-unread-badge">{unreadCount}</span>
        )}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          fill="currentColor"
          className="bi bi-chat-dots-fill"
          viewBox="0 0 16 16"
        >
          <path d="M16 8c0 3.866-3.582 7-8 7a9 9 0 0 1-2.347-.306c-.584.296-1.925.864-4.181 1.234-.2.032-.352-.176-.273-.362.354-.836.674-1.95.77-2.966C.744 11.37 0 9.76 0 8c0-3.866 3.582-7 8-7s8 3.134 8 7M5 8a1 1 0 1 0-2 0 1 1 0 0 0 2 0m4 0a1 1 0 1 0-2 0 1 1 0 0 0 2 0m3 1a1 1 0 1 0 0-2 1 1 0 0 0 0 2" />
        </svg>
      </div>
      <div
        className={
          isChatOpen
            ? "chat-container chat-container--visible"
            : "chat-container"
        }
      >
        <div className="chat-title-bar">
          <h4>Staff Team Chat</h4>
          <svg
            onClick={closeChatClick}
            xmlns="http://www.w3.org/2000/svg"
            width="25"
            height="25"
            viewBox="0 0 24 24"
          >
            <path
              fill="#ffffff"
              d="m12 12.708l3.246 3.246q.14.14.344.15t.364-.15t.16-.354t-.16-.354L12.708 12l3.246-3.246q.14-.14.15-.344t-.15-.364t-.354-.16t-.354.16L12 11.292L8.754 8.046q-.14-.14-.344-.15t-.364.15t-.16.354t.16.354L11.292 12l-3.246 3.246q-.14.14-.15.345q-.01.203.15.363t.354.16t.354-.16zM12.003 21q-1.867 0-3.51-.708q-1.643-.709-2.859-1.924t-1.925-2.856T3 12.003t.709-3.51Q4.417 6.85 5.63 5.634t2.857-1.925T11.997 3t3.51.709q1.643.708 2.859 1.922t1.925 2.857t.709 3.509t-.708 3.51t-1.924 2.859t-2.856 1.925t-3.509.709"
            />
          </svg>
        </div>
        <div ref={chatLogElement} className="chat-log">
          {messageLog.map((item, index) => {
            return (
              <div
                key={index}
                className={
                  item.selfMessage
                    ? "chat-message chat-message--self"
                    : "chat-message"
                }
              >
                <div className="chat-message-inner">{item.message}</div>
              </div>
            );
          })}
        </div>
        <form onSubmit={handleChatSubmit}>
          <input
            value={userMessage}
            ref={chatField}
            type="text"
            autoComplete="off"
            placeholder="Your message here"
            onChange={handleInputChange}
          />
        </form>
      </div>
    </>
  );
}
