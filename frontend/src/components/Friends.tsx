import React from "react";
import { useMutation, useQuery } from "@apollo/client";
import { GET_FRIENDS_LIST } from "../graphql/queries";
import { User } from "../types";
import { handleError } from "../utils/error-handling";
import {
  CREATE_OR_GET_CONVERSATION,
  REMOVE_FRIEND,
} from "../graphql/mutations";
import { useNavigate } from "react-router-dom";
import Avatar from "../assests/default-avatar.png";

const FriendCard: React.FC<{
  friend: User;
  onChat: () => void;
  onUnfriend: () => void;
}> = ({ friend, onChat, onUnfriend }) => (
  <div className="bg-white p-6 rounded-lg shadow-lg transition-transform transform hover:scale-105">
    <div className="flex items-center space-x-3">
      <img
        src={
          (friend.profilePicture &&
            `data:image/jpeg;base64,${friend.profilePicture}`) ||
          Avatar
        }
        alt={`${friend.username}'s avatar`}
        className="w-10 h-10 rounded-full mr-4"
      />
      <div className="flex-grow w-4">
        <p className="font-bold ">{friend.username}</p>
        <p>
          {friend.firstName} {friend.lastName}
        </p>
      </div>
      <div className="flex items-center space-x-2">
        {" "}
        {/* Removed ml-auto */}
        <button
          onClick={onChat}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          Chat
        </button>
        <button
          onClick={onUnfriend}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200"
        >
          Unfriend
        </button>
      </div>
    </div>
  </div>
);

const Friends: React.FC = () => {
  const { loading, error, data } = useQuery(GET_FRIENDS_LIST);
  const [createConversation] = useMutation(CREATE_OR_GET_CONVERSATION);
  const [removeFriend] = useMutation(REMOVE_FRIEND);
  const navigate = useNavigate();

  const handleStartChat = async (friendId: string) => {
    try {
      const { data } = await createConversation({
        variables: { participantIds: [friendId] },
      });
      navigate(`/conversations/${data.createConversation.id}`);
    } catch (err) {
      console.error("Error starting chat:", err);
    }
  };

  const handleRemoveFriend = async (friendId: string) => {
    try {
      const { data } = await removeFriend({ variables: { friendId } });
    } catch (err) {
      console.error("Error removing friend:", err);
    }
    navigate("/friends");
  };

  if (loading) return <div className="text-center">Loading friends...</div>;
  if (error)
    return <div className="text-center text-red-500">{handleError(error)}</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4 dark:text-white">Friends</h1>
      <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-4">
        {data.getFriendsList?.map((friend: User) => (
          <FriendCard
            key={friend.id}
            friend={friend}
            onChat={() => handleStartChat(friend.id)}
            onUnfriend={() => handleRemoveFriend(friend.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default Friends;
