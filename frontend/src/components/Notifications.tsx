import React, { useEffect } from "react";
import { observer } from "mobx-react-lite";
import { useStores } from "../hooks/useStores";
import { useQuery, useMutation } from "@apollo/client";
import { GET_NOTIFICATIONS } from "../graphql/queries";
import { MARK_NOTIFICATION_AS_READ } from "../graphql/mutations";
import { Link } from "react-router-dom";
import { NEW_NOTIFICATION_SUBSCRIPTION } from "../graphql/subscriptions";

const Notifications: React.FC = observer(() => {
  const { notificationStore } = useStores();
  const { loading, error, data, subscribeToMore } = useQuery(GET_NOTIFICATIONS);
  const [markAsRead] = useMutation(MARK_NOTIFICATION_AS_READ);

  useEffect(() => {
    if (data) {
      notificationStore.setNotifications(data.notifications);
    }
  }, [data, notificationStore]);

  useEffect(() => {
    const unsubscribe = subscribeToMore({
      document: NEW_NOTIFICATION_SUBSCRIPTION,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev;
        const newNotification = subscriptionData.data.newNotification;
        notificationStore.addNotification(newNotification);
        return prev;
      },
    });
    return () => unsubscribe();
  }, [subscribeToMore, notificationStore]);

  const handleMarkAsRead = async (id: string) => {
    await markAsRead({ variables: { id } });
    notificationStore.markAsRead(id);
  };

  if (loading) return <p>Loading notifications...</p>;
  if (error) return <p>Error loading notifications: {error.message}</p>;

  return (
    <div className="max-w-2xl mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4">Notifications</h2>
      {notificationStore?.notifications?.map((notification) => (
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
});

export default Notifications;
