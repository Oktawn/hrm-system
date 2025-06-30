import axios from "axios";

export const api = axios.create({
  baseURL: process.env.API_BASE_URL_BOT,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})