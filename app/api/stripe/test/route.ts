import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Use the actual live key
    const stripeKey =
      process.env.STRIPE_SECRET_KEY ||
      "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"

    if (!stripeKey || !stripeKey.startsWith("sk_")) {
      return NextResponse.json({
        success: false,
        error: "Invalid or missing Stripe key",
        keyPrefix: stripeKey ? stripeKey.substring(0, 10) + "..." : "Not found",
      })
    }

    const Stripe = (await import("stripe")).default
    const stripe = new Stripe(stripeKey, {
      apiVersion: "2024-12-18.acacia",
    })

    // Test the connection by retrieving account info
    const account = await stripe.accounts.retrieve()

    return NextResponse.json({
      success: true,
      message: "Stripe connection successful",
      accountId: account.id,
      keyType: stripeKey.startsWith("sk_live_") ? "Live" : "Test",
      keyPrefix: stripeKey.substring(0, 20) + "...",
    })
  } catch (error) {
    console.error("Stripe test error:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      details: "Check server logs for more information",
    })
  }
}
