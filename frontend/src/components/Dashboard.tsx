// frontend/src/components/Dashboard.tsx

import React from "react";
import { useQuery } from "@apollo/client";
import { GET_USER_ANALYTICS, GET_FRIENDS_LIST } from "../graphql/queries";
import { format } from "date-fns";
import { User } from "../types";
import Image from "../assests/default-avatar.png";
import { useTranslation } from "react-i18next";
import Friends from "./Friends";
import FindFriends from "./FindFriends";

const Dashboard: React.FC = () => {
  const {
    loading: analyticsLoading,
    error: analyticsError,
    data: analyticsData,
  } = useQuery(GET_USER_ANALYTICS);
  const {
    loading: friendsLoading,
    error: friendsError,
    data: friendsData,
  } = useQuery(GET_FRIENDS_LIST);
  const { t } = useTranslation();

  if (analyticsLoading || friendsLoading) return <p>Loading...</p>;
  if (analyticsError)
    return <p>Error loading analytics: {analyticsError.message}</p>;
  if (friendsError)
    return <p>Error loading friends list: {friendsError.message}</p>;

  const { lastLoginTime, totalFriends, totalPosts, totalLikes, fullname } =
    analyticsData.getUserAnalytics;
  return (
    <div className="my-8 w-full">
      <div className="flex justify-between">
        <h1 className="text-3xl font-bold mb-6 dark:text-white">
          {t("dashboard")}
        </h1>
        <h2 className="dark:text-white mb-6 text-xl ">
          {t("welcome")} {fullname}{" "}
        </h2>
      </div>
      <div className="mx-auto max-w-4xl">
        <div className="bg-white shadow rounded-lg  p-6 mb-6 ">
          <h2 className="text-xl font-semibold mb-4">Analytics</h2>
          <p>Last Login: {format(new Date(lastLoginTime), "PPpp")}</p>
          <p>Total Friends: {totalFriends}</p>
          <p>Total Posts: {totalPosts}</p>
          <p>Total Likes: {totalLikes}</p>
        </div>

        <div className="bg-white shadow rounded-lg p-6 mb-6 max-h-[calc(100vh-25rem)] ">
          <FindFriends />
        </div>
        <div className="bg-white shadow rounded-lg p-6 ">
          <Friends />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
