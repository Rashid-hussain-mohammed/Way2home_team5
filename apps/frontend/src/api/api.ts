// src/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000', // Your Express backend URL
  timeout: 5000,
});

export {api};
