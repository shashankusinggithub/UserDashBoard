import speakeasy from "speakeasy";
import qrcode from "qrcode";

export const generateSecret = async (email: string) => {
  const secret = speakeasy.generateSecret({
    name: `YourApp:${email}`,
  });

  const otpauthUrl = secret.otpauth_url;
  const qrCodeUrl = await qrcode.toDataURL(otpauthUrl);

  return {
    secret: secret.base32,
    otpauthUrl: qrCodeUrl,
  };
};

export const verifyToken = (secret: string, token: string) => {
  return speakeasy.totp.verify({
    secret,
    encoding: "base32",
    token,
  });
};
