import React from "react";
import { useQuery } from "@apollo/client";
import { Link } from "react-router-dom";
import { GET_CONVERSATIONS } from "../graphql/queries";
import { Conversation } from "../types";
import { handleError } from "../utils/error-handling";
import { useAuth } from "../hooks/useAuth";

const Conversations: React.FC = () => {
  const { loading, error, data } = useQuery(GET_CONVERSATIONS);
  const { user } = useAuth();
  console.log(data);
  if (loading)
    return <div className="text-center">Loading conversations...</div>;
  if (error)
    return <div className="text-center text-red-500">{handleError(error)}</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4 dark:text-white">Conversations</h1>
      <div className="space-y-4">
        {data.conversations.map((conversation: Conversation) => (
          <Link
            key={conversation.id}
            to={`/conversations/${conversation.id}`}
            className="block"
          >
            <div className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow dark:bg-gray-700 dark:text-white">
              <p className="font-bold">
                {conversation.participants
                  .map((p) => p.user.username)
                  .join(", ")}
              </p>
              {conversation.lastMessage && (
                <>
                  <p className="text-gray-500">
                    {conversation.lastMessage.content}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(
                      parseInt(conversation.lastMessage.createdAt)
                    ).toLocaleString()}
                  </p>
                </>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Conversations;
