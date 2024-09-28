import React from "react";
import { useMutation } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import { REGISTER } from "../graphql/mutations";
import { useAuth } from "../hooks/useAuth";
import { useForm } from "../hooks/useForm";

const RegisterForm: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { values, handleChange } = useForm({
    username: "",
    email: "",
    password: "",
    firstName: "",
    lastName: "",
  });
  const [registerMutation, { loading, error }] = useMutation(REGISTER);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await registerMutation({ variables: values });
      login(data.register.token, data.register.user);
      navigate("/");
    } catch (err) {
      console.error("Registration error:", err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto dark:text-white">
      <h2 className="text-2xl font-bold mb-4">Register</h2>
      <div className="mb-4">
        <label htmlFor="username" className="block mb-2">
          Username
        </label>
        <input
          type="text"
          id="username"
          name="username"
          value={values.username}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border rounded text-black"
        />
      </div>
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
          className="w-full px-3 py-2 border rounded text-black "
        />
      </div>
      <div className="mb-4">
        <label htmlFor="firstName" className="block mb-2">
          First Name
        </label>
        <input
          type="text"
          id="firstName"
          name="firstName"
          value={values.firstName}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border rounded text-black"
        />
      </div>
      <div className="mb-4">
        <label htmlFor="lastName" className="block mb-2">
          Last Name
        </label>
        <input
          type="text"
          id="lastName"
          name="lastName"
          value={values.lastName}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border rounded text-black "
        />
      </div>
      {error && <p className="text-red-500 mb-4">{error.message}</p>}
      <button
        type="submit"
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        {loading ? "Registering..." : "Register"}
      </button>
    </form>
  );
};

export default RegisterForm;
