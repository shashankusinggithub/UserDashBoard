import { gql } from "@apollo/client";

export const NEW_MESSAGE_SUBSCRIPTION = gql`
  subscription OnNewMessage($conversationId: ID!) {
    newMessage(conversationId: $conversationId) {
      id
      content
      sender {
        username
      }
      createdAt
    }
  }
`;

export const NEW_NOTIFICATION_SUBSCRIPTION = gql`
  subscription OnNewNotification {
    newNotification {
      id
      content
      createdAt
      read
      linkId
    }
  }
`;

export const NEW_POST_SUBSCRIPTION = gql`
  subscription OnNewPost {
    newPost {
      id
      content
      author {
        id
        username
      }
      createdAt
    }
  }
`;

export const NEW_FRIEND_REQUEST_SUBSCRIPTION = gql`
  subscription OnNewFriendRequest {
    newFriendRequest {
      id
      sender {
        id
        username
      }
    }
  }
`;
