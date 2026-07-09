import Stripe from "stripe";
import { serverEnv } from "./env";

let client: Stripe | undefined;

export function getStripeClient() {
  if (!client) {
    client = new Stripe(serverEnv.stripeSecretKey);
  }
  return client;
}
