import type { Metadata } from "next"
import RegisterClientPage from "./RegisterClientPage"

export const metadata: Metadata = {
  title: "Register | TaskTogether",
  description: "Create a new TaskTogether account",
}

export default function RegisterPage() {
  return <RegisterClientPage />
}

