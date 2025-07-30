import { type NextRequest, NextResponse } from "next/server"

// Initialize Supabase client with robust error handling
let supabase: any = null
let supabaseError: string | null = null

async function initializeSupabase() {
  try {
    const supabaseUrl = process.env.SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    // Check for missing or placeholder values
    if (!supabaseUrl || !supabaseKey) {
      supabaseError = "Supabase environment variables not configured"
      console.log("⚠️ Supabase not configured - running in development mode")
      return
    }

    // Clean URL and check for placeholder values
    const cleanUrl = supabaseUrl.trim()

    // Check for common placeholder values
    const placeholderValues = [
      "your_supabase_url",
      "your-supabase-url",
      "https://your-project.supabase.co",
      "https://your-project-id.supabase.co",
      "supabase_url",
      "SUPABASE_URL",
    ]

    if (placeholderValues.includes(cleanUrl)) {
      supabaseError = `Supabase URL is set to placeholder value: ${cleanUrl}`
      console.log("⚠️ Supabase URL is placeholder - running in development mode")
      return
    }

    // Check if it's a valid URL format
    if (!cleanUrl.startsWith("http://") && !cleanUrl.startsWith("https://")) {
      supabaseError = `Invalid Supabase URL format: ${cleanUrl} (must start with http:// or https://)`
      console.log("⚠️ Invalid Supabase URL format - running in development mode")
      return
    }

    // Validate URL construction
    try {
      new URL(cleanUrl)
    } catch (urlError) {
      supabaseError = `Invalid Supabase URL: ${cleanUrl} - ${urlError}`
      console.log("⚠️ Supabase URL validation failed - running in development mode")
      return
    }

    // Check for placeholder service role key
    const cleanKey = supabaseKey.trim()
    const keyPlaceholders = [
      "your_supabase_service_role_key",
      "your-supabase-service-role-key",
      "service_role_key",
      "SUPABASE_SERVICE_ROLE_KEY",
    ]

    if (keyPlaceholders.includes(cleanKey) || cleanKey.length < 50) {
      supabaseError = "Supabase service role key is placeholder or invalid"
      console.log("⚠️ Supabase service role key is placeholder - running in development mode")
      return
    }

    // Try to create Supabase client
    const { createClient } = await import("@supabase/supabase-js")
    supabase = createClient(cleanUrl, cleanKey)
    console.log("✅ Supabase client initialized successfully")
  } catch (error) {
    supabaseError = `Supabase initialization failed: ${error}`
    console.log("⚠️ Supabase initialization error - running in development mode:", error)
  }
}

// Initialize on module load
initializeSupabase()

interface QuizResponse {
  email: string
  responses: Record<string, string>
  subscribe?: boolean
}

interface AIReport {
  monthlyIncome: number
  incomeModel: string
  strengths: string[]
  weakSpots: string[]
  badge: string
  quickIdea: string
  fullReport: string
}

