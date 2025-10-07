import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

/**
 * Create a new JWT token
 */
export function signJWT(payload) {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
}

/**
 * Verify and decode a JWT token
 */
export function verifyJWT(token) {
  return jwt.verify(token, env.jwtSecret);
}
