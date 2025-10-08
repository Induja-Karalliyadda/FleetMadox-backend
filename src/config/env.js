import 'dotenv/config';

export const env = {
port: process.env.PORT || 5000,
nodeEnv: process.env.NODE_ENV || 'development',
dbUrl: process.env.DATABASE_URL,
jwtSecret: process.env.JWT_SECRET || 'dev_secret',
jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d'
};