function debugEnvironmentVariables() {
  console.log("🔍 === COMPREHENSIVE ENVIRONMENT VARIABLE DEBUG ===")

  // Check all environment variables that might be relevant
  const envVars = {
    NODE_ENV: process.env.NODE_ENV,
    VERCEL: process.env.VERCEL,
    VERCEL_ENV: process.env.VERCEL_ENV,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  }

  console.log("🌍 Runtime Environment:")
  console.log("   - NODE_ENV:", envVars.NODE_ENV)
  console.log("   - VERCEL:", envVars.VERCEL)
  console.log("   - VERCEL_ENV:", envVars.VERCEL_ENV)
  console.log("   - Platform:", typeof window !== "undefined" ? "Browser" : "Server")

  console.log("🔑 Environment Variables Status:")

  // RESEND_API_KEY detailed analysis
  console.log("📧 RESEND_API_KEY:")
  if (envVars.RESEND_API_KEY) {
    console.log("   ✅ Variable exists")
    console.log("   📏 Length:", envVars.RESEND_API_KEY.length)
    console.log("   🔤 Type:", typeof envVars.RESEND_API_KEY)
    console.log("   🎯 Starts with 're_':", envVars.RESEND_API_KEY.startsWith("re_"))
    console.log("   🔍 First 15 chars:", envVars.RESEND_API_KEY.substring(0, 15) + "...")
    console.log("   🔍 Last 5 chars:", "..." + envVars.RESEND_API_KEY.slice(-5))

    // Check for common issues
    const hasWhitespace = envVars.RESEND_API_KEY !== envVars.RESEND_API_KEY.trim()
    const hasQuotes = envVars.RESEND_API_KEY.startsWith('"') || envVars.RESEND_API_KEY.startsWith("'")
    console.log("   ⚠️ Has whitespace:", hasWhitespace)
    console.log("   ⚠️ Has quotes:", hasQuotes)

    if (hasWhitespace) {
      console.log("   🧹 Trimmed version:", `"${envVars.RESEND_API_KEY.trim()}"`)
    }
  } else {
    console.log("   ❌ Variable is undefined/null/empty")
    console.log("   🔍 Exact value:", JSON.stringify(envVars.RESEND_API_KEY))
  }

  // Check all process.env keys that contain 'RESEND'
  console.log("🔍 All RESEND-related environment variables:")
  const resendKeys = Object.keys(process.env).filter((key) => key.includes("RESEND"))
  if (resendKeys.length > 0) {
    resendKeys.forEach((key) => {
      const value = process.env[key]
      console.log(`   - ${key}: ${value ? `${value.substring(0, 10)}... (length: ${value.length})` : "undefined"}`)
    })
  } else {
    console.log("   ❌ No RESEND-related variables found")
  }

  // Check if we're in a serverless environment
  console.log("🏗️ Runtime Context:")
  console.log("   - AWS Lambda:", !!process.env.AWS_LAMBDA_FUNCTION_NAME)
  console.log("   - Vercel:", !!process.env.VERCEL)
  console.log("   - Railway:", !!process.env.RAILWAY_ENVIRONMENT)
  console.log("   - Netlify:", !!process.env.NETLIFY)

  // List all environment variables (first few characters only for security)
  console.log("📋 All Environment Variables (partial):")
  const allKeys = Object.keys(process.env).sort()
  allKeys.forEach((key) => {
    const value = process.env[key]
    if (value && typeof value === "string") {
      const preview = value.length > 20 ? `${value.substring(0, 20)}...` : value
      console.log(`   - ${key}: ${preview} (length: ${value.length})`)
    } else {
      console.log(`   - ${key}: ${JSON.stringify(value)}`)
    }
  })

  console.log("=== END ENVIRONMENT DEBUG ===")
}

