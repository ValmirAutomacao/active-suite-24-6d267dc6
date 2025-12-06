import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  try {
    logStep("Webhook received");

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      logStep("No signature found");
      return new Response("No signature", { status: 400 });
    }

    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    
    let event: Stripe.Event;
    
    if (webhookSecret) {
      try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
        logStep("Event verified with signature", { type: event.type });
      } catch (err) {
        logStep("Signature verification failed", { error: err.message });
        return new Response(`Webhook signature verification failed: ${err.message}`, { status: 400 });
      }
    } else {
      // Fallback for testing without webhook secret
      event = JSON.parse(body);
      logStep("Event parsed without signature verification", { type: event.type });
    }

    // Handle checkout.session.completed event
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      logStep("Checkout session completed", { 
        sessionId: session.id, 
        paymentStatus: session.payment_status,
        metadata: session.metadata 
      });

      if (session.payment_status === "paid" && session.metadata?.payment_id) {
        const paymentId = session.metadata.payment_id;
        
        const { data, error } = await supabaseClient
          .from('payments')
          .update({ 
            status: 'paid',
            paid_date: new Date().toISOString().split('T')[0],
            updated_at: new Date().toISOString()
          })
          .eq('id', paymentId)
          .select()
          .single();

        if (error) {
          logStep("Error updating payment", { error: error.message, paymentId });
        } else {
          logStep("Payment updated successfully", { paymentId, data });
        }
      }
    }

    // Handle payment_intent.succeeded event
    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      logStep("Payment intent succeeded", { 
        paymentIntentId: paymentIntent.id,
        metadata: paymentIntent.metadata 
      });

      if (paymentIntent.metadata?.payment_id) {
        const paymentId = paymentIntent.metadata.payment_id;
        
        const { error } = await supabaseClient
          .from('payments')
          .update({ 
            status: 'paid',
            paid_date: new Date().toISOString().split('T')[0],
            updated_at: new Date().toISOString()
          })
          .eq('id', paymentId);

        if (error) {
          logStep("Error updating payment from payment_intent", { error: error.message });
        } else {
          logStep("Payment updated from payment_intent", { paymentId });
        }
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});
