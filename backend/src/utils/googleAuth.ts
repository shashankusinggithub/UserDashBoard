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
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload) {
      throw new Error("Invalid Google token payload");
    }
    return {
      email: payload.email!,
      name: payload.name!,
      picture: payload.picture!,
    };
  } catch (error) {
    console.error("Error verifying Google token:", error);
    throw new Error("Invalid Google token");
  }
}

export function generateJwtToken(user: AppUser): string {
  return jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET!, {
    expiresIn: "1d",
  });
}
