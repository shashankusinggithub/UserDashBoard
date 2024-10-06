import React, { useEffect } from "react";
import { useQuery, useMutation, useSubscription } from "@apollo/client";
import { GET_NOTIFICATIONS } from "../graphql/queries";
import { MARK_NOTIFICATION_AS_READ } from "../graphql/mutations";
import { Notification } from "../types";
import { Link } from "react-router-dom";
import { NEW_NOTIFICATION_SUBSCRIPTION } from "../graphql/subscriptions";

const Notifications: React.FC = () => {
  const { loading, error, data, refetch, subscribeToMore } =
    useQuery(GET_NOTIFICATIONS);

  const [markAsRead] = useMutation(MARK_NOTIFICATION_AS_READ);

  const { data: subData } = useSubscription(NEW_NOTIFICATION_SUBSCRIPTION);
  useEffect(() => {
    if (subData) {
      console.log("New notification received:", subData);
      // Handle the new notification here
    }
  }, [subData]);

  useEffect(() => {
    const unsubscribe = subscribeToMore({
      document: NEW_NOTIFICATION_SUBSCRIPTION,

      updateQuery: (prev, { subscriptionData }) => {
        console.log("Received new notification:", subscriptionData);
        if (!subscriptionData.data) return prev;
        const newNotification = subscriptionData.data.newNotification;
        return {
          ...prev,
          notifications: [newNotification, ...prev.notifications],
        };
      },
      onError: (error) => {
        console.error("Subscription error:", error);
      },
    });
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [subscribeToMore, data]);

  if (loading) return <p>Loading notifications...</p>;
  if (error) return <p>Error loading notifications: {error.message}</p>;

  const handleMarkAsRead = async (id: string) => {
    await markAsRead({ variables: { id } });
    refetch();
  };

  return (
    <div className="max-w-2xl mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4">Notifications</h2>
      {data.notifications.map((notification: Notification) => (
        <div
          key={notification.id}
          className="bg-white shadow rounded-lg p-4 mb-4"
        >
          <Link to={`/profile/${notification.linkId}`}>
            <p>{notification.content}</p>
            <p className="text-sm text-gray-500">
              {new Date(parseInt(notification.createdAt)).toLocaleString()}
            </p>
            {!notification.read && (
              <button
                onClick={() => handleMarkAsRead(notification.id)}
                className="mt-2 text-blue-500 hover:text-blue-700"
              >
                Mark as read
              </button>
            )}
          </Link>
        </div>
      ))}
    </div>
  );
};

export default Notifications;
