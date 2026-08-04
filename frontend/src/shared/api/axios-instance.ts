import axios from 'axios';
import { env } from '../config';

/**
 * Shared Axios instance for all API calls. Feature-specific request/response
 * interceptors (auth token attachment, refresh-on-401, error normalization)
 * will be added here as those features are implemented.
 */
export const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
  withCredentials: true,
});
