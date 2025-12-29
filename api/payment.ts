import axios from 'axios'

export const makePaymentReques = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
    headers:{
        Authorization: "bearer" + process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    }
})