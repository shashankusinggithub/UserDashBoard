import React, { useEffect, useState } from "react";
import { useQuery, useSubscription } from "@apollo/client";
import { GET_POSTS } from "../graphql/queries";
import PostForm from "./PostForm";
import { Post } from "../types";
import { handleError } from "../utils/error-handling";
import PostCard from "./PostCard";
import Dashboard from "./Dashboard";
import { NEW_POST_SUBSCRIPTION } from "../graphql/subscriptions";

const NewsFeed: React.FC = () => {
  const [showFriendsOnly, setShowFriendsOnly] = useState(false);
  const { loading, error, data, subscribeToMore, refetch } = useQuery(
    GET_POSTS,
    { variables: { friendsOnly: showFriendsOnly }, fetchPolicy: "network-only" }
  );

  useEffect(() => {
    const unsubscribe = subscribeToMore({
      document: NEW_POST_SUBSCRIPTION,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev;
        const newPost = subscriptionData.data.newPost;
        return {
          ...prev,
          posts: [newPost, ...prev.posts],
        };
      },
      onError: (error) => {
        console.error("Subscription error:", error);
      },
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [subscribeToMore]);

  useEffect(() => {
    refetch({ friendsOnly: showFriendsOnly });
  }, [showFriendsOnly]);

  const toggleFeed = () => {
    setShowFriendsOnly(!showFriendsOnly);
  };

  if (loading) return <div>Loading posts...</div>;
  if (error)
    return <div className="text-center text-red-500">{handleError(error)}</div>;

  return (
    <div className="dark:bg-gray-800 bg-gray-100 ">
      <div className="flex  items-center  justify-between mt-12 mb-10">
        <h1 className="text-3xl font-bold  dark:text-white ">News Feed</h1>
        <label>
          <input
            id="one"
            type="checkbox"
            checked={showFriendsOnly}
            onChange={toggleFeed}
          />
          Only Friend's Posts
        </label>
      </div>
      <PostForm showFriendsOnly={showFriendsOnly} />
      <div className="max-w-4xl mx-auto">
        {data.posts.map((post: Post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
};

export default NewsFeed;
