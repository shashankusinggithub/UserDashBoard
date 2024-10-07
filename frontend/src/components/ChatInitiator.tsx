// src/components/ChatInitiator.tsx
import React from "react";
import { observer } from "mobx-react-lite";
import { useStores } from "../hooks/useStores";
import { useMutation } from "@apollo/client";
import { CREATE_OR_GET_CONVERSATION } from "../graphql/mutations";

interface ChatInitiatorProps {
  userId: string;
  username: string;
}

const ChatInitiator: React.FC<ChatInitiatorProps> = observer(
  ({ userId, username }) => {
    const { chatWindowStore } = useStores();
    const [createOrGetConversation] = useMutation(CREATE_OR_GET_CONVERSATION);

    const handleStartChat = async () => {
      try {
        const { data } = await createOrGetConversation({
          variables: { participantIds: [userId] },
        });
        const conversationId = data.createConversation.id;
        chatWindowStore.openChatWindow(conversationId, userId, username);
      } catch (error) {
        console.error("Error starting chat:", error);
      }
    };

    return (
      <button
        onClick={handleStartChat}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Chat
      </button>
    );
  }
);

export default ChatInitiator;
