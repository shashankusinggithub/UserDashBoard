import React from "react";
import { useQuery, useMutation } from "@apollo/client";
import { GET_USERS_FOR_ADMIN } from "../graphql/queries";
import { UPDATE_USER_ROLE } from "../graphql/mutations";
import { User } from "../types";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

const AdminPanel: React.FC = () => {
  const { user } = useAuth();
  const naviagte = useNavigate();
  if (!user || user.role !== "ADMIN") {
    naviagte("/");
  }

  const { loading, error, data } = useQuery(GET_USERS_FOR_ADMIN);
  const [updateUserRole] = useMutation(UPDATE_USER_ROLE);
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const handleRoleChange = async (
    userId: string,
    newRole: "USER" | "ADMIN"
  ) => {
    try {
      await updateUserRole({
        variables: { userId, role: newRole },
        refetchQueries: [{ query: GET_USERS_FOR_ADMIN }],
      });
    } catch (err) {
      console.error("Error updating user role:", err);
    }
  };

  return (
    // <div className="overflow-x-auto sm:">
    <div className="max-w-4xl mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4 dark:text-white">Admin Panel</h2>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse ">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 text-left">Username</th>
              <th className="p-2 text-left">Email</th>
              <th className="p-2 text-left">Role</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className=" dark:text-white">
            {data.users.map((user: User) => (
              <tr key={user.id} className="border-b">
                <td className="p-2">{user.username}</td>
                <td className="p-2">{user.email}</td>
                <td className="p-2">{user.role}</td>
                <td className="p-2 ">
                  <select
                    value={user.role}
                    onChange={(e) =>
                      handleRoleChange(
                        user.id,
                        e.target.value as "USER" | "ADMIN"
                      )
                    }
                    className="p-1 border rounded dark:text-black"
                  >
                    <option value="USER">User</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminPanel;
