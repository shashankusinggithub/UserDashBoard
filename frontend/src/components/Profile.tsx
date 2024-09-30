import React, { useState } from "react";
import { useQuery } from "@apollo/client";
import { gql } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import TwoFactorSetup from "./TwoFactorSetup";
import { GET_USER_PROFILE } from "../graphql/queries";
import Disable2FA from "./Disable2FA";

const Profile = () => {
  const { loading, error, data } = useQuery(GET_USER_PROFILE);
  const [show2FA, setShow2FA] = useState(false);
  const navigate = useNavigate();

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :(</p>;

  const { me } = data;
  return (
    <div className="bg-white p-6 rounded-lg shadow-md dark:bg-gray-600 dark:text-white">
      <h1 className="text-3xl font-bold mb-4">Profile</h1>
      <img
        src={
          (me.profilePicture &&
            `data:image/jpeg;base64,${me.profilePicture}`) ||
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
      <p>
        <strong>2FA:</strong>{" "}
        {!me.twoFactorEnabled ? (
          <>
            <button
              onClick={() => setShow2FA((e) => !e)}
              className="bg-blue-500 text-white px-2 py-1 rounded-md mt-6 ms-2"
            >
              Enable
            </button>
            {show2FA && <TwoFactorSetup />}
          </>
        ) : (
          <>
            <button
              onClick={() => setShow2FA((e) => !e)}
              className="bg-red-500 text-white px-2 py-1 rounded-md mt-6 ms-2"
            >
              Disable
            </button>
            {show2FA && <Disable2FA />}
          </>
        )}
      </p>
    </div>
  );
};

export default Profile;
