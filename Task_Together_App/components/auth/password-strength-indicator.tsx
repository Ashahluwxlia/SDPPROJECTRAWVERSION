"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Check, X } from "lucide-react"
import { useSession } from "next-auth/react"

interface PasswordStrengthIndicatorProps {
  password: string
  isDemoMode?: boolean
}

export function PasswordStrengthIndicator({ password, isDemoMode = false }: PasswordStrengthIndicatorProps) {
  const { data: session } = useSession()
  const [strength, setStrength] = useState(0)
  const [requirements, setRequirements] = useState({
    length: false,
    lowercase: false,
    uppercase: false,
    number: false,
    special: false,
  })

  useEffect(() => {
    // Check requirements
    const newRequirements = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
    }

    setRequirements(newRequirements)

    // Calculate strength (0-100)
    const metRequirements = Object.values(newRequirements).filter(Boolean).length
    const newStrength = Math.min(100, metRequirements * 20)
    
    // For demo mode, adjust the strength calculation
    if (isDemoMode && !session?.user) {
      // In demo mode, we'll make the strength calculation more lenient
      // to show the UI working properly
      setStrength(Math.min(100, newStrength + 10))
    } else {
      setStrength(newStrength)
    }
  }, [password, session, isDemoMode])

  const getStrengthLabel = () => {
    if (strength === 0) return "Empty"
    if (strength <= 20) return "Very Weak"
    if (strength <= 40) return "Weak"
    if (strength <= 60) return "Medium"
    if (strength <= 80) return "Strong"
    return "Very Strong"
  }

  const getStrengthColor = () => {
    if (strength === 0) return "bg-gray-300"
    if (strength <= 20) return "bg-red-500"
    if (strength <= 40) return "bg-orange-500"
    if (strength <= 60) return "bg-yellow-500"
    if (strength <= 80) return "bg-green-400"
    return "bg-green-500"
  }

  return (
    <div className="space-y-3 mt-2">
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Password Strength</span>
          <span
            className={`text-sm ${
              strength <= 20
                ? "text-red-500"
                : strength <= 40
                  ? "text-orange-500"
                  : strength <= 60
                    ? "text-yellow-500"
                    : "text-green-500"
            }`}
          >
            {getStrengthLabel()}
            {isDemoMode && !session?.user && " (Demo)"}
          </span>
        </div>
        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className={`h-full ${getStrengthColor()}`}
            initial={{ width: 0 }}
            animate={{ width: `${strength}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <RequirementItem text="At least 8 characters" met={requirements.length} />
        <RequirementItem text="One lowercase letter" met={requirements.lowercase} />
        <RequirementItem text="One uppercase letter" met={requirements.uppercase} />
        <RequirementItem text="One number" met={requirements.number} />
        <RequirementItem text="One special character" met={requirements.special} />
      </div>
    </div>
  )
}

interface RequirementItemProps {
  text: string
  met: boolean
}

function RequirementItem({ text, met }: RequirementItemProps) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`flex-shrink-0 h-5 w-5 rounded-full flex items-center justify-center ${
          met ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"
        }`}
      >
        {met ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 15 }}
          >
            <Check className="h-3 w-3" />
          </motion.div>
        ) : (
          <X className="h-3 w-3" />
        )}
      </div>
      <span className={`text-xs ${met ? "text-green-600" : "text-gray-500"}`}>{text}</span>
    </div>
  )
}

