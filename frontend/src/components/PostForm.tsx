import React, { useState } from "react";
import { ApolloError, useMutation } from "@apollo/client";
import { CREATE_POST } from "../graphql/mutations";
import { GET_POSTS } from "../graphql/queries";
import { useForm } from "../hooks/useForm";
import { CreatePostInput, PostMutationResult } from "../types";
import { handleError } from "../utils/error-handling";

const MAX_CONTENT_LENGTH = 500;

const PostForm: React.FC<{ showFriendsOnly: boolean }> = ({
  showFriendsOnly,
}) => {
  const { values, handleChange, resetForm } = useForm<CreatePostInput>({
    content: "",
  });
  const [createPost, { loading }] = useMutation<
    PostMutationResult,
    CreatePostInput
  >(CREATE_POST, {
    refetchQueries: [
      { query: GET_POSTS, variables: { friendsOnly: showFriendsOnly } },
    ],
    onCompleted: () => {
      resetForm();
      setCharCount(0);
    },
  });
  const [error, setError] = useState<string | null>(null);
  const [charCount, setCharCount] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (values.content.trim().length === 0) {
      setError("Post content cannot be empty.");
      return;
    }

    if (values.content.length > MAX_CONTENT_LENGTH) {
      setError(
        `Post content must be ${MAX_CONTENT_LENGTH} characters or less.`
      );
      return;
    }

    try {
      await createPost({ variables: values });
    } catch (err: any) {
      setError(handleError(err));
    }
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    handleChange(e);
    setCharCount(e.target.value.length);
  };

  return (
    <div className="w-full">
      <form
        onSubmit={handleSubmit}
        className="mb-8 bg-white dark:bg-gray-800 rounded-lg shadow p-6 max-w-5xl mx-auto"
      >
        <div className="mb-4">
          <textarea
            name="content"
            value={values.content}
            onChange={handleContentChange}
            placeholder="What's on your mind?"
            className="w-full p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
            rows={4}
            maxLength={MAX_CONTENT_LENGTH}
            required
          />
          <div className="flex justify-between items-center mt-2">
            <span
              className={`text-sm ${
                charCount > MAX_CONTENT_LENGTH
                  ? "text-red-500"
                  : "text-gray-500"
              }`}
            >
              {charCount}/{MAX_CONTENT_LENGTH}
            </span>
          </div>
        </div>
        {error && <div className="mb-4 text-red-500 text-sm">{error}</div>}
        <button
          type="submit"
          disabled={
            loading || charCount === 0 || charCount > MAX_CONTENT_LENGTH
          }
          className={`w-full bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold
          ${
            loading || charCount === 0 || charCount > MAX_CONTENT_LENGTH
              ? "opacity-50 cursor-not-allowed"
              : "hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Posting...
            </span>
          ) : (
            "Post"
          )}
        </button>
      </form>
    </div>
  );
};

export default PostForm;
