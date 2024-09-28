// src/components/FriendRequests.tsx

import React from "react";
import { useQuery, useMutation } from "@apollo/client";
import { GET_FRIEND_REQUESTS } from "../graphql/queries";
import {
  ACCEPT_FRIEND_REQUEST,
  REJECT_FRIEND_REQUEST,
} from "../graphql/mutations";
import { FriendRequest } from "../types";
import { handleError } from "../utils/error-handling";

const FriendRequests: React.FC = () => {
  const { loading, error, data, refetch } = useQuery(GET_FRIEND_REQUESTS);

  const [acceptFriendRequest] = useMutation(ACCEPT_FRIEND_REQUEST, {
    onCompleted: () => refetch(),
  });

  const [rejectFriendRequest] = useMutation(REJECT_FRIEND_REQUEST, {
    onCompleted: () => refetch(),
  });

  const handleAccept = async (requestId: string) => {
    try {
      await acceptFriendRequest({ variables: { requestId } });
    } catch (err) {
      console.error("Error accepting friend request:", err);
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      await rejectFriendRequest({ variables: { requestId } });
    } catch (err) {
      console.error("Error rejecting friend request:", err);
    }
  };

  if (loading) return <p>Loading friend requests...</p>;
  if (error) return <p className="text-red-500">{handleError(error)}</p>;

  const pendingRequests = data?.friendRequests.filter(
    (request: FriendRequest) => request.status === "PENDING"
  );

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Friend Requests</h2>
      {pendingRequests.length === 0 ? (
        <p>No pending friend requests.</p>
      ) : (
        <div className="space-y-4">
          {pendingRequests.map((request: FriendRequest) => (
            <div
              key={request.id}
              className="bg-white p-4 rounded-lg shadow-md flex justify-between items-center"
            >
              <div className="flex items-center">
                <img
                  src={request.sender.profilePicture || "/default-avatar.png"}
                  alt={`${request.sender.username}'s avatar`}
                  className="w-10 h-10 rounded-full mr-4"
                />
                <div>
                  <p className="font-bold">{request.sender.username}</p>
                  <p className="text-sm text-gray-500">
                    Sent{" "}
                    {new Date(parseInt(request.createdAt)).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div>
                <button
                  onClick={() => handleAccept(request.id)}
                  className="bg-green-500 text-white px-4 py-2 rounded mr-2"
                >
                  Accept
                </button>
                <button
                  onClick={() => handleReject(request.id)}
                  className="bg-red-500 text-white px-4 py-2 rounded"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FriendRequests;
