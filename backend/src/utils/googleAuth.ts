import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

interface GoogleUser {
  email: string;
  name: string;
  picture: string;
}

interface AppUser {
  id: string;
  email: string;
}

export async function verifyGoogleToken(token: string): Promise<GoogleUser> {
  try {
    const ticket = await client.getTokenInfo(token);
    if (!ticket || !ticket.email) {
      throw new Error("Invalid Google token");
    }
    return {
      email: ticket.email,
      name: ticket.email_verified ? ticket.email.split("@")[0] : "",
      picture: "",
    };
  } catch (error) {
    console.error("Error verifying Google token:", error);
    throw new Error("Invalid Google token");
  }
}

export function generateJwtToken(user: AppUser): string {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }
  return jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
}
