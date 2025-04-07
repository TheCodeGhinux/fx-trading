import { registerAs } from '@nestjs/config';
export default registerAs('auth', () => ({
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiry: process.env.JWT_TIMEFRAME,
  googleClientId: process.env.GOOGLE_CLIENT_ID,
}));
