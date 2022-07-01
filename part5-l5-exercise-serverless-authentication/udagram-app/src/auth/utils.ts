import { decode } from 'jsonwebtoken';
import { JwtToken } from "./JwtToken";

export function getUserId(jwtToken: string) {
  const decodedJwt = decode(jwtToken) as JwtToken
  return decodedJwt.sub
}