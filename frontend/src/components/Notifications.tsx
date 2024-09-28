import React, { useEffect } from "react";
import { useQuery, useSubscription } from "@apollo/client";
import { GET_NOTIFICATIONS } from "../graphql/queries";
import { NEW_NOTIFICATION_SUBSCRIPTION } from "../graphql/subscriptions";
import { Notification } from "../types";
import { handleError } from "../utils/error-handling";

const Notifications: React.FC = () => {
  const { loading, error, data, subscribeToMore } = useQuery(GET_NOTIFICATIONS);

  useEffect(() => {
    const unsubscribe = subscribeToMore({
      document: NEW_NOTIFICATION_SUBSCRIPTION,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev;
        const newNotification = subscriptionData.data.newNotification;
        return {
          ...prev,
          notifications: [newNotification, ...prev.notifications],
        };
      },
    });

    return () => unsubscribe();
  }, [subscribeToMore]);

  if (loading)
    return <div className="text-center">Loading notifications...</div>;
  if (error)
    return <div className="text-center text-red-500">{handleError(error)}</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Notifications</h1>
      <div className="space-y-4">
        {data.notifications.map((notification: Notification) => (
          <div
            key={notification.id}
            className="bg-white p-4 rounded-lg shadow-md"
          >
            <p>{notification.content}</p>
            <p className="text-sm text-gray-500">
              {new Date(parseInt(notification.createdAt)).toLocaleString()}
            </p>
            <p className="text-sm">{notification.read ? "Read" : "Unread"}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Notifications;
