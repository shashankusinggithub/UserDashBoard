import React, { useState } from "react";
import { useMutation } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import { LOGIN, VERIFY_TWO_FACTOR } from "../graphql/mutations";
import { useAuth } from "../hooks/useAuth";
import { useForm } from "../hooks/useForm";
import GoogleSignInButton from "./GoogleSignInButton";

const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const { values, handleChange } = useForm({
    email: "",
    password: "",
    twoFactorToken: "",
  });

  const [loginMutation, { loading, error }] = useMutation(LOGIN);
  const [verifyTwoFactor, { error: tokenError }] =
    useMutation(VERIFY_TWO_FACTOR);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await loginMutation({
        variables: { email: values.email, password: values.password },
      });
      login(data.login.token, data.login.user);
      navigate("/");
    } catch (err) {
      console.error("Login error:", err);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await loginMutation({
        variables: { email: values.email, password: values.password },
      });
      // login(data.login.token, data.login.user)
      if (data.login.requiresTwoFactor) {
        setShowTwoFactor(true);
      } else {
        login(data.login.token, data.login.user);
        navigate("/");
      }
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const handleVerifyTwoFactor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await verifyTwoFactor({
        variables: { email: values.email, token: values.twoFactorToken },
      });
      login(data.verifyTwoFactor.token, data.verifyTwoFactor.user);
      navigate("/");
    } catch (error) {
      console.error("Two-factor verification error:", error);
    }
  };

  if (showTwoFactor) {
    return (
      <form onSubmit={handleVerifyTwoFactor} className="max-w-md mx-auto mt-8">
        <h2 className="text-2xl font-bold mb-4">Two-Factor Authentication</h2>
        <input
          type="text"
          name="twoFactorToken"
          value={values.twoFactorToken}
          onChange={handleChange}
          placeholder="Enter token from authenticator app"
          className="w-full p-2 border rounded mb-2"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Verify
        </button>
        {tokenError && (
          <p className="text-red-500 mb-4">{tokenError.message}</p>
        )}
      </form>
    );
  }
  return (
    <form onSubmit={handleLogin} className="max-w-md mx-auto dark:text-white">
      <h2 className="text-2xl font-bold mb-4">Login</h2>
      <div className="mb-4">
        <label htmlFor="email" className="block mb-2">
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={values.email}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border rounded text-black"
        />
      </div>
      <div className="mb-4">
        <label htmlFor="password" className="block mb-2">
          Password
        </label>
        <input
          type="password"
          id="password"
          name="password"
          value={values.password}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border rounded text-black"
        />
      </div>
      {error && <p className="text-red-500 mb-4">{error.message}</p>}
      <div className="flex justify-between">
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
        <GoogleSignInButton />
        <button
          className="bg-green-500 text-white px-4 py-2 rounded"
          onClick={() => navigate("/register")}
        >
          Register
        </button>
      </div>
    </form>
  );
};

export default LoginForm;
