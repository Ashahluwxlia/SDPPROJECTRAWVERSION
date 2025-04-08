import type { Metadata } from "next"
import LoginPageClient from "./login-page-client"

export const metadata: Metadata = {
  title: "Login | TaskTogether",
  description: "Login to your TaskTogether account",
}

export default function LoginPage() {
  return <LoginPageClient />
}

