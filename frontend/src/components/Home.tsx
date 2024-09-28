import React from "react";
import { useQuery } from "@apollo/client";
import { GET_POSTS } from "../graphql/queries";
import PostForm from "./PostForm";
import { Post } from "../types";
import { handleError } from "../utils/error-handling";
import PostCard from "./PostCard";

const Home: React.FC = () => {
  const { loading, error, data } = useQuery(GET_POSTS);
  console.log(data);

  if (loading) return <div className="text-center">Loading posts...</div>;
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
