import { types, Instance } from "mobx-state-tree";

const Notification = types.model("Notification", {
  id: types.identifier,
  content: types.string,
  createdAt: types.string,
  read: types.boolean,
  linkId: types.maybeNull(types.string),
});

export interface INotification extends Instance<typeof Notification> {}

export const NotificationStore = types
  .model("NotificationStore", {
    notifications: types.array(Notification),
  })
  .actions((self) => ({
    addNotification(notification: INotification) {
      self.notifications.unshift(notification);
    },
    markAsRead(id: string) {
      const notification = self.notifications.find((n) => n.id === id);
      if (notification) {
        notification.read = true;
      }
    },
    setNotifications(notifications: INotification[]) {
      self.notifications.replace(notifications);
    },
  }));

export interface INotificationStore
  extends Instance<typeof NotificationStore> {}
