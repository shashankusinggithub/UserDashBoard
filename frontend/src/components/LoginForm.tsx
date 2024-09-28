import React from "react";
import { useMutation } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import { LOGIN } from "../graphql/mutations";
import { useAuth } from "../hooks/useAuth";
import { useForm } from "../hooks/useForm";
import GoogleSignInButton from "./GoogleSignInButton";

const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { values, handleChange } = useForm({ email: "", password: "" });
  const [loginMutation, { loading, error }] = useMutation(LOGIN);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await loginMutation({ variables: values });
      login(data.login.token, data.login.user);
      navigate("/");
    } catch (err) {
      console.error("Login error:", err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto dark:text-white">
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
          className="w-full px-3 py-2 border rounded"
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
          className="w-full px-3 py-2 border rounded"
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
          className="bg-green-500 text-white px-4 py-2 rounded "
          onClick={() => navigate("/register")}
        >
          Register
        </button>
      </div>
    </form>
  );
};

export default LoginForm;
