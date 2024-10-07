import { types, Instance } from "mobx-state-tree";

const ChatWindow = types.model("ChatWindow", {
  id: types.identifier,
  conversationId: types.string,
  userId: types.string,
  username: types.string,
  isOpen: types.boolean,
});

export const ChatWindowStore = types
  .model("ChatWindowStore", {
    chatWindows: types.array(ChatWindow),
    currentUserId: types.maybe(types.string),
  })
  .actions((self) => ({
    openChatWindow(conversationId: string, userId: string, username: string) {
      const existingWindow = self.chatWindows.find(
        (w) => w.conversationId === conversationId
      );
      if (existingWindow) {
        existingWindow.isOpen = true;
      } else if (self.chatWindows.length < 3) {
        self.chatWindows.push({
          id: conversationId,
          conversationId,
          userId,
          username,
          isOpen: true,
        });
      } else {
        // Close the oldest window and open the new one
        self.chatWindows.shift();
        self.chatWindows.push({
          id: conversationId,
          conversationId,
          userId,
          username,
          isOpen: true,
        });
      }
    },
    closeChatWindow(conversationId: string) {
      const index = self.chatWindows.findIndex(
        (w) => w.conversationId === conversationId
      );
      if (index !== -1) {
        self.chatWindows.splice(index, 1);
      }
    },
    setCurrentUserId(userId: string) {
      self.currentUserId = userId;
    },
  }));

export interface IChatWindowStore extends Instance<typeof ChatWindowStore> {}
