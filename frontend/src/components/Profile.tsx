import React from "react";
import { useQuery } from "@apollo/client";
import { gql } from "@apollo/client";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const { loading, error, data } = useQuery(gql`
    query GetProfile {
      me {
        id
        username
        email
        firstName
        lastName
        profilePicture
        bio
      }
    }
  `);
  const navigate = useNavigate();

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :(</p>;

  const { me } = data;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md dark:bg-gray-600 dark:text-white">
      <h1 className="text-3xl font-bold mb-4">Profile</h1>
      <img
        src={
          `data:image/jpeg;base64,${me.profilePicture}` ||
          "https://via.placeholder.com/150"
        }
        alt="Profile"
        className="w-32 h-32 rounded-full mb-4"
      />
      <p>
        <strong>Username:</strong> {me.username}
      </p>
      <p>
        <strong>Email:</strong> {me.email}
      </p>
      <p>
        <strong>Name:</strong> {me.firstName} {me.lastName}
      </p>
      <p>
        <strong>Bio:</strong> {me.bio}
      </p>
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded-md mt-6"
        onClick={() => navigate("/profile-edit")}
      >
        Edit Profile
      </button>
    </div>
  );
};

export default Profile;
