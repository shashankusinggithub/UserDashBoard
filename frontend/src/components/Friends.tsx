import React from "react";
import { useMutation, useQuery } from "@apollo/client";
import { GET_FRIENDS } from "../graphql/queries";
import { User } from "../types";
import { handleError } from "../utils/error-handling";
import { CREATE_OR_GET_CONVERSATION } from "../graphql/mutations";
import { useNavigate } from "react-router-dom";

const Friends: React.FC = () => {
  const { loading, error, data } = useQuery(GET_FRIENDS);
  const [createConversation] = useMutation(CREATE_OR_GET_CONVERSATION);
  const navigate = useNavigate();
  const handleStartChat = async (friendId: string) => {
    try {
      console.log([friendId]);
      const { data } = await createConversation({
        variables: { participantIds: [friendId] },
      });
      navigate(`/conversations/${data.createConversation.id}`);
    } catch (err) {
      console.error("Error starting chat:", err);
    }
  };

  if (loading) return <div className="text-center">Loading friends...</div>;
  if (error)
    return <div className="text-center text-red-500">{handleError(error)}</div>;

  const handleRemoveFriend = (friendId: string) => {
    console.log(friendId);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Friends</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {data.me.friends?.map((friend: User) => (
          <div key={friend.id} className="bg-white p-4 rounded-lg shadow-md">
            <div className="flex items-center">
              <img
                src={friend.profilePicture || "/default-avatar.png"}
                alt={`${friend.username}'s avatar`}
                className="w-10 h-10 rounded-full mr-4"
              />
              <div>
                <p className="font-bold">{friend.username}</p>
                <p>
                  {friend.firstName} {friend.lastName}
                </p>
              </div>
              <button
                onClick={() => handleStartChat(friend.id)}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
              >
                Chat
              </button>
              <button
                onClick={() => handleRemoveFriend(friend.id)}
                className="bg-red-500 text-white px-4 py-2 rounded ml-auto"
              >
                Remove Friend
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Friends;
