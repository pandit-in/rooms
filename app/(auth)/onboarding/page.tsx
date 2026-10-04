"use client"

import { OnboardingForm } from "@/components/forms/auth/onboarding-form"
import Image from "next/image"
import Link from "next/link"

export default function OnboardingPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center">
      <div className="flex w-full flex-col gap-4">
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-sm">
            <Link
              href="/"
              className="mb-6 flex items-center justify-center gap-2 font-medium"
            >
              <Image src="/logo.png" alt="Logo" width={25} height={25} />
              Shadospace Rooms.
            </Link>
            <OnboardingForm />
            <p className="mt-6 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/signin" className="text-red-400 hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
