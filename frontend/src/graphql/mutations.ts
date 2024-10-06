import { gql } from "@apollo/client";

export const LOGIN = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        id
        username
        email
        role
      }
      requiresTwoFactor
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
        id
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
    respondToFriendRequest(requestId: $requestId, accept: false) {
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
export const UPDATE_USER_ROLE = gql`
  mutation UpdateUserRole($userId: ID!, $role: Role!) {
    updateUserRole(userId: $userId, role: $role) {
      id
      username
      role
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
        email
        role
      }
    }
  }
`;

export const REMOVE_FRIEND = gql`
  mutation RemoveFriend($friendId: ID!) {
    removeFriend(friendId: $friendId) {
      id
      username
    }
  }
`;

export const GENERATE_TWO_FACTOR_SECRET = gql`
  mutation GenerateTwoFactorSecret {
    generateTwoFactorSecret {
      secret
      otpauthUrl
    }
  }
`;

export const ENABLE_TWO_FACTOR = gql`
  mutation EnableTwoFactor($token: String!) {
    enableTwoFactor(token: $token)
  }
`;

export const DISABLE_TWO_FACTOR = gql`
  mutation DisableTwoFactor($password: String!) {
    disableTwoFactor(password: $password)
  }
`;

export const VERIFY_TWO_FACTOR = gql`
  mutation VerifyTwoFactor($email: String!, $token: String!) {
    verifyTwoFactor(email: $email, token: $token) {
      token
      user {
        id
        username
        email
      }
    }
  }
`;
