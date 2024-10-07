import { types, Instance } from "mobx-state-tree";
import { NotificationStore } from "./NotificationStore";
import { MessageStore } from "./MessageStore";
import { ChatWindowStore } from "./ChatWindowStore";

export const RootStore = types.model("RootStore", {
  notificationStore: types.optional(NotificationStore, {}),
  messageStore: types.optional(MessageStore, {}),
  chatWindowStore: types.optional(ChatWindowStore, {}),
});

export interface IRootStore extends Instance<typeof RootStore> {}
