"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function QuizPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/quiz/1")
  }, [router])

  return null
}