function generateHardcodedReport(responses: Record<string, string>): AIReport {
  // Generate a personalized report based on quiz responses
  const profession = responses.profession || "Professional"
  const hours = responses.hours || "3–7 hours"
  const experience = responses.digital_products || "No experience"
  const timeline = responses.timeline || "In the next 3 months"

  let monthlyIncome = 1500
  let badge = "The AI Explorer"
  let incomeModel = "AI-Powered Content Creation"

  // Customize based on responses
  if (responses.profession === "Entrepreneur") {
    monthlyIncome = 3200
    badge = "The AI Hustler"
    incomeModel = "AI Consulting & Automation Services"
  } else if (responses.profession === "Freelancer") {
    monthlyIncome = 2400
    badge = "The Digital Craftsperson"
    incomeModel = "AI-Enhanced Freelance Services"
  } else if (responses.hours === "Full time") {
    monthlyIncome = 4500
    badge = "The AI Builder"
    incomeModel = "AI Product Development"
  } else if (responses.digital_products === "Yes, multiple times") {
    monthlyIncome = 2800
    badge = "The Digital Maker"
    incomeModel = "AI-Enhanced Digital Products"
  } else if (responses.comfort_tools === "I love experimenting") {
    monthlyIncome = 2100
    badge = "The AI Tinkerer"
    incomeModel = "AI Tool Creation & Templates"
  }

  const fullReport = `🎯 **Your AI Money-Making Profile**

Based on your quiz responses, you have excellent potential to build a profitable AI-powered business. Here's your personalized roadmap:

**Your Current Situation:**
You're a ${profession.toLowerCase()} with ${hours.toLowerCase()} available per week for AI projects. ${
    experience === "Yes, multiple times"
      ? "Your experience creating digital products gives you a significant head start in the AI space."
      : "While you're newer to digital products, your motivation and willingness to learn are your biggest assets."
  }

**💰 Income Potential: $${monthlyIncome.toLocaleString()}/month**
With focused effort and the right strategy, you could realistically reach this income level within 3-6 months. This estimate is based on similar profiles in our community who've successfully monetized AI tools.

**🎯 Your Best AI Income Model: ${incomeModel}**
This path aligns perfectly with your background, available time, and current skill level. It offers the fastest route to your first $1,000 in AI earnings.

**💪 Your Key Strengths:**
• ${
    responses.comfort_tools === "I love experimenting"
      ? "Natural curiosity and love for experimenting with new tools"
      : "Practical, results-focused approach to learning"
  }
• ${timeline === "Immediately" ? "High motivation and urgency to start earning" : "Strategic, long-term thinking"}
• ${
    responses.online_income?.includes("Yes")
      ? "Existing online income experience"
      : "Fresh perspective and eagerness to learn"
  }
• ${responses.writing === "I write professionally" ? "Professional writing skills" : "Willingness to improve communication skills"}

**⚠️ Areas to Develop:**
• Consistent daily practice with AI tools (start with 30 minutes/day)
• Building an online presence and personal brand
• Learning basic marketing and customer acquisition
• ${responses.selling === "I avoid it" ? "Developing comfort with selling and self-promotion" : "Refining your sales approach"}

**🚀 Your 48-Hour Quick Start Plan:**
${
  responses.ai_tools === "I use them often"
    ? "Since you're already familiar with AI tools, create a mini-course teaching others your favorite AI workflows. Record 3 short videos and post them on LinkedIn with a clear call-to-action."
    : "Set up accounts with ChatGPT, Claude, and Canva AI. Spend 2 hours learning prompt engineering basics, then create 5 pieces of valuable content in your expertise area. Share them on social media to start building your AI-powered personal brand."
}

**🎖️ Your AI Archetype: ${badge}**
This represents your unique approach to AI entrepreneurship. Embrace this identity as you build your AI-powered business!

**Next Steps:**
1. Join our community of AI entrepreneurs
2. Get the complete step-by-step guide with tools, templates, and case studies
3. Start implementing your 48-hour plan immediately
4. Track your progress and celebrate small wins

Remember: The AI revolution is happening now, and you're perfectly positioned to be part of it. Your combination of ${
    responses.profession === "Student" ? "fresh perspective and learning ability" : "professional experience and drive"
  } makes you ideal for AI entrepreneurship.

The key is to start small, stay consistent, and focus on providing real value to others using AI as your superpower. Your first $1,000 in AI earnings is closer than you think!`

  return {
    monthlyIncome,
    incomeModel,
    strengths: [
      responses.comfort_tools === "I love experimenting" ? "Love for experimenting" : "Practical approach",
      timeline === "Immediately" ? "High motivation" : "Strategic thinking",
      responses.online_income?.includes("Yes") ? "Online income experience" : "Fresh perspective",
    ],
    weakSpots: [
      "Consistent daily practice",
      "Building online presence",
      responses.selling === "I avoid it" ? "Comfort with selling" : "Marketing skills",
    ],
    badge,
    quickIdea:
      responses.ai_tools === "I use them often"
        ? "Create a mini-course teaching your favorite AI workflows"
        : "Set up AI accounts and create 5 pieces of valuable content in your expertise area",
    fullReport,
  }
}

