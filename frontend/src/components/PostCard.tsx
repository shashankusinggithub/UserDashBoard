// src/components/PostCard.tsx

import React from "react";
import { useMutation } from "@apollo/client";
import { Post } from "../types";
import { formatDistanceToNow } from "date-fns";
import Avatar from "../assests/default-avatar.png";

interface PostCardProps {
  post: Post;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  return (
    <div className="bg-white shadow rounded-lg p-6 mb-6 dark:bg-gray-400">
      <div className="flex items-center mb-4">
        <img
          src={
            (post.author.profilePicture &&
              `data:image/jpeg;base64,${post.author.profilePicture}`) ||
            Avatar
          }
          alt={post.author.username}
          className="w-10 h-10 rounded-full mr-4"
        />
        <div>
          <p className="font-semibold">{post.author.username}</p>
          <p className="text-gray-500 text-sm">
            {formatDistanceToNow(new Date(parseInt(post.createdAt)), {
              addSuffix: true,
            })}
          </p>
        </div>
      </div>
      <p className="mb-4">{post.content}</p>
      {/* <div className="flex items-center">
        <button
          className={`flex items-center ${
            post.isLiked ? "text-blue-500" : "text-gray-500"
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-1"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
              clipRule="evenodd"
            />
          </svg>
          {post.likes.length} {post.likes.length === 1 ? "Like" : "Likes"}
        </button>
      </div> */}
    </div>
  );
};

export default PostCard;
