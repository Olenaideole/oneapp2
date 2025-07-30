import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@supabase/supabase-js"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
})

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get("stripe-signature")

    if (!signature) {
      return NextResponse.json({ error: "No signature" }, { status: 400 })
    }

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error("Webhook signature verification failed:", err)
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        console.log("Stripe session object:", session)

        console.log("Payment successful:", session.id)

        // Extract customer info
        const customerEmail = session.customer_email || session.customer_details?.email
        const customerName = session.customer_details?.name || "Valued Customer"
        const amountPaid = session.amount_total ? session.amount_total / 100 : 32

        if (!customerEmail) {
          console.error("No customer email found in session")
          break
        }


        // Save purchase to database
        try {
          const { error: insertError } = await supabase.from("purchases").insert({
            email: customerEmail,
            stripe_session_id: session.id,
            stripe_customer_id: session.customer as string,
            amount_paid: amountPaid,
            currency: session.currency || "usd",
            product: "one-app-per-day-guide",
            metadata: session.metadata,
            payment_status: "completed",
            created_at: new Date().toISOString(),
          })

          if (insertError) {
            console.error("Database insert error:", insertError)
          } else {
            console.log("Purchase saved to database for:", customerEmail)
          }
        } catch (dbError) {
          console.error("Database error:", dbError)
        }

        // Update quiz response if exists
        try {
          await supabase
            .from("quiz_responses")
            .update({
              purchased: true,
              purchase_date: new Date().toISOString(),
              stripe_session_id: session.id,
            })
            .eq("email", customerEmail)
        } catch (updateError) {
          console.error("Quiz response update error:", updateError)
        }

        break
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.log("Payment failed:", paymentIntent.id)

        // Log failed payment
        const customerEmail = paymentIntent.receipt_email
        if (customerEmail) {
          try {
            await supabase.from("purchases").insert({
              email: customerEmail,
              stripe_session_id: paymentIntent.id,
              amount_paid: paymentIntent.amount / 100,
              currency: paymentIntent.currency,
              product: "one-app-per-day-guide",
              payment_status: "failed",
              created_at: new Date().toISOString(),
            })
          } catch (dbError) {
            console.error("Failed payment logging error:", dbError)
          }
        }
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 })
  }
}