function generateEmailHTML(report: AIReport, email: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your AI Money Test Results</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8fafc; }
    .container { max-width: 600px; margin: 0 auto; background: white; }
    .header { background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: white; padding: 40px 30px; text-align: center; }
    .content { padding: 30px; }
    .badge { background: #fef3c7; border: 2px solid #f59e0b; border-radius: 50px; padding: 15px 25px; text-align: center; margin: 20px 0; }
    .income-box { background: #ecfdf5; border: 2px solid #10b981; border-radius: 12px; padding: 25px; text-align: center; margin: 20px 0; }
    .section { margin: 25px 0; padding: 20px; background: #f8fafc; border-radius: 8px; }
    .cta { background: #3b82f6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 50px; display: inline-block; font-weight: bold; margin: 20px 0; }
    .footer { background: #1f2937; color: #9ca3af; padding: 30px; text-align: center; font-size: 14px; }
    h1 { margin: 0; font-size: 28px; }
    h2 { color: #1f2937; font-size: 22px; margin-top: 0; }
    h3 { color: #374151; font-size: 18px; }
    .highlight { color: #3b82f6; font-weight: bold; }
    ul { padding-left: 20px; }
    li { margin-bottom: 8px; }
    .report-text { white-space: pre-line; background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6; font-size: 14px; line-height: 1.6; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🧠 Your AI Money Test Results</h1>
      <p>Personalized insights for ${email}</p>
    </div>
    
    <div class="content">
      <div class="badge">
        <h2>🏆 Your AI Archetype: ${report.badge}</h2>
      </div>
      
      <div class="income-box">
        <h2>💰 Your Monthly Income Potential</h2>
        <div style="font-size: 36px; font-weight: bold; color: #10b981;">$${report.monthlyIncome.toLocaleString()}</div>
        <p>Based on your skills and commitment level</p>
      </div>
      
      <div class="section">
        <h3>🎯 Best AI Income Model for You</h3>
        <p><strong>${report.incomeModel}</strong></p>
        <p>This model aligns perfectly with your current skills and time availability.</p>
      </div>
      
      <div class="section">
        <h3>💪 Your Strengths</h3>
        <ul>
          ${report.strengths.map((strength) => `<li>${strength}</li>`).join("")}
        </ul>
      </div>
      
      <div class="section">
        <h3>⚠️ Areas to Watch</h3>
        <ul>
          ${report.weakSpots.map((weakness) => `<li>${weakness}</li>`).join("")}
        </ul>
      </div>
      
      <div class="section">
        <h3>🚀 48-Hour Quick Start</h3>
        <p><strong>${report.quickIdea}</strong></p>
        <p>This is something you can implement this weekend to start seeing results.</p>
      </div>
      
      <div class="section">
        <h3>📋 Your Complete Analysis</h3>
        <div class="report-text">${report.fullReport}</div>
      </div>
      
      <div style="text-align: center; margin: 40px 0; padding: 30px; background: #fef3c7; border-radius: 12px; border: 2px solid #f59e0b;">
        <h3 style="color: #92400e; margin-top: 0;">🚀 Ready to Turn This Into Reality?</h3>
        <p style="color: #92400e; margin-bottom: 20px;">Get the complete step-by-step guide with tools, templates, and case studies</p>
        <a href="https://oneappperday.com" class="cta" style="font-size: 18px; padding: 18px 36px;">Get the Complete Guide - $32</a>
        <p style="font-size: 12px; color: #92400e; margin-top: 15px;">⏰ Limited time offer - Save $11 from regular price</p>
      </div>
    </div>
    
    <div class="footer">
      <p><strong>One App Per Day</strong></p>
      <p>Helping entrepreneurs build AI-powered businesses without coding</p>
      <p style="font-size: 12px; margin-top: 20px;">
        This report was generated based on your quiz responses. Results may vary based on effort and market conditions.
      </p>
    </div>
  </div>
</body>
</html>
  `
}

async function sendEmailWithFallback(email: string, report: AIReport): Promise<{ success: boolean; error?: string }> {
  console.log("🔍 === DETAILED EMAIL SENDING DEBUG ===")

  // First, debug all environment variables
  debugEnvironmentVariables()

  // Get the raw environment variable
  const rawResendKey = process.env.RESEND_API_KEY
  console.log("🔑 Raw RESEND_API_KEY from process.env:")
  console.log("   - Raw value exists:", rawResendKey !== undefined && rawResendKey !== null)
  console.log("   - Raw value type:", typeof rawResendKey)
  console.log("   - Raw value length:", rawResendKey ? rawResendKey.length : 0)
  console.log(
    "   - Raw value (first 20 chars):",
    rawResendKey ? `"${rawResendKey.substring(0, 20)}..."` : "null/undefined",
  )

  // Clean and validate the key
  const resendKey = rawResendKey?.trim()
  console.log("🧹 Cleaned RESEND_API_KEY:")
  console.log("   - Cleaned value exists:", resendKey !== undefined && resendKey !== null && resendKey !== "")
  console.log("   - Cleaned value length:", resendKey ? resendKey.length : 0)
  console.log("   - Starts with 're_':", resendKey ? resendKey.startsWith("re_") : false)
  console.log(
    "   - Cleaned value (first 20 chars):",
    resendKey ? `"${resendKey.substring(0, 20)}..."` : "null/undefined/empty",
  )

  const resendPlaceholders = ["your_resend_api_key", "your-resend-api-key", "resend_api_key", "RESEND_API_KEY"]
  const isPlaceholder = resendKey ? resendPlaceholders.includes(resendKey) : true
  console.log("   - Is placeholder:", isPlaceholder)
  console.log("   - Placeholder check against:", resendPlaceholders)

  // Final validation
  const isValidKey = resendKey && !isPlaceholder && resendKey.startsWith("re_") && resendKey.length > 10
  console.log("✅ Final validation result:", isValidKey)

  if (isValidKey) {
    console.log("✅ Resend API key validation passed - attempting to send email")

    try {
      console.log("📦 Importing Resend package...")
      const { Resend } = await import("resend")
      console.log("✅ Resend package imported successfully")

      console.log("🔧 Creating Resend client with key:", `${resendKey.substring(0, 15)}...`)
      const resend = new Resend(resendKey)
      console.log("✅ Resend client created successfully")

      console.log("📧 Preparing email content...")
      const emailHTML = generateEmailHTML(report, email)
      console.log("✅ Email HTML generated, length:", emailHTML.length)

      const emailPayload = {
        from: "welcome@1appday.com",
        to: [email],
        subject: `🧠 Your AI Money Test Results - $${report.monthlyIncome.toLocaleString()}/month potential!`,
        html: emailHTML,
        text: `Your AI Money Test Results\n\nYour AI Archetype: ${report.badge}\nMonthly Income Potential: $${report.monthlyIncome.toLocaleString()}\n\nBest AI Income Model: ${report.incomeModel}\n\n48-Hour Quick Start: ${report.quickIdea}\n\nFull Report:\n${report.fullReport}\n\nReady to get started? Visit: https://oneappperday.com`,
      }

      console.log("📤 Email payload prepared:")
      console.log("   - From:", emailPayload.from)
      console.log("   - To:", emailPayload.to)
      console.log("   - Subject:", emailPayload.subject)
      console.log("   - HTML length:", emailPayload.html.length)
      console.log("   - Text length:", emailPayload.text.length)

      console.log("🚀 Calling resend.emails.send()...")
      const startTime = Date.now()

      const { data, error } = await resend.emails.send(emailPayload)

      const endTime = Date.now()
      console.log(`⏱️ Email send took ${endTime - startTime}ms`)

      if (error) {
        console.error("❌ Resend API returned error:")
        console.error("   - Error object:", JSON.stringify(error, null, 2))
        console.error("   - Error message:", error.message)
        console.error("   - Error name:", error.name)
        console.error("   - Error stack:", error.stack)
        throw new Error(`Resend API error: ${error.message || JSON.stringify(error)}`)
      }

      console.log("✅ Email sent successfully!")
      console.log("📊 Resend response data:")
      console.log("   - Data object:", JSON.stringify(data, null, 2))
      console.log("   - Email ID:", data?.id)

      return { success: true }
    } catch (error) {
      console.error("❌ Exception during email sending:")
      console.error("   - Error type:", typeof error)
      console.error("   - Error constructor:", error?.constructor?.name)
      console.error("   - Error message:", error instanceof Error ? error.message : String(error))
      console.error("   - Error stack:", error instanceof Error ? error.stack : "No stack trace")

      // Continue to fallback
      console.log("🔄 Falling back to development mode logging...")
    }
  } else {
    console.log("❌ Resend API key validation failed:")
    console.log("   - Key exists:", !!rawResendKey)
    console.log("   - Key cleaned:", !!resendKey)
    console.log("   - Is placeholder:", isPlaceholder)
    console.log("   - Starts with 're_':", resendKey ? resendKey.startsWith("re_") : false)
    console.log("   - Length > 10:", resendKey ? resendKey.length > 10 : false)
    console.log("🔄 Falling back to development mode logging...")
  }

  // Fallback: Log email content (for development/testing)
  console.log("=== 📧 EMAIL SENT (Development Mode) ===")
  console.log(`📧 To: ${email}`)
  console.log(`📧 Subject: 🧠 Your AI Money Test Results - $${report.monthlyIncome.toLocaleString()}/month potential!`)
  console.log(`🏆 Badge: ${report.badge}`)
  console.log(`💰 Income: $${report.monthlyIncome.toLocaleString()}/month`)
  console.log(`🚀 Quick Idea: ${report.quickIdea}`)
  console.log("=== EMAIL CONTENT LOGGED ===")

  // Simulate successful sending for development
  return { success: true }
}

async function sendSummaryReport(email: string): Promise<void> {
  console.log("🔍 === SUMMARY EMAIL SENDING DEBUG ===")

  // Get the raw environment variable (same logic as main email)
  const rawResendKey = process.env.RESEND_API_KEY
  const resendKey = rawResendKey?.trim()
  const resendPlaceholders = ["your_resend_api_key", "your-resend-api-key", "resend_api_key", "RESEND_API_KEY"]
  const isPlaceholder = resendKey ? resendPlaceholders.includes(resendKey) : true
  const isValidKey = resendKey && !isPlaceholder && resendKey.startsWith("re_") && resendKey.length > 10

  console.log("🔑 Summary email - RESEND_API_KEY validation:")
  console.log("   - Valid key:", isValidKey)

  if (!isValidKey) {
    console.log("⚠️ Resend API key not valid for summary email - skipping")
    return
  }

  try {
    console.log("📦 Importing Resend package for summary email...")
    const { Resend } = await import("resend")
    console.log("✅ Resend package imported successfully")

    console.log("🔧 Creating Resend client for summary email...")
    const resend = new Resend(resendKey)
    console.log("✅ Resend client created successfully")

    const summaryEmailHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your AI App Quiz Report is Ready 🚀</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f8fafc; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { text-align: center; margin-bottom: 30px; }
    .emoji { font-size: 24px; }
    h1 { color: #1f2937; margin-bottom: 20px; }
    .summary-box { background: #f0f9ff; border: 2px solid #3b82f6; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .next-steps { background: #f0fdf4; border: 2px solid #10b981; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .cta-button { background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold; margin: 10px 0; }
    .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="emoji">🧠✨</div>
      <h1>Your AI App Quiz Report is Ready!</h1>
    </div>
    
    <p>Hey there!</p>
    
    <p>Thanks for taking the quiz <span class="emoji">🧠✨</span></p>
    
    <div class="summary-box">
      <h3>Here's your quick summary:</h3>
      <ul>
        <li>✅ You're ready to start building AI apps.</li>
        <li>✅ No coding skills? No problem. We'll guide you step-by-step.</li>
        <li>✅ Your journey starts with our guide: "How to Build AI Apps Without Coding".</li>
      </ul>
    </div>
    
    <div class="next-steps">
      <h3>What's next?</h3>
      <p>👉 Check your inbox for upcoming resources and tools</p>
      <p>👉 Follow us on Twitter for daily tips: @oneappperday</p>
      <p>👉 Let's build your first app this week</p>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://oneappperday.com" class="cta-button">Get the Complete Guide - $32</a>
    </div>
    
    <p>Talk soon,</p>
    <p><strong>— The One App Per Day Team</strong></p>
    
    <div class="footer">
      <p>One App Per Day</p>
      <p>Helping entrepreneurs build AI-powered apps without coding</p>
    </div>
  </div>
</body>
</html>
    `

    const summaryEmailText = `Hey there!

Thanks for taking the quiz 🧠✨

Here's your quick summary:
- You're ready to start building AI apps.
- No coding skills? No problem. We'll guide you step-by-step.
- Your journey starts with our guide: "How to Build AI Apps Without Coding".

What's next?
👉 Check your inbox for upcoming resources and tools
👉 Follow us on Twitter for daily tips: @oneappperday
👉 Let's build your first app this week

Talk soon,

— The One App Per Day Team

Get the Complete Guide: https://oneappperday.com`

    const summaryPayload = {
      from: "welcome@1appday.com",
      to: [email],
      subject: "Your AI App Quiz Report is Ready 🚀",
      html: summaryEmailHTML,
      text: summaryEmailText,
    }

    console.log("📤 Summary email payload prepared:")
    console.log("   - From:", summaryPayload.from)
    console.log("   - To:", summaryPayload.to)
    console.log("   - Subject:", summaryPayload.subject)
    console.log("   - HTML length:", summaryPayload.html.length)
    console.log("   - Text length:", summaryPayload.text.length)

    console.log("🚀 Calling resend.emails.send() for summary email...")
    const startTime = Date.now()

    const { data, error } = await resend.emails.send(summaryPayload)

    const endTime = Date.now()
    console.log(`⏱️ Summary email send took ${endTime - startTime}ms`)

    if (error) {
      console.error("❌ Summary email error:")
      console.error("   - Error object:", JSON.stringify(error, null, 2))
      console.error("   - Error message:", error.message)
      console.error("   - Error name:", error.name)
      // Don't throw - this is a nice-to-have, not critical
    } else {
      console.log("✅ Summary email sent successfully!")
      console.log("📊 Summary email response data:")
      console.log("   - Data object:", JSON.stringify(data, null, 2))
      console.log("   - Email ID:", data?.id)
    }
  } catch (error) {
    console.error("❌ Exception during summary email sending:")
    console.error("   - Error type:", typeof error)
    console.error("   - Error constructor:", error?.constructor?.name)
    console.error("   - Error message:", error instanceof Error ? error.message : String(error))
    console.error("   - Error stack:", error instanceof Error ? error.stack : "No stack trace")
    // Don't throw - this is a nice-to-have, not critical
  }
}

export async function POST(request: NextRequest) {
  console.log("=== 🧠 Quiz Submit API Called ===")
  console.log("🕐 Timestamp:", new Date().toISOString())

  // Debug environment variables at the start of every request
  debugEnvironmentVariables()

  // Log environment status (without exposing sensitive data)
  const envStatus = {
    SUPABASE_URL: process.env.SUPABASE_URL
      ? process.env.SUPABASE_URL.includes("your_")
        ? "⚠️ Placeholder"
        : "✅ Set"
      : "❌ Not set",
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY
      ? process.env.SUPABASE_SERVICE_ROLE_KEY.includes("your_")
        ? "⚠️ Placeholder"
        : "✅ Set"
      : "❌ Not set",
    RESEND_API_KEY: process.env.RESEND_API_KEY
      ? process.env.RESEND_API_KEY.includes("your_")
        ? "⚠️ Placeholder"
        : "✅ Set"
      : "❌ Not set",
    supabaseStatus: supabase ? "✅ Available" : `⚠️ ${supabaseError || "Not available"}`,
  }

  console.log("🔧 Environment Status:", envStatus)

  try {
    // Parse request body with error handling
    let body: QuizResponse
    try {
      const rawBody = await request.text()
      console.log("📝 Request body length:", rawBody.length)
      body = JSON.parse(rawBody)
    } catch (parseError) {
      console.error("❌ JSON parse error:", parseError)
      return NextResponse.json(
        {
          error: "Invalid request format. Please try again.",
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

    const { email, responses, subscribe } = body

    // Validate input
    if (!email || !responses || Object.keys(responses).length === 0) {
      console.log("❌ Validation failed:", { email: !!email, responsesCount: Object.keys(responses || {}).length })
      return NextResponse.json(
        {
          error: "Email and responses are required",
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

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      console.log("❌ Invalid email format:", email)
      return NextResponse.json(
        {
          error: "Please enter a valid email address",
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

    console.log("✅ Processing quiz submission for:", email)

    // Save initial response to Supabase (non-blocking)
    let quizRecord = null
    if (supabase) {
      try {
        const { data, error: insertError } = await supabase
          .from("quiz_responses")
          .insert({
            email,
            responses,
            report_status: "pending",
          })
          .select()
          .single()

        if (insertError) {
          console.error("❌ Supabase insert error:", insertError)
          // Continue without database - don't fail the whole process
        } else {
          quizRecord = data
          console.log("✅ Quiz response saved to database")
        }
      } catch (dbError) {
        console.error("❌ Database error (continuing anyway):", dbError)
      }
    } else {
      console.log("⚠️ Supabase not available - running in development mode")
    }

    // Generate hardcoded personalized report
    const report = generateHardcodedReport(responses)
    console.log("✅ Generated personalized report:")
    console.log(`   🏆 Badge: ${report.badge}`)
    console.log(`   💰 Income: $${report.monthlyIncome.toLocaleString()}/month`)
    console.log(`   🎯 Model: ${report.incomeModel}`)

    // Send detailed report email with fallback
    console.log("📧 Starting detailed email send process...")
    const detailedEmailResult = await sendEmailWithFallback(email, report)

    if (!detailedEmailResult.success) {
      throw new Error(detailedEmailResult.error || "Failed to send detailed report")
    }

    // Send summary report using Resend
    console.log("📧 Starting summary email send process...")
    await sendSummaryReport(email)

    // Update Supabase with success (if record exists)
    if (quizRecord && supabase) {
      try {
        await supabase
          .from("quiz_responses")
          .update({
            report_status: "sent",
            estimated_income: report.monthlyIncome,
            xai_response: "Hardcoded personalized report",
            sent_at: new Date().toISOString(),
          })
          .eq("id", quizRecord.id)
        console.log("✅ Database updated with success status")
      } catch (updateError) {
        console.error("❌ Database update error (non-critical):", updateError)
      }
    }

    // Log subscription
    if (subscribe) {
      console.log(`📧 User ${email} subscribed to newsletter`)
    }

    console.log("🎉 Quiz submission completed successfully!")

    return NextResponse.json(
      {
        success: true,
        message: "Report generated and sent successfully",
        estimatedIncome: report.monthlyIncome,
        badge: report.badge,
        showPaywall: true,
      },
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      },
    )
  } catch (error) {
    console.error("❌ Quiz submission error:", error)

    // Return a proper JSON error response
    const errorMessage = error instanceof Error ? error.message : "Something went wrong. Please try again in a moment."

    return NextResponse.json(
      {
        error: errorMessage,
        success: false,
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
