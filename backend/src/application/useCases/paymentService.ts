// src/services/paymentService.ts
import stripe from '../../config/stripeConfig'; // Adjust the import path as necessary
import { Stripe } from 'stripe';
import { HttpStatus } from '../../utils/httpStatus';


export class PaymentService {
    async createPaymentIntent(amount: number): Promise<Stripe.PaymentIntent> {
        try {
            const paymentIntent = await stripe.paymentIntents.create({
                amount, // Amount in the smallest currency unit (e.g., cents)
                currency: 'INR',
                payment_method_types: ['card'], // Specify payment method types
            });
            return paymentIntent;
        } catch (error: any) {
            throw new Error(`Payment processing failed: ${error.message}`);
        }
    }

    async createCheckoutSession(amount: number): Promise<Stripe.Checkout.Session> {
        try {
            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [{
                    price_data: {
                        currency: 'inr',
                        product_data: {
                            name: 'Booking Payment', // Customize as needed
                        },
                        unit_amount: amount, // Amount in cents
                    },
                    quantity: 1, // Adjust quantity if necessary
                }],
                mode: 'payment',
               success_url: `http://localhost:5173/booking-success`, // Update with your success URL
                cancel_url: 'https://localhost:5173/cancel', // Update with your cancel URL
            });
            return session;
        } catch (error: any) {
            throw new Error(`Failed to create checkout session: ${error.message}`);
        }
    }
}
