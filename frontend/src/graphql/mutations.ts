import { gql } from "@apollo/client";

export const LOGIN = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        id
        username
        email
      }
    }
  }
`;

export const REGISTER = gql`
  mutation Register(
    $username: String!
    $email: String!
    $password: String!
    $firstName: String!
    $lastName: String!
  ) {
    register(
      username: $username
      email: $email
      password: $password
      firstName: $firstName
      lastName: $lastName
    ) {
      token
      user {
        id
        username
        email
      }
    }
  }
`;

export const SEND_MESSAGE = gql`
  mutation SendMessage($conversationId: ID!, $content: String!) {
    sendMessage(conversationId: $conversationId, content: $content) {
      id
      content
      sender {
        username
      }
      createdAt
    }
  }
`;

export const CREATE_OR_GET_CONVERSATION = gql`
  mutation createConversation($participantIds: [ID!]!) {
    createConversation(participantIds: $participantIds) {
      id
      participants {
        id
      }
    }
  }
`;

export const CREATE_POST = gql`
  mutation CreatePost($content: String!) {
    createPost(content: $content) {
      id
      content
      author {
        username
      }
      createdAt
      likes {
        user {
          id
          username
        }
      }
    }
  }
`;

export const SEND_FRIEND_REQUEST = gql`
  mutation SendFriendRequest($receiverId: ID!) {
    sendFriendRequest(receiverId: $receiverId) {
      id
      sender {
        id
        username
      }
      receiver {
        id
        username
      }
      status
    }
  }
`;

export const ACCEPT_FRIEND_REQUEST = gql`
  mutation AcceptFriendRequest($requestId: ID!) {
    respondToFriendRequest(requestId: $requestId, accept: true) {
      id
      status
    }
  }
`;

export const REJECT_FRIEND_REQUEST = gql`
  mutation respondToFriendRequest($requestId: ID!) {
    rejectFriendRequest(requestId: $requestId, accept: false) {
      id
      status
    }
  }
`;

export const UPDATE_PROFILE = gql`
  mutation UpdateProfile(
    $firstName: String!
    $lastName: String!
    $bio: String!
  ) {
    updateProfile(firstName: $firstName, lastName: $lastName, bio: $bio) {
      id
      username
      email
      firstName
      lastName
      bio
    }
  }
`;

export const UPDATE_PROFILE_PICTURE = gql`
  mutation UpdateProfilePicture($base64Image: String!) {
    updateProfilePicture(base64Image: $base64Image) {
      id
      profilePicture
    }
  }
`;

export const MARK_NOTIFICATION_AS_READ = gql`
  mutation MarkNotificationAsRead($id: ID!) {
    markNotificationAsRead(id: $id) {
      id
      read
    }
  }
`;

export const GOOGLE_SIGN_IN = gql`
  mutation GoogleSignIn($accessToken: String!) {
    googleSignIn(accessToken: $accessToken) {
      token
      user {
        id
        username
        email
      }
    }
  }
`;
