// frontend/src/components/Disable2FA.tsx

import React, { useState } from "react";
import { useMutation } from "@apollo/client";
import { DISABLE_TWO_FACTOR } from "../graphql/mutations";
import { useNavigate } from "react-router-dom";

const Disable2FA: React.FC = () => {
  const [password, setPassword] = useState("");
  const [disableTwoFactor, { loading, error }] =
    useMutation(DISABLE_TWO_FACTOR);
  const navigate = useNavigate();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await disableTwoFactor({ variables: { password } });
      if (data.disableTwoFactor) {
        alert("Two-factor authentication has been disabled.");
        setPassword("");
        navigate("/profile");
      }
    } catch (err) {
      console.error("Error disabling 2FA:", err);
    }
  };

  return (
    <div className="max-w-md  mt-8">
      <h2 className="text-2xl font-bold mb-4">
        Disable Two-Factor Authentication
      </h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="password" className="block mb-2">
            Confirm your password:
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full p-2 border rounded text-black"
          />
        </div>
        {error && <p className="text-red-500 mb-4">{error.message}</p>}
        <button
          type="submit"
          disabled={loading}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          {loading ? "Disabling..." : "Disable 2FA"}
        </button>
      </form>
    </div>
  );
};

export default Disable2FA;
