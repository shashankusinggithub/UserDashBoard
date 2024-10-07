// src/stores/MessageStore.ts
import { types, Instance } from "mobx-state-tree";
import { number } from "yup";

const User = types.model("User", {
  id: types.maybe(types.string), // Make id optional
  username: types.string,
});

const Message = types
  .model("Message", {
    id: types.identifier,
    content: types.string,
    sender: User,
    createdAt: types.string,
  })
  .views((self) => ({
    get senderName() {
      return self.sender.username;
    },
  }));

export const MessageStore = types
  .model("MessageStore", {
    messages: types.map(types.array(Message)),
  })
  .actions((self) => ({
    addMessage(conversationId: string, message: any) {
      if (!self.messages.has(conversationId)) {
        self.messages.set(conversationId, []);
      }
      // Ensure the sender object has an id, even if it's just the username
      const messageWithSenderId = {
        ...message,
        sender: {
          ...message.sender,
          id: message.sender.id || message.sender.username,
        },
      };
      self.messages.get(conversationId)!.push(messageWithSenderId);
    },
    setMessages(conversationId: string, messages: any[]) {
      // Ensure each message's sender has an id
      const messagesWithSenderIds = messages.map((message) => ({
        ...message,
        sender: {
          ...message.sender,
          id: message.sender.id || message.sender.username,
        },
      }));
      self.messages.set(conversationId, messagesWithSenderIds);
    },
  }));

export interface IMessageStore extends Instance<typeof MessageStore> {}
