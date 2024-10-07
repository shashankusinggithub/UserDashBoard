import React from "react";
import { ApolloProvider } from "@apollo/client";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { client } from "./utils/apollo-client";
import { Provider } from "mobx-react";
import { RootStore } from "./stores/RootStore";
import Header from "./components/Header";
import NewsFeed from "./components/NewsFeed";
import Profile from "./components/Profile";
import Conversations from "./components/Conversations";
import Chat from "./components/Chat";
import Friends from "./components/Friends";
import Notifications from "./components/Notifications";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import FindFriends from "./components/FindFriends";
import FriendRequest from "./components/FriendRequest";
import ProfileEdit from "./components/ProfileEdit";
import { DarkModeProvider } from "./context/DarkModeContext";
import "./styles/global.css";
import { GoogleOAuthProvider } from "@react-oauth/google";
import AdminPanel from "./components/AdminPanel";
import TwoFactorSetup from "./components/TwoFactorSetup";
import Dashboard from "./components/Dashboard";
import ChatWindows from "./components/ChatWindows";

const rootStore = RootStore.create();
const App: React.FC = () => {
  return (
    <ApolloProvider client={client}>
      <GoogleOAuthProvider
        clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID || ""}
      >
        <Provider rootStore={rootStore}>
          <AuthProvider client={client}>
            <DarkModeProvider>
              <Router>
                <div className="min-h-screen dark:bg-gray-800 bg-gray-100 dark:text-grey overflow-y-auto">
                  <Header />
                  <main className="container dark:bg-gray-800 bg-gray-100 mx-auto mt-16 p-4">
                    <Routes>
                      <Route path="/news-feed" element={<NewsFeed />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/profile/:id" element={<Profile />} />
                      <Route
                        path="/conversations"
                        element={<Conversations />}
                      />
                      <Route path="/conversations/:id" element={<Chat />} />
                      <Route path="/friends" element={<Friends />} />
                      <Route
                        path="/notifications"
                        element={<Notifications />}
                      />
                      <Route path="/login" element={<LoginForm />} />
                      <Route path="/register" element={<RegisterForm />} />
                      <Route path="/find-friends" element={<FindFriends />} />
                      <Route path="/admin" element={<AdminPanel />} />
                      <Route path="/" element={<Dashboard />} />
                      <Route
                        path="/two-factor-setup"
                        element={<TwoFactorSetup />}
                      />
                      <Route
                        path="/friend-requests"
                        element={<FriendRequest />}
                      />
                      <Route path="/profile-edit" element={<ProfileEdit />} />
                    </Routes>
                  </main>
                  <ChatWindows />
                </div>
              </Router>
            </DarkModeProvider>
          </AuthProvider>
        </Provider>
      </GoogleOAuthProvider>
    </ApolloProvider>
  );
};

export default App;
