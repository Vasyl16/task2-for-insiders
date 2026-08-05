import type { AppEnv, DatabaseEnv, EmailEnv, JwtEnv, RedisEnv, ThrottleEnv } from './env';

export interface Configuration {
  app: AppEnv;
  database: DatabaseEnv;
  redis: RedisEnv;
  jwt: JwtEnv;
  throttle: ThrottleEnv;
  email: EmailEnv;
}

/**
 * Configuration factory consumed by ConfigModule.forRoot({ load: [configuration] }).
 * Values are validated separately by the Joi schema in validation.ts.
 */
export default (): Configuration => ({
  app: {
    nodeEnv: process.env.NODE_ENV ?? 'development',
    port: parseInt(process.env.PORT ?? '3000', 10),
    apiPrefix: process.env.API_PREFIX ?? 'api',
    corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  },
  database: {
    url: process.env.DATABASE_URL ?? '',
  },
  redis: {
    host: process.env.REDIS_HOST ?? 'localhost',
    port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
    password: process.env.REDIS_PASSWORD,
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET ?? '',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
    refreshSecret: process.env.JWT_REFRESH_SECRET ?? '',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
  },
  throttle: {
    ttl: parseInt(process.env.THROTTLE_TTL ?? '60', 10),
    limit: parseInt(process.env.THROTTLE_LIMIT ?? '100', 10),
  },
  email: {
    resendApiKey: process.env.RESEND_API_KEY || undefined,
    fromEmail: process.env.EMAIL_FROM ?? 'onboarding@resend.dev',
  },
});
