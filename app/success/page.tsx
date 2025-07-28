"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Download, Users, Mail, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function SuccessPage() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("session_id")
  const [isLoading, setIsLoading] = useState(true)
  const [sessionData, setSessionData] = useState<any>(null)

  useEffect(() => {
    if (sessionId) {
      // In a real app, you'd verify the session with your backend
      // For now, we'll just show success
      setIsLoading(false)
      setSessionData({ amount: 32, email: "customer@example.com" })
    }
  }, [sessionId])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="max-w-lg w-full p-8 text-center">
          <CardContent className="p-0">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Confirming your purchase...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">1</span>
            </div>
            <span className="text-xl font-bold text-gray-900">One App Per Day</span>
          </Link>
        </div>
      </header>

      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-4">
        <Card className="max-w-2xl w-full p-8 text-center">
          <CardContent className="p-0">
            <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-6" />

            <h1 className="text-4xl font-bold text-gray-900 mb-4">🎉 Welcome to the Club!</h1>
            <p className="text-xl text-gray-600 mb-8">
              Your payment was successful. You now have lifetime access to the complete One App Per Day guide!
            </p>

            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
              <h2 className="text-2xl font-bold text-green-800 mb-4">What happens next?</h2>
              <div className="space-y-4 text-left">
                <div className="flex items-start space-x-3">
                  <Mail className="h-6 w-6 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-green-800">Check Your Email</h3>
                    <p className="text-green-700 text-sm">
                      We've sent your complete guide and access instructions to your email within the next 5 minutes.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Download className="h-6 w-6 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-green-800">Download Your Guide</h3>
                    <p className="text-green-700 text-sm">
                      Get instant access to the complete Notion guide with step-by-step instructions, tools, and
                      templates.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Users className="h-6 w-6 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-green-800">Join the Community</h3>
                    <p className="text-green-700 text-sm">
                      Access our private Discord community where you can ask questions and connect with other builders.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-bold text-blue-800 mb-3">🚀 Ready to Build Your First AI App?</h3>
              <p className="text-blue-700 text-sm mb-4">
                Follow the guide step-by-step and you could have your first AI-powered website live within 24 hours!
              </p>
              <div className="text-sm text-blue-600 space-y-1">
                <p>✅ Complete step-by-step instructions</p>
                <p>✅ All necessary tools and resources</p>
                <p>✅ Ready-to-use templates</p>
                <p>✅ Community support</p>
              </div>
            </div>

            <div className="space-y-4">
              <Button
                size="lg"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-semibold rounded-full"
                asChild
              >
                <Link href="/">
                  <ArrowRight className="mr-2 h-5 w-5" />
                  Back to Home
                </Link>
              </Button>

              <p className="text-sm text-gray-500">Questions? Email us at support@oneappperday.com</p>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500">Transaction ID: {sessionId?.substring(0, 20)}...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
