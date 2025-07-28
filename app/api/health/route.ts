import { NextResponse } from "next/server"

function isPlaceholder(value: string | undefined): boolean {
  if (!value) return true

  const placeholders = [
    "your_supabase_url",
    "your-supabase-url",
    "your_supabase_service_role_key",
    "your-supabase-service-role-key",
    "your_resend_api_key",
    "your-resend-api-key",
    "your_stripe_secret_key",
    "your-stripe-secret-key",
    "supabase_url",
    "service_role_key",
    "resend_api_key",
    "stripe_secret_key",
  ]

  return placeholders.includes(value.toLowerCase().trim())
}

function getServiceStatus(envVar: string | undefined, requiredPrefix?: string): string {
  if (!envVar) return "❌ Not set"
  if (isPlaceholder(envVar)) return "⚠️ Placeholder value"
  if (requiredPrefix && !envVar.startsWith(requiredPrefix)) return "❌ Invalid format"
  return "✅ Configured"
}

function getStripeStatus(envVar: string | undefined): string {
  if (!envVar) return "❌ Not set"
  if (isPlaceholder(envVar)) return "⚠️ Placeholder value"
  if (!envVar.startsWith("sk_")) return "❌ Invalid format (must start with sk_)"
  if (envVar.length < 20) return "❌ Too short"
  return "✅ Configured"
}

export async function GET() {
  const timestamp = new Date().toISOString()

  // Check environment variables
  const envVars = {
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
  }

  // Validate Supabase URL if present
  let supabaseStatus = "❌ Not configured"
  if (envVars.SUPABASE_URL && envVars.SUPABASE_SERVICE_ROLE_KEY) {
    if (isPlaceholder(envVars.SUPABASE_URL) || isPlaceholder(envVars.SUPABASE_SERVICE_ROLE_KEY)) {
      supabaseStatus = "⚠️ Placeholder values detected"
    } else {
      try {
        const cleanUrl = envVars.SUPABASE_URL.trim()
        if (cleanUrl.startsWith("http://") || cleanUrl.startsWith("https://")) {
          new URL(cleanUrl) // This will throw if invalid
          supabaseStatus = "✅ Valid configuration"
        } else {
          supabaseStatus = "❌ Invalid URL format (missing http/https)"
        }
      } catch (error) {
        supabaseStatus = `❌ Invalid URL format`
      }
    }
  }

  const envStatus = {
    timestamp,
    mode: process.env.NODE_ENV || "development",
    environment: {
      SUPABASE_URL: getServiceStatus(envVars.SUPABASE_URL, "https://"),
      SUPABASE_SERVICE_ROLE_KEY: getServiceStatus(envVars.SUPABASE_SERVICE_ROLE_KEY),
      RESEND_API_KEY: getServiceStatus(envVars.RESEND_API_KEY, "re_"),
      STRIPE_SECRET_KEY: getStripeStatus(envVars.STRIPE_SECRET_KEY),
      STRIPE_WEBHOOK_SECRET: getServiceStatus(envVars.STRIPE_WEBHOOK_SECRET, "whsec_"),
    },
    services: {
      database: supabaseStatus,
      email:
        envVars.RESEND_API_KEY && !isPlaceholder(envVars.RESEND_API_KEY)
          ? "✅ Available"
          : "⚠️ Development mode (console logging)",
      payments: getStripeStatus(envVars.STRIPE_SECRET_KEY).includes("✅") ? "✅ Available" : "⚠️ Development mode",
    },
    instructions: {
      database: supabaseStatus.includes("Placeholder")
        ? "Replace SUPABASE_URL with actual Supabase project URL (https://your-project.supabase.co)"
        : null,
      email:
        envVars.RESEND_API_KEY && isPlaceholder(envVars.RESEND_API_KEY)
          ? "Replace RESEND_API_KEY with actual Resend API key (re_...)"
          : null,
      payments:
        getStripeStatus(envVars.STRIPE_SECRET_KEY).includes("⚠️") ||
        getStripeStatus(envVars.STRIPE_SECRET_KEY).includes("❌")
          ? "Replace STRIPE_SECRET_KEY with actual Stripe secret key (sk_live_... or sk_test_...)"
          : null,
    },
  }

  return NextResponse.json(envStatus, {
    headers: {
      "Content-Type": "application/json",
    },
  })
}
