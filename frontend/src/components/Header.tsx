import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import DarkModeToggle from "./DarkModeToggle";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";
import { useQuery, useSubscription } from "@apollo/client";
import { GET_UNREAD_COUNTS } from "../graphql/queries";
import {
  NEW_NOTIFICATION_SUBSCRIPTION,
  NEW_FRIEND_REQUEST_SUBSCRIPTION,
  NEW_MESSAGE_SUBSCRIPTION,
} from "../graphql/subscriptions";

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const [unreadCounts, setUnreadCounts] = useState({
    notifications: 0,
    friendRequests: 0,
    messages: 0,
  });

  const { data: unreadData, refetch } = useQuery(GET_UNREAD_COUNTS);

  useEffect(() => {
    if (unreadData) {
      setUnreadCounts(unreadData.getUnreadCounts);
    }
  }, [unreadData]);

  useSubscription(NEW_NOTIFICATION_SUBSCRIPTION, {
    onData: () => {
      refetch();
    },
  });

  useSubscription(NEW_FRIEND_REQUEST_SUBSCRIPTION, {
    onData: () => {
      refetch();
    },
  });

  useSubscription(NEW_MESSAGE_SUBSCRIPTION, {
    onData: () => {
      refetch();
    },
  });

  const [isMenuOpen, setIsMenuOpen] = useState(false); // State for mobile menu

  return (
    <nav className="bg-white dark:bg-gray-900 fixed w-full z-20 top-0 start-0 border-b border-gray-200 dark:border-gray-600">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <LanguageSwitcher />
          <DarkModeToggle />
          <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">
            <Link to="/" className="dark:text-white text-2xl font-bold">
              Home
            </Link>
          </span>
        </div>
        <div className="flex md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse">
          {user ? (
            <button
              onClick={logout}
              className="hidden md:inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg"
            >
              {t("logout")}
            </button>
          ) : (
            <Link
              to="/login"
              className="hidden md:inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
            >
              {t("login")}
            </Link>
          )}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
            aria-controls="navbar-sticky"
            aria-expanded={isMenuOpen}
          >
            <span className="sr-only">Open main menu</span>
            <svg
              className="w-5 h-5"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 17 14"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M1 1h15M1 7h15M1 13h15"
              />
            </svg>
          </button>
        </div>
        <div
          className={`items-center justify-between hidden w-full md:flex md:w-auto md:order-1 ${
            isMenuOpen ? "hidden" : "block"
          }`}
          id="navbar-sticky"
        >
          {user && (
            <div className={`min-sm:hidden ${isMenuOpen ? "z-30" : "z-0"}`}>
              <ul className="flex flex-col p-4 md:p-0 mt-4 font-medium border border-gray-100 rounded-lg bg-gray-50 md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 md:bg-white dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700">
                <li>
                  <Link
                    to="/news-feed"
                    className="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700"
                  >
                    News Feed
                  </Link>
                </li>

                {user && user.role === "ADMIN" && (
                  <Link
                    to="/admin"
                    className="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700"
                  >
                    Admin
                  </Link>
                )}

                <li>
                  <Link
                    to="/profile"
                    className="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700"
                  >
                    {t("profile")}
                  </Link>
                </li>

                <li>
                  <Link
                    to="/find-friends"
                    className="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700"
                  >
                    Find Friends
                  </Link>
                </li>
                <Link to="/notifications" className="relative px-4 py-2">
                  Notifications
                  {unreadCounts.notifications > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                      {unreadCounts.notifications}
                    </span>
                  )}
                </Link>
                <Link to="/friend-requests" className="relative px-4 py-2">
                  Friend Requests
                  {unreadCounts.friendRequests > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                      {unreadCounts.friendRequests}
                    </span>
                  )}
                </Link>
                <Link to="/conversations" className="relative px-4 py-2">
                  Messages
                  {unreadCounts.messages > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                      {unreadCounts.messages}
                    </span>
                  )}
                </Link>
              </ul>
            </div>
          )}
        </div>
      </div>
      {/* Mobile menu links */}
      <div className="md:hidden">
        {isMenuOpen && (
          <nav className="flex flex-col space-y-2 p-4 bg-gray-500">
            {user ? ( // Show mobile links only if user is logged in
              <>
                <Link
                  to="/news-feed"
                  className="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
                  onClick={() => setIsMenuOpen(false)}
                >
                  News Feed
                </Link>
                {user && user.role === "ADMIN" && (
                  <Link
                    to="/admin"
                    className="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
                  >
                    Admin
                  </Link>
                )}
                <Link
                  to="/profile"
                  className="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t("profile")}
                </Link>
                <Link
                  to="/conversations"
                  className="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t("conversations")}
                </Link>
                <Link
                  to="/friends"
                  className="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t("friends")}
                </Link>
                <Link
                  to="/find-friends"
                  className="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Find Friends
                </Link>
                <Link
                  to="/friend-requests"
                  className="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Friend Requests
                </Link>

                <button
                  onClick={logout}
                  className=" w-full items-center px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg"
                >
                  {t("logout")}
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="  wi-full  items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
              >
                {t("login")}
              </Link>
            )}
          </nav>
        )}
      </div>
    </nav>
  );
};

export default Header;
