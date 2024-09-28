import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import DarkModeToggle from "./DarkModeToggle";
const Header: React.FC = () => {
  const { user, logout } = useAuth();
  console.log(user);
  const { isAuthenticated } = useAuth();

  return (
    <header className=" p-4 dark:text-white bg-blue-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
        <div className="flex justify-between items-center py-6 md:justify-start md:space-x-10 text-white">
          <div className="flex justify-start lg:w-0 lg:flex-1">
            <DarkModeToggle />
          </div>
          <nav className="hidden md:flex space-x-10">
            <Link
              to="/"
              className="text-base font-medium text-gray-200 hover:text-gray-900"
            >
              Home
            </Link>
            <Link
              to="/profile"
              className="text-base font-medium text-gray-200 hover:text-gray-900"
            >
              Profile
            </Link>
            <Link
              to="/conversations"
              className="text-base font-medium text-gray-200 hover:text-gray-900"
            >
              Conversations
            </Link>
            {/* <Link
              to="/conversations"
              className="text-base font-medium text-gray-500 hover:text-gray-900"
            >
              Notifications
            </Link> */}
            <Link
              to="/friends"
              className="text-base font-medium text-gray-200 hover:text-gray-900"
            >
              Friends
            </Link>
            <Link
              to="/find-friends"
              className="text-base font-medium text-gray-200 hover:text-gray-900"
            >
              Find Friends
            </Link>
            <Link
              to="/friend-requests"
              className="text-base font-medium text-gray-200 hover:text-gray-900"
            >
              Friend Requests
            </Link>
          </nav>
          <div className="hidden md:flex items-center justify-end md:flex-1 lg:w-0">
            {user ? (
              <button
                onClick={logout}
                className="ml-8 whitespace-nowrap inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Logout
              </button>
            ) : (
              <Link
                to="/login"
                className="whitespace-nowrap text-base font-medium text-gray-100 bold hover:text-gray-900"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
