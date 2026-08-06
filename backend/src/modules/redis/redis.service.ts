import { Inject, Injectable, Logger } from '@nestjs/common';
import type Redis from 'ioredis';
import { REDIS_CLIENT } from './redis.constants';

const SCAN_BATCH_SIZE = 200;

/**
 * Thin wrapper around the shared ioredis client, plus a JSON cache-aside
 * helper set for feature modules (see ProductsService/CategoriesService).
 *
 * Every method fails open: a Redis hiccup is logged and treated as a cache
 * miss/no-op rather than propagating, since caching must never be able to
 * break a request that would otherwise succeed against the database.
 */
@Injectable()
export class RedisService {
  private readonly logger = new Logger(RedisService.name);

  constructor(@Inject(REDIS_CLIENT) private readonly client: Redis) {}

  getClient(): Redis {
    return this.client;
  }

  async getJson<T>(key: string): Promise<T | null> {
    try {
      const raw = await this.client.get(key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch (error) {
      this.logger.warn(`Cache read failed for "${key}": ${(error as Error).message}`);
      return null;
    }
  }

  async setJson(key: string, value: unknown, ttlSeconds: number): Promise<void> {
    try {
      await this.client.set(key, JSON.stringify(value), 'EX', ttlSeconds);
    } catch (error) {
      this.logger.warn(`Cache write failed for "${key}": ${(error as Error).message}`);
    }
  }

  async del(...keys: string[]): Promise<void> {
    if (keys.length === 0) {
      return;
    }
    try {
      await this.client.del(...keys);
    } catch (error) {
      this.logger.warn(`Cache delete failed for [${keys.join(', ')}]: ${(error as Error).message}`);
    }
  }

  /**
   * Attempts to acquire a short-lived, auto-expiring mutex via `SET key val NX EX ttl` —
   * atomic, so two concurrent callers can never both believe they hold it. Returns true
   * if this call created the key (lock acquired), false if it already existed (held by
   * someone else) or Redis was unreachable.
   *
   * Unlike the cache-aside helpers above, this does NOT fail open: a Redis error is
   * treated as "lock not acquired" rather than a silent pass-through, because callers use
   * this for correctness (e.g. preventing duplicate checkouts), not just performance.
   */
  async acquireLock(key: string, ttlSeconds: number): Promise<boolean> {
    try {
      const result = await this.client.set(key, 'locked', 'EX', ttlSeconds, 'NX');
      return result === 'OK';
    } catch (error) {
      this.logger.warn(`Lock acquire failed for "${key}": ${(error as Error).message}`);
      return false;
    }
  }

  /** Releases a lock acquired via acquireLock(). Fails open (logs only) so a release-time hiccup can never wedge a request in its finally block. */
  async releaseLock(key: string): Promise<void> {
    await this.del(key);
  }

  /** Deletes every key matching a glob pattern (e.g. "products:list:*") via non-blocking SCAN. */
  async delByPattern(pattern: string): Promise<void> {
    try {
      const keys: string[] = [];
      let cursor = '0';
      do {
        const [nextCursor, found] = await this.client.scan(
          cursor,
          'MATCH',
          pattern,
          'COUNT',
          SCAN_BATCH_SIZE,
        );
        cursor = nextCursor;
        keys.push(...found);
      } while (cursor !== '0');

      if (keys.length > 0) {
        await this.client.del(...keys);
      }
    } catch (error) {
      this.logger.warn(`Cache pattern delete failed for "${pattern}": ${(error as Error).message}`);
    }
  }
}
