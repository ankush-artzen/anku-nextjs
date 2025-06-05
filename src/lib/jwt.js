import jwt from 'jsonwebtoken';
import crypto from "crypto";

const SECRET = process.env.JWT_SECRET ;

export const createToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email },    // payload with id and email
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

export function encryptToken(data) {
  const cipher = crypto.createCipher("aes-256-cbc", SECRET);
  let encrypted = cipher.update(data, "utf8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
}

export function decryptToken(encrypted) {
  try {
    const decipher = crypto.createDecipher("aes-256-cbc", SECRET);
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch {
    return null;
  }
}
