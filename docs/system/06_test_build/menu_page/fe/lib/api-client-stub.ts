// P-SYSTEST reference build — stand-in for fe/src/lib/api-client.ts (out of scope here).
// Production: ONE axios instance; request interceptor attaches Bearer token from useAuthStore;
// response interceptor handles 401 (guest → /menu, QR context → /menu, staff → refresh→retry
// once → else /login). Every component imports { api } from it — never fetch directly.
import axios from 'axios'

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080/api/v1',
})
