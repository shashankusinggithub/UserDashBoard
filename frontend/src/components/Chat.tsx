import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useSubscription } from "@apollo/client";
import { GET_MESSAGES } from "../graphql/queries";
import { SEND_MESSAGE } from "../graphql/mutations";
import { NEW_MESSAGE_SUBSCRIPTION } from "../graphql/subscriptions";
import { Message } from "../types";
import { useForm } from "../hooks/useForm";
import { handleError } from "../utils/error-handling";

const Chat: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { loading, error, data, subscribeToMore } = useQuery(GET_MESSAGES, {
    variables: { conversationId: id },
  });
  console.log(id, data);
  const { values, handleChange, resetForm } = useForm({ content: "" });
  const [sendMessage] = useMutation(SEND_MESSAGE);

  useEffect(() => {
    const unsubscribe = subscribeToMore({
      document: NEW_MESSAGE_SUBSCRIPTION,
      variables: { conversationId: id },
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev;
        const newMessage = subscriptionData.data.newMessage;
        return {
          ...prev,
          messages: [...prev.messages, newMessage],
        };
      },
    });

    return () => unsubscribe();
  }, [id, subscribeToMore]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await sendMessage({
        variables: { conversationId: id, content: values.content },
      });
      resetForm();
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  if (loading) return <div className="text-center">Loading messages...</div>;
  if (error)
    return <div className="text-center text-red-500">{handleError(error)}</div>;

  return (
    <div className="flex flex-col h-[calc(100vh-16rem)]">
      <h1 className="text-3xl font-bold mb-4 dark:text-white">Chat</h1>
      <div className="flex-grow overflow-y-auto mb-4 space-y-4">
        {data.messages.map((message: Message) => (
          <div
            key={message.id}
            className="bg-white p-4 rounded-lg shadow-md dark:bg-gray-600 dark:text-white"
          >
            <p className="font-bold">{message.sender.username}</p>
            <p>{message.content}</p>
            <p className="text-sm text-gray-500">
              {new Date(parseInt(message.createdAt)).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="mt-auto">
        <input
          type="text"
          name="content"
          value={values.content}
          onChange={handleChange}
          placeholder="Type a message..."
          className="w-full p-2 border rounded"
          required
        />
        <button
          type="submit"
          className="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default Chat;
