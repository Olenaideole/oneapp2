import { NextResponse } from "next/server"

export async function GET() {
  console.log("🔍 === ENVIRONMENT VARIABLE DEBUG ENDPOINT ===")

  // Get current timestamp
  const timestamp = new Date().toISOString()

  // Check runtime environment
  const runtime = {
    nodeEnv: process.env.NODE_ENV,
    vercel: process.env.VERCEL,
    vercelEnv: process.env.VERCEL_ENV,
    platform: typeof window !== "undefined" ? "Browser" : "Server",
    timestamp,
  }

  // Check specific environment variables
  const envVars = {
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    XAI_API_KEY: process.env.XAI_API_KEY,
  }

  // Analyze RESEND_API_KEY specifically
  const resendAnalysis = {
    exists: !!envVars.RESEND_API_KEY,
    type: typeof envVars.RESEND_API_KEY,
    length: envVars.RESEND_API_KEY ? envVars.RESEND_API_KEY.length : 0,
    startsWithRe: envVars.RESEND_API_KEY ? envVars.RESEND_API_KEY.startsWith("re_") : false,
    preview: envVars.RESEND_API_KEY ? `${envVars.RESEND_API_KEY.substring(0, 15)}...` : null,
    hasWhitespace: envVars.RESEND_API_KEY ? envVars.RESEND_API_KEY !== envVars.RESEND_API_KEY.trim() : false,
    hasQuotes: envVars.RESEND_API_KEY
      ? envVars.RESEND_API_KEY.startsWith('"') || envVars.RESEND_API_KEY.startsWith("'")
      : false,
  }

  // Find all RESEND-related variables
  const resendKeys = Object.keys(process.env).filter((key) => key.includes("RESEND"))
  const resendVars = {}
  resendKeys.forEach((key) => {
    const value = process.env[key]
    resendVars[key] = value
      ? {
          length: value.length,
          preview: `${value.substring(0, 10)}...`,
          startsWithRe: value.startsWith("re_"),
        }
      : null
  })

  // Count total environment variables
  const totalEnvVars = Object.keys(process.env).length

  const debugInfo = {
    timestamp,
    runtime,
    resendAnalysis,
    resendVars,
    totalEnvVars,
    envVarStatus: {
      RESEND_API_KEY: envVars.RESEND_API_KEY
        ? envVars.RESEND_API_KEY.includes("your_")
          ? "PLACEHOLDER"
          : "SET"
        : "MISSING",
      SUPABASE_URL: envVars.SUPABASE_URL ? (envVars.SUPABASE_URL.includes("your_") ? "PLACEHOLDER" : "SET") : "MISSING",
      SUPABASE_SERVICE_ROLE_KEY: envVars.SUPABASE_SERVICE_ROLE_KEY
        ? envVars.SUPABASE_SERVICE_ROLE_KEY.includes("your_")
          ? "PLACEHOLDER"
          : "SET"
        : "MISSING",
      STRIPE_SECRET_KEY: envVars.STRIPE_SECRET_KEY
        ? envVars.STRIPE_SECRET_KEY.startsWith("sk_")
          ? "SET"
          : "INVALID"
        : "MISSING",
      XAI_API_KEY: envVars.XAI_API_KEY ? "SET" : "MISSING",
      STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET ? "SET" : "MISSING",
    },
    recommendations: [],
  }

  // Add recommendations
  if (!envVars.RESEND_API_KEY) {
    debugInfo.recommendations.push("RESEND_API_KEY is missing - add it to your environment variables")
  } else if (envVars.RESEND_API_KEY.includes("your_")) {
    debugInfo.recommendations.push("RESEND_API_KEY appears to be a placeholder - replace with actual API key")
  } else if (!envVars.RESEND_API_KEY.startsWith("re_")) {
    debugInfo.recommendations.push("RESEND_API_KEY should start with 're_' - verify the key format")
  } else if (envVars.RESEND_API_KEY.length < 20) {
    debugInfo.recommendations.push("RESEND_API_KEY seems too short - verify the complete key was copied")
  } else {
    debugInfo.recommendations.push("RESEND_API_KEY appears to be properly configured")
  }

  // Log to server console
  console.log("📊 Environment Debug Info:", JSON.stringify(debugInfo, null, 2))

  return NextResponse.json(debugInfo, {
    headers: {
      "Content-Type": "application/json",
    },
  })
}
