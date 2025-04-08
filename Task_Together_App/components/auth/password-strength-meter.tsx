"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import zxcvbn from "zxcvbn"
import { useSession } from "next-auth/react"

interface PasswordStrengthMeterProps {
  password: string
  isDemoMode?: boolean
}

export function PasswordStrengthMeter({ password, isDemoMode = false }: PasswordStrengthMeterProps) {
  const { data: session } = useSession()
  const [score, setScore] = useState(0)
  const [feedback, setFeedback] = useState<string[]>([])

  useEffect(() => {
    if (password) {
      // For demo mode or non-authenticated users, use a simplified scoring
      if (isDemoMode || !session?.user) {
        // Simple scoring based on password length and complexity
        let demoScore = 0;
        let demoFeedback: string[] = [];
        
        if (password.length >= 8) demoScore += 1;
        else demoFeedback.push("Use at least 8 characters");
        
        if (/[A-Z]/.test(password)) demoScore += 1;
        else demoFeedback.push("Add uppercase letters");
        
        if (/[0-9]/.test(password)) demoScore += 1;
        else demoFeedback.push("Add numbers");
        
        if (/[^A-Za-z0-9]/.test(password)) demoScore += 1;
        else demoFeedback.push("Add special characters");
        
        if (password.length >= 12) demoScore += 1;
        
        setScore(demoScore);
        setFeedback(demoFeedback);
      } else {
        // For real users, use zxcvbn for more accurate scoring
        const result = zxcvbn(password)
        setScore(result.score)

        // Extract feedback suggestions
        const suggestions = result.feedback.suggestions || []
        const warning = result.feedback.warning ? [result.feedback.warning] : []
        setFeedback([...warning, ...suggestions])
      }
    } else {
      setScore(0)
      setFeedback([])
    }
  }, [password, session, isDemoMode])

  const getScoreColor = () => {
    switch (score) {
      case 0:
        return "bg-red-500"
      case 1:
        return "bg-red-500"
      case 2:
        return "bg-yellow-500"
      case 3:
        return "bg-green-400"
      case 4:
        return "bg-green-500"
      default:
        return "bg-gray-300"
    }
  }

  const getScoreText = () => {
    switch (score) {
      case 0:
        return "Very Weak"
      case 1:
        return "Weak"
      case 2:
        return "Fair"
      case 3:
        return "Good"
      case 4:
        return "Strong"
      default:
        return "None"
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">Password Strength</span>
        <span className={`text-sm ${score <= 1 ? "text-red-500" : score === 2 ? "text-yellow-500" : "text-green-500"}`}>
          {getScoreText()}
          {isDemoMode && !session?.user && " (Demo)"}
        </span>
      </div>

      <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden flex">
        {[0, 1, 2, 3, 4].map((index) => (
          <motion.div
            key={index}
            className={`h-full ${index <= score ? getScoreColor() : "bg-gray-200"}`}
            initial={{ width: "0%" }}
            animate={{ width: "20%" }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          />
        ))}
      </div>

      {feedback.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ duration: 0.3 }}
          className="text-xs text-muted-foreground mt-2"
        >
          <ul className="list-disc pl-4 space-y-1">
            {feedback.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </motion.div>
      )}
    </div>
  )
}

