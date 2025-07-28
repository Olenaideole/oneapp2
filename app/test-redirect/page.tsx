"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function TestRedirectPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [lastUrl, setLastUrl] = useState("")

  const testRedirect = async () => {
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
      console.log("Test redirect response:", data)

      if (data.url) {
        setLastUrl(data.url)
        console.log("Redirecting to:", data.url)

        // Try immediate redirect
        window.location.href = data.url
      } else {
        alert("No URL received: " + JSON.stringify(data))
      }
    } catch (error) {
      console.error("Test redirect error:", error)
      alert("Error: " + error.message)
    } finally {
      setTimeout(() => setIsLoading(false), 2000)
    }
  }

  const manualRedirect = () => {
    if (lastUrl) {
      window.open(lastUrl, "_self")
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="p-6">
          <h1 className="text-2xl font-bold mb-4">Stripe Redirect Test</h1>

          <div className="space-y-4">
            <Button onClick={testRedirect} disabled={isLoading} className="w-full">
              {isLoading ? "Testing..." : "Test Stripe Redirect"}
            </Button>

            {lastUrl && (
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Last URL:</p>
                <p className="text-xs bg-gray-100 p-2 rounded break-all">{lastUrl}</p>
                <Button onClick={manualRedirect} variant="outline" className="w-full bg-transparent">
                  Manual Redirect
                </Button>
              </div>
            )}
          </div>

          <div className="mt-4 text-xs text-gray-500">
            <p>Check browser console for detailed logs</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
