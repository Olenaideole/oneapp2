"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

export function StripeDebug() {
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const testStripeRedirect = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "test@example.com",
          estimatedIncome: 2500,
          badge: "Test Badge",
        }),
      })

      const data = await response.json()
      setDebugInfo(data)

      console.log("Debug - Response:", data)

      if (data.url) {
        console.log("Debug - Attempting redirect to:", data.url)

        // Test immediate redirect
        const shouldRedirect = confirm("Redirect immediately? (OK = Yes, Cancel = Manual)")

        if (shouldRedirect) {
          window.location.href = data.url
        } else {
          // Manual options
          const action = prompt("Choose action:\n1 = Open in new tab\n2 = Copy to clipboard\n3 = Show URL", "1")

          if (action === "1") {
            window.open(data.url, "_blank")
          } else if (action === "2") {
            navigator.clipboard.writeText(data.url)
            alert("URL copied to clipboard!")
          } else {
            alert(`Stripe URL:\n\n${data.url}`)
          }
        }
      }
    } catch (error) {
      console.error("Debug error:", error)
      setDebugInfo({ error: error.message })
    } finally {
      setIsLoading(false)
    }
  }

  const testDirectRedirect = () => {
    const testUrl = "https://checkout.stripe.com/c/pay/cs_test_example"
    console.log("Testing direct redirect to:", testUrl)
    window.location.href = testUrl
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white p-4 border rounded-lg shadow-lg max-w-sm z-50">
      <h3 className="font-bold mb-2">Stripe Debug</h3>
      <div className="space-y-2">
        <Button onClick={testStripeRedirect} disabled={isLoading} size="sm" className="w-full">
          {isLoading ? "Testing..." : "Test Stripe Checkout"}
        </Button>
        <Button onClick={testDirectRedirect} size="sm" variant="outline" className="w-full bg-transparent">
          Test Direct Redirect
        </Button>
      </div>
      {debugInfo && (
        <div className="mt-2">
          <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}
