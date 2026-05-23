import 'dotenv/config';

export default {
  schema: './src/models/user.model.js',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
};