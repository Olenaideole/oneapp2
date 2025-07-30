import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function ThankYouPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <Card className="max-w-lg w-full p-8 text-center shadow-lg">
        <CardContent className="p-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Thank you for your purchase!</h1>
          <p className="text-lg text-gray-600 mb-8">
            Here is your guide:
          </p>

          <Button
            size="lg"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-semibold rounded-full"
            asChild
          >
            <a href="https://oneappnew.netlify.app/OneAppGuide.pdf" download>
              <Download className="mr-2 h-5 w-5" />
              Download the One App Guide
            </a>
          </Button>
          <div className="mt-8">
            <Link href="/" className="text-gray-600 hover:text-gray-900 inline-flex items-center">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
