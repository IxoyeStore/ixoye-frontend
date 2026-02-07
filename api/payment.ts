import axios from "axios";

export const makePaymentReques = axios.create({
  baseURL: "https://ixoye-backend-production.up.railway.app",
  headers: {
    "Content-Type": "application/json",
  },
});
