import React from "react";
import { observer } from "mobx-react-lite";
import { useStores } from "../hooks/useStores";
import ChatBox from "./ChatBox";
import { useSubscription } from "@apollo/client";
import { NEW_MESSAGE_SUBSCRIPTION } from "../graphql/subscriptions";

const ChatWindows: React.FC = observer(() => {
  const { chatWindowStore, messageStore } = useStores();

  useSubscription(NEW_MESSAGE_SUBSCRIPTION, {
    onData: ({ data }) => {
      if (data && data.data) {
        const newMessage = data.data.newMessage;
        messageStore.addMessage(newMessage.conversation.id, newMessage);
        chatWindowStore.openChatWindow(
          newMessage.conversation.id,
          newMessage.sender.id,
          newMessage.sender.username
        );
      }
    },
  });

  return (
    <div className="fixed bottom-0 right-0 flex space-x-4 p-4">
      {chatWindowStore.chatWindows.map((window) => (
        <ChatBox
          key={window.id}
          conversationId={window.conversationId}
          userId={window.userId}
          username={window.username}
          onClose={() => chatWindowStore.closeChatWindow(window.conversationId)}
        />
      ))}
    </div>
  );
});

export default ChatWindows;
