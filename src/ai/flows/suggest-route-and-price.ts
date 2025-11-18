'use server';
/**
 * @fileOverview This file defines a Genkit flow for suggesting optimal routes and prices to drivers based on passenger destinations.
 *
 * - suggestRouteAndPrice - A function that suggests an optimal route and price for a driver based on passenger destinations.
 * - SuggestRouteAndPriceInput - The input type for the suggestRouteAndPrice function.
 * - SuggestRouteAndPriceOutput - The return type for the suggestRouteAndPrice function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestRouteAndPriceInputSchema = z.object({
  driverCurrentLocation: z.string().describe('The current location of the driver.'),
  driverDestination: z.string().describe('The final destination of the driver.'),
  passengerPickupLocation: z.string().describe('The pickup location of the passenger.'),
  passengerDestination: z.string().describe('The desired destination of the passenger.'),
  currentFare: z.number().describe('The current fare the driver is charging.'),
  offeredFare: z.number().optional().describe('The fare offered by the passenger (optional).'),
});
export type SuggestRouteAndPriceInput = z.infer<typeof SuggestRouteAndPriceInputSchema>;

const SuggestRouteAndPriceOutputSchema = z.object({
  suggestedRoute: z.string().describe('The suggested route that optimizes for both driver and passenger destinations.'),
  suggestedPrice: z.number().describe('The suggested price that maximizes driver earnings while considering passenger offers.'),
  reasoning: z.string().describe('The reasoning behind the suggested route and price.'),
});
export type SuggestRouteAndPriceOutput = z.infer<typeof SuggestRouteAndPriceOutputSchema>;

export async function suggestRouteAndPrice(input: SuggestRouteAndPriceInput): Promise<SuggestRouteAndPriceOutput> {
  return suggestRouteAndPriceFlow(input);
}

const suggestRouteAndPricePrompt = ai.definePrompt({
  name: 'suggestRouteAndPricePrompt',
  input: {schema: SuggestRouteAndPriceInputSchema},
  output: {schema: SuggestRouteAndPriceOutputSchema},
  prompt: `You are an AI assistant designed to help AutoLink drivers maximize their earnings by suggesting optimal routes and prices when sharing rides with passengers.

  Given the following information, suggest the best route and price for the driver:

  Driver's Current Location: {{{driverCurrentLocation}}}
  Driver's Final Destination: {{{driverDestination}}}
  Passenger's Pickup Location: {{{passengerPickupLocation}}}
  Passenger's Desired Destination: {{{passengerDestination}}}
  Current Fare: {{{currentFare}}}
  Passenger's Offered Fare (if any): {{{offeredFare}}}

  Consider the distance, traffic, and time to reach both destinations.  If the passenger offered a fare, evaluate whether it is reasonable given the route and suggest a counter-offer if appropriate.  Remember the goal is to benefit the driver, but providing value to the passenger is important too.

  Format your response as follows:
  - Suggested Route: [Optimal route description]
  - Suggested Price: [Recommended price]
  - Reasoning: [Explanation of why this route and price are recommended]`,
});

const suggestRouteAndPriceFlow = ai.defineFlow(
  {
    name: 'suggestRouteAndPriceFlow',
    inputSchema: SuggestRouteAndPriceInputSchema,
    outputSchema: SuggestRouteAndPriceOutputSchema,
  },
  async input => {
    const {output} = await suggestRouteAndPricePrompt(input);
    return output!;
  }
);
