import { type NextRequest, NextResponse } from "next/server"

// Initialize Stripe with the actual live keys
let stripe: any = null
let stripeError: string | null = null

function isPlaceholder(value: string | undefined): boolean {
  if (!value) return true

  const placeholders = [
    "your_stripe_secret_key",
    "your-stripe-secret-key",
    "stripe_secret_key",
    "STRIPE_SECRET_KEY",
    "sk_test_placeholder",
    "sk_live_placeholder",
  ]

  return placeholders.includes(value.toLowerCase().trim()) || value.length < 20
}

async function initializeStripe() {
  try {
    // Use the actual live key from environment or fallback to the provided key
    const stripeKey =
      process.env.STRIPE_SECRET_KEY ||
      "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"

    if (!stripeKey) {
      stripeError = "STRIPE_SECRET_KEY not configured"
      console.log("⚠️ Stripe not configured - payment processing unavailable")
      return
    }

    if (isPlaceholder(stripeKey)) {
      stripeError = "Stripe secret key is placeholder value"
      console.log("⚠️ Stripe secret key is placeholder - payment processing unavailable")
      // Do not return here in dev mode, allow the API to handle it
      if (process.env.NODE_ENV !== "development") {
        return
      }
    }

    if (!stripeKey.startsWith("sk_")) {
      stripeError = "Invalid Stripe secret key format (must start with sk_)"
      console.log("⚠️ Invalid Stripe secret key format")
      return
    }

    const Stripe = (await import("stripe")).default
    stripe = new Stripe(stripeKey, {
      apiVersion: "2024-12-18.acacia",
    })
    console.log("✅ Stripe initialized successfully with key:", stripeKey.substring(0, 20) + "...")
  } catch (error) {
    stripeError = `Stripe initialization failed: ${error}`
    console.log("⚠️ Stripe initialization error:", error)
  }
}

// Initialize on module load
initializeStripe()

export async function POST(request: NextRequest) {
  console.log("=== 💳 Stripe Checkout API Called ===")
  console.log("🔧 Stripe status:", stripe ? "✅ Available" : `⚠️ ${stripeError}`)

  try {
    // Force re-initialization if stripe is null but we have a key
    if (!stripe) {
      console.log("🔄 Attempting to re-initialize Stripe...")
      await initializeStripe()
    }

    // Check if Stripe is available
    if (!stripe) {
      console.log("❌ Stripe still not available after re-initialization")
      // Special handling for development environment with placeholder key
      if (process.env.NODE_ENV === "development" && stripeError?.includes("placeholder")) {
        return NextResponse.json(
          {
            error: "Stripe is in development mode. No real payment will be processed.",
            success: false,
            developmentMode: true,
            message: "This is a development preview. A real checkout link will be generated in production.",
            url: null, // Explicitly set url to null
          },
          {
            status: 200, // Return 200 OK to be handled by the frontend
            headers: {
              "Content-Type": "application/json",
            },
          },
        )
      }
      return NextResponse.json(
        {
          error: "Payment processing is temporarily unavailable. Please try again in a moment.",
          success: false,
          details: stripeError,
        },
        {
          status: 503,
          headers: {
            "Content-Type": "application/json",
          },
        },
      )
    }

    let body
    try {
      body = await request.json()
    } catch (parseError) {
      console.error("❌ JSON parse error:", parseError)
      return NextResponse.json(
        {
          error: "Invalid request format",
          success: false,
        },
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        },
      )
    }

    const { email, estimatedIncome, badge } = body

    if (!email) {
      return NextResponse.json(
        {
          error: "Email is required",
          success: false,
        },
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        },
      )
    }

    console.log("✅ Creating checkout session for:", email)
    console.log("💰 Estimated income:", estimatedIncome)
    console.log("🏆 Badge:", badge)

    // Create Stripe checkout session with better configuration
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "One App Per Day - Complete AI Guide",
              description: "Step-by-step guide to build and launch AI-powered websites in 1 day",
              images: ["https://oneappperday.com/og-image.png"],
            },
            unit_amount: 3200, // $32.00 in cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `https://oneappnew.netlify.app/thank-you`,
      cancel_url: `${request.nextUrl.origin}/quiz`,
      customer_email: email,
      metadata: {
        email,
        estimatedIncome: estimatedIncome?.toString() || "0",
        badge: badge || "AI Entrepreneur",
        product: "one-app-per-day-guide",
      },
      allow_promotion_codes: true,
      billing_address_collection: "auto",
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // 30 minutes from now
      phone_number_collection: {
        enabled: false,
      },
      custom_text: {
        submit: {
          message: "Complete your purchase to get instant access to the guide!",
        },
      },
    })

    console.log("✅ Checkout session created successfully:", session.id)
    console.log("🔗 Checkout URL:", session.url)

    return NextResponse.json(
      {
        sessionId: session.id,
        url: session.url,
        success: true,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    )
  } catch (error) {
    console.error("❌ Stripe checkout error:", error)

    // Provide more specific error messages
    let errorMessage = "Payment processing failed. Please try again."

    if (error instanceof Error) {
      console.error("Error details:", error.message)
      if (error.message.includes("Invalid API Key")) {
        errorMessage = "Payment system configuration error. Please contact support."
      } else if (error.message.includes("network")) {
        errorMessage = "Network error. Please check your connection and try again."
      } else if (error.message.includes("rate")) {
        errorMessage = "Too many requests. Please wait a moment and try again."
      }
    }

    return NextResponse.json(
      {
        error: errorMessage,
        success: false,
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    )
  }
}
