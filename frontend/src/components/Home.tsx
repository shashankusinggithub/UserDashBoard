import React, { useEffect } from "react";
import { useQuery, useSubscription } from "@apollo/client";
import { GET_POSTS, NEW_POST_SUBSCRIPTION } from "../graphql/queries";
import PostForm from "./PostForm";
import { Post } from "../types";
import { handleError } from "../utils/error-handling";
import PostCard from "./PostCard";

const Home: React.FC = () => {
  const { loading, error, data, subscribeToMore } = useQuery(GET_POSTS);

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

  if (loading) return <div>Loading posts...</div>;
  if (error)
    return <div className="text-center text-red-500">{handleError(error)}</div>;

  return (
    <div className="dark:bg-gray-800 bg-gray-100">
      <h1 className="text-3xl font-bold mb-4 dark:text-white">News Feed</h1>
      <PostForm />
      <div>
        {data.posts.map((post: Post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
};

export default Home;
