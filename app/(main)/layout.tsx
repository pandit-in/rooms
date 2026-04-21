import Header from "@/components/layout/header"
import React from "react"

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div>
      <Header />
      <main>{children}</main>
    </div>
  )
}
