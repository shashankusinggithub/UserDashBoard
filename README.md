# GraphQL API Documentation

## Execute the following command to start the development server

```bash
bash ./docker-run.sh
```

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Rate Limiting](#rate-limiting)
4. [Core Resolvers](#core-resolvers)
   - [User Resolver](#user-resolver)
   - [Post Resolver](#post-resolver)
   - [Message Resolver](#message-resolver)
   - [Friend Request Resolver](#friend-request-resolver)
   - [Notification Resolver](#notification-resolver)
5. [Utility Functions](#utility-functions)
6. [Database Schema](#database-schema)
7. [Error Handling](#error-handling)

## Overview

This GraphQL API provides functionality for a social networking application. It includes features such as user authentication, post creation and interaction, messaging, friend requests, and notifications. The API is built with Node.js, Express, Apollo Server, Prisma ORM, and uses Redis for rate limiting and caching.

## Authentication

Authentication is handled using JSON Web Tokens (JWT).

### Login

- Mutation: `login(email: String!, password: String!): AuthPayload!`
- Returns an `AuthPayload` containing a JWT token and user information.

### Register

- Mutation: `register(username: String!, email: String!, password: String!, firstName: String!, lastName: String!): AuthPayload!`
- Creates a new user account and returns an `AuthPayload`.

### Authentication Middleware

- Extracts the JWT from the Authorization header.
- Verifies the token and attaches the user to the context.

## Rate Limiting

Rate limiting is implemented globally for all API calls using Redis.

### Rate Limiter Function

- Located in `src/utils/rateLimiter.ts`
- Limits based on both IP address and user ID (if authenticated).
- Default global limit: 100 requests per minute.

### Application to Resolvers

- Applied automatically to all resolvers in `src/resolvers/index.ts`
- Can be customized for specific resolvers if needed.

## Core Resolvers

### User Resolver

#### Queries

- `me: User`: Returns the current authenticated user.
- `user(id: ID!): User`: Returns a user by ID.
- `users(searchTerm: String): [User]`: Searches for users.

#### Mutations

- `updateProfile(profilePicture: String, firstName: String, lastName: String): User`: Updates user profile.

### Post Resolver

#### Queries

- `posts: [Post!]!`: Returns all posts.
- `post(id: ID!): Post`: Returns a specific post by ID.

#### Mutations

- `createPost(content: String!, imageUrl: String): Post!`: Creates a new post.

### Message Resolver

#### Queries

- `messages(userId: ID!): [Message!]!`: Returns messages between the current user and another user.

#### Mutations

- `sendMessage(receiverId: ID!, content: String!): Message!`: Sends a message to another user.

#### Subscriptions

- `newMessage(userId: ID!): Message!`: Real-time updates for new messages.

### Friend Request Resolver

#### Queries

- `friendRequests: [FriendRequest!]!`: Returns pending friend requests for the current user.

#### Mutations

- `sendFriendRequest(receiverId: ID!): FriendRequest!`: Sends a friend request.
- `respondToFriendRequest(requestId: ID!, accept: Boolean!): FriendRequest!`: Accepts or rejects a friend request.

#### Subscriptions

- `newFriendRequest: FriendRequest!`: Real-time updates for new friend requests.

### Notification Resolver

## Utility Functions

### Apply Rate Limiter

- Function: `applyRateLimiter(resolver, options)`
- Located in `src/utils/applyRateLimiter.ts`
- Wraps a resolver with rate limiting logic.

### Create Rate Limiter

- Function: `createRateLimiter(options)`
- Located in `src/utils/rateLimiter.ts`
- Creates a rate limiter function based on provided options.

## Database Schema

The database schema is defined using Prisma and includes the following main models:

- User
- Post
- Comment
- Like
- FriendRequest
- Message

Refer to the `prisma/schema.prisma` file for detailed schema information.

## Error Handling

- Authentication errors are thrown as `AuthenticationError`.
- Input validation errors are thrown as `UserInputError`.
- Other errors are caught and logged, returning a generic error message to the client.

For detailed error messages and codes, refer to the individual resolver implementations.

---

This documentation provides an overview of the main features and functions of the GraphQL API. For more detailed information about specific resolvers or functions, refer to the inline comments in the respective files.
