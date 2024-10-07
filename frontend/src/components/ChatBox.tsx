import React, { useState, useEffect, useRef } from "react";
import { observer } from "mobx-react-lite";
import { useStores } from "../hooks/useStores";
import { useMutation, useQuery } from "@apollo/client";
import { SEND_MESSAGE } from "../graphql/mutations";
import { GET_MESSAGES } from "../graphql/queries";

interface ChatBoxProps {
  conversationId: string;
  userId: string;
  username: string;
  onClose: () => void;
}

const ChatBox: React.FC<ChatBoxProps> = observer(
  ({ conversationId, userId, username, onClose }) => {
    const { messageStore } = useStores();
    const [message, setMessage] = useState("");
    const [sendMessage] = useMutation(SEND_MESSAGE);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [showNewMessageIndicator, setShowNewMessageIndicator] =
      useState(false);
    const messageListRef = useRef<HTMLDivElement>(null);
    const [messageCount, setMessageCount] = useState(0);

    const { loading, error, data } = useQuery(GET_MESSAGES, {
      variables: { conversationId },
      fetchPolicy: "network-only",
    });

    useEffect(() => {
      if (data) {
        messageStore.setMessages(conversationId, data.messages);
        setMessageCount(data.messages.length);
        setTimeout(() => {
          scrollToBottom();
        }, 100);
      }
    }, [data, messageStore, conversationId]);

    useEffect(() => {
      if (isAtBottom()) {
        scrollToBottom();
      } else {
        setShowNewMessageIndicator(true);
      }
    }, [messageCount]);

    const isAtBottom = () => {
      if (messageListRef.current) {
        const { scrollTop, scrollHeight, clientHeight } =
          messageListRef.current;
        return scrollHeight - scrollTop <= clientHeight + 100;
      }
      return false;
    };

    const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      setShowNewMessageIndicator(false);
    };

    const handleScroll = () => {
      if (isAtBottom()) {
        setShowNewMessageIndicator(false);
      }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!message.trim()) return;

      try {
        const { data } = await sendMessage({
          variables: { conversationId, content: message },
        });
        messageStore.addMessage(conversationId, data.sendMessage);
        setMessage("");
        scrollToBottom();
      } catch (error) {
        console.error("Error sending message:", error);
      }
    };

    if (loading) return <div>Loading messages...</div>;
    if (error) return <div>Error loading messages: {error.message}</div>;

    const messages = messageStore.messages.get(conversationId) || [];
    if (messages.length != messageCount) {
      setMessageCount(messages.length);

      if (isAtBottom()) {
        scrollToBottom();
      } else {
        setShowNewMessageIndicator(true);
      }
    }
    return (
      <div
        className="w-80 bg-white shadow-lg rounded-t-lg overflow-hidden flex flex-col"
        style={{ height: "400px" }}
      >
        <div className="bg-blue-500 text-white p-2 flex justify-between items-center">
          <span>{username}</span>
          <button onClick={onClose}>&times;</button>
        </div>
        <div
          className="flex-grow overflow-y-auto p-2"
          ref={messageListRef}
          onScroll={handleScroll}
        >
          {messages.map((msg) => (
            <div key={msg.id} className="mb-2">
              <strong>
                {msg.sender.username === username ? username : "You"}:
              </strong>{" "}
              {msg.content}
            </div>
          ))}
          <div ref={messagesEndRef} className="h-10" />
        </div>
        {showNewMessageIndicator && (
          <button
            onClick={scrollToBottom}
            className="bg-blue-500 text-white p-2 rounded absolute bottom-16 left-1/2 transform -translate-x-1/2"
          >
            New messages
          </button>
        )}
        <form onSubmit={handleSendMessage} className="p-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="w-full p-2 border rounded"
          />
        </form>
      </div>
    );
  }
);

export default ChatBox;
