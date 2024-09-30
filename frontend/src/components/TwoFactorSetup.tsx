// frontend/src/components/TwoFactorSetup.tsx

import React, { useState } from "react";
import { useMutation } from "@apollo/client";
import {
  GENERATE_TWO_FACTOR_SECRET,
  ENABLE_TWO_FACTOR,
} from "../graphql/mutations";
import { useNavigate } from "react-router-dom";

const TwoFactorSetup: React.FC = () => {
  const [secret, setSecret] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [token, setToken] = useState("");

  const [generateSecret] = useMutation(GENERATE_TWO_FACTOR_SECRET);
  const [enableTwoFactor] = useMutation(ENABLE_TWO_FACTOR);

  const navigate = useNavigate();
  const handleGenerateSecret = async () => {
    try {
      const { data } = await generateSecret();
      setSecret(data.generateTwoFactorSecret.secret);
      setQrCode(data.generateTwoFactorSecret.otpauthUrl);
    } catch (error) {
      console.error("Error generating 2FA secret:", error);
    }
  };

  const handleEnableTwoFactor = async () => {
    try {
      const { data } = await enableTwoFactor({ variables: { token } });
      if (data.enableTwoFactor) {
        alert("Two-factor authentication enabled successfully!");
      }
      navigate("/profile");
    } catch (error) {
      console.error("Error enabling 2FA:", error);
    }
  };
  return (
    <div className="max-w-md  mt-8">
      <h2 className="text-2xl font-bold mb-4">
        Set Up Two-Factor Authentication
      </h2>
      {!secret && (
        <button
          onClick={handleGenerateSecret}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Generate Secret
        </button>
      )}
      {secret && (
        <div>
          <p className="mb-2">Scan this QR code with your authenticator app:</p>
          <img src={qrCode} alt="QR Code" className="mb-4" />
          <p className="mb-2">Or enter this secret manually: {secret}</p>
          <input
            type="text"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Enter token from authenticator app"
            className="w-full p-2 border rounded mb-2"
          />
          <button
            onClick={handleEnableTwoFactor}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            Enable Two-Factor Authentication
          </button>
        </div>
      )}
    </div>
  );
};

export default TwoFactorSetup;
