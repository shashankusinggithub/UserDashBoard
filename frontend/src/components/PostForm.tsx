import React from "react";
import { useMutation } from "@apollo/client";
import { CREATE_POST } from "../graphql/mutations";
import { GET_POSTS } from "../graphql/queries";
import { useForm } from "../hooks/useForm";
import { CreatePostInput, PostMutationResult } from "../types";
import { handleError } from "../utils/error-handling";

const PostForm: React.FC = () => {
  const { values, handleChange, resetForm } = useForm<CreatePostInput>({
    content: "",
  });
  const [createPost, { loading, error }] = useMutation<
    PostMutationResult,
    CreatePostInput
  >(CREATE_POST, {
    refetchQueries: [{ query: GET_POSTS }],
    onCompleted: () => {
      resetForm();
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createPost({ variables: values });
    } catch (err) {
      console.error("Error creating post:", err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <textarea
        name="content"
        value={values.content}
        onChange={handleChange}
        placeholder="What's on your mind?"
        className="w-full p-2 border rounded"
        required
      />
      {error && <p className="text-red-500 mt-2">{handleError(error)}</p>}
      <button
        type="submit"
        disabled={loading}
        className="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
      >
        {loading ? "Posting..." : "Post"}
      </button>
    </form>
  );
};

export default PostForm;
