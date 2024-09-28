import React, { useState } from "react";
import { useLazyQuery, useMutation } from "@apollo/client";
import { SEARCH_USERS } from "../graphql/queries";
import { SEND_FRIEND_REQUEST } from "../graphql/mutations";
import {
  SearchUsersQueryResult,
  SendFriendRequestMutationResult,
  User,
} from "../types";
import { useForm } from "../hooks/useForm";
import { handleError } from "../utils/error-handling";

const FindFriends: React.FC = () => {
  const { values, handleChange, resetForm } = useForm({ searchTerm: "" });
  const [
    searchUsers,
    { loading: searchLoading, error: searchError, data: searchData },
  ] = useLazyQuery<SearchUsersQueryResult>(SEARCH_USERS);
  const [sendFriendRequest, { loading: sendLoading, error: sendError }] =
    useMutation<SendFriendRequestMutationResult>(SEND_FRIEND_REQUEST);
  const [sentRequests, setSentRequests] = useState<Set<string>>(new Set());

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchUsers({ variables: values });
    console.log(searchData);
  };

  const handleSendFriendRequest = async (userId: string) => {
    try {
      await sendFriendRequest({ variables: { receiverId: userId } });
      setSentRequests((prev) => new Set(prev).add(userId));
    } catch (err) {
      console.error("Error sending friend request:", err);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 dark:text-white">Find Friends</h2>
      <form onSubmit={(e) => handleSearch(e)} className="mb-4">
        <input
          type="text"
          name="searchTerm"
          value={values.searchTerm}
          onChange={handleChange}
          placeholder="Search for users..."
          className="w-full px-3 py-2 border rounded"
          required
        />
        <button
          type="submit"
          disabled={searchLoading}
          className="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
        >
          {searchLoading ? "Searching..." : "Search"}
        </button>
      </form>
      {searchError && (
        <p className="text-red-500 mb-4">{handleError(searchError)}</p>
      )}
      {sendError && (
        <p className="text-red-500 mb-4">{handleError(sendError)}</p>
      )}
      {searchData && searchData.users?.length > 0 ? (
        <div className="space-y-4">
          {searchData.users.map((user: User) => (
            <div
              key={user.id}
              className="bg-white p-4 rounded-lg shadow-md flex justify-between items-center"
            >
              <div>
                <p className="font-bold">{user.username}</p>
                <p>
                  {user.firstName} {user.lastName}
                </p>
              </div>
              {!user.isFriend && !sentRequests.has(user.id) && (
                <button
                  onClick={() => handleSendFriendRequest(user.id)}
                  disabled={sendLoading}
                  className="bg-green-500 text-white px-4 py-2 rounded"
                >
                  Send Friend Request
                </button>
              )}
              {sentRequests.has(user.id) && (
                <span className="text-green-500">Friend Request Sent</span>
              )}
            </div>
          ))}
        </div>
      ) : searchData ? (
        <p>No users found.</p>
      ) : null}
    </div>
  );
};

export default FindFriends;
