import React, { useState, useRef } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { UPDATE_PROFILE, UPDATE_PROFILE_PICTURE } from "../graphql/mutations";
import { GET_USER_PROFILE } from "../graphql/queries";
import { useForm } from "../hooks/useForm";
import { handleError } from "../utils/error-handling";

const ProfileEdit: React.FC = () => {
  const { loading, error, data } = useQuery(GET_USER_PROFILE);
  const [updateProfile] = useMutation(UPDATE_PROFILE);
  const [updateProfilePicture] = useMutation(UPDATE_PROFILE_PICTURE);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [base64Image, setBase64Image] = useState<string | null>(null);

  const { values, handleChange, setValues } = useForm({
    firstName: "",
    lastName: "",
    bio: "",
  });
  React.useEffect(() => {
    if (data?.me) {
      setValues({
        firstName: data.me.firstName,
        lastName: data.me.lastName,
        bio: data.me.bio || "",
      });
      if (data.me.profilePicture) {
        setPreviewUrl(`data:image/jpeg;base64,${data.me.profilePicture}`);
      }
    }
  }, [data, setValues]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile({
        variables: values,
      });
      alert("Profile updated successfully!");
    } catch (err) {
      console.error("Error updating profile:", err);
      alert("Failed to update profile. Please try again.");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreviewUrl(result);
        setBase64Image(result.split(",")[1]); // Remove the data:image/jpeg;base64, part
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!base64Image) {
      alert("Please select an image to upload");
      return;
    }
    try {
      await updateProfilePicture({ variables: { base64Image } });
      alert("Profile picture updated successfully!");
    } catch (err) {
      console.error("Error updating profile picture:", err);
      alert("Failed to update profile picture. Please try again.");
    }
  };
  if (loading) return <div className="text-center">Loading profile...</div>;
  if (error)
    return <div className="text-center text-red-500">{handleError(error)}</div>;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Edit Profile</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="firstName" className="block mb-1">
            First Name
          </label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={values.firstName}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <div>
          <label htmlFor="lastName" className="block mb-1">
            Last Name
          </label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={values.lastName}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <div>
          <label htmlFor="bio" className="block mb-1">
            Bio
          </label>
          <textarea
            id="bio"
            name="bio"
            value={values.bio}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
            rows={4}
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Update Profile
        </button>
      </form>

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Update Profile Picture</h2>
        <div className="flex items-center space-x-4">
          <img
            src={previewUrl || data.me.profilePicture || "/default-avatar.png"}
            alt="Profile"
            className="w-32 h-32 rounded-full object-cover"
          />
          <div>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="mb-2"
            />
            <button
              onClick={handleUpload}
              className="bg-green-500 text-white px-4 py-2 rounded"
            >
              Upload New Picture
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileEdit;
