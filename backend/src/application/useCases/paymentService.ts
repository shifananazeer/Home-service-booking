// src/services/paymentService.ts
import stripe from '../../config/stripeConfig'; // Adjust the import path as necessary
import { Stripe } from 'stripe';
import { HttpStatus } from '../../utils/httpStatus';


export class PaymentService {
    async createPaymentIntent(amount: number): Promise<Stripe.PaymentIntent> {
        try {
            const paymentIntent = await stripe.paymentIntents.create({
                amount,
                currency: 'INR',
                payment_method_types: ['card'], 
            });
            return paymentIntent;
        } catch (error: any) {
            throw new Error(`Payment processing failed: ${error.message}`);
        }
    }

    async createCheckoutSession(
        amount: number, 
        bookingId: string, 
        paymentType: string, 
        successUrl: string
    ): Promise<Stripe.Checkout.Session> {
        
        const clientUrl = process.env.CLIENT_URL; 
    
        if (!clientUrl) {
            throw new Error("CLIENT_URL is not defined in the environment variables");
        }
    
        try {
            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [{
                    price_data: {
                        currency: 'inr',
                        product_data: {
                            name: 'Booking Payment', 
                        },
                        unit_amount: amount, 
                    },
                    quantity: 1, 
                }],
                mode: 'payment',
                success_url:successUrl, 
                cancel_url: `${clientUrl}/cancel`, // Use the stored clientUrl
            });
    
            return session;
        } catch (error: any) {
            throw new Error(`Failed to create checkout session: ${error.message}`);
        }
    }
    
}
