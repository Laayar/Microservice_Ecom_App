import {config} from 'dotenv';
config({path: `.env.${process.env.NODE_ENV || 'development'}.local`});

export const {
    PORT, NODE_ENV, DB_URI, JWT_SECRET, JWT_EXPIRES_IN, ARCJET_ENV} = process.env;

export const ARCJET_KEY = process.env.ARCJET_KEY || process.env.ARCJET_API_KEY;