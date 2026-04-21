import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { authClient } from "@/lib/auth-client"
import { toast } from "sonner"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { SpinnerIcon } from "@phosphor-icons/react"
import Image from "next/image"

export function SignInForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  async function googleSignIn() {
    setLoading(true)
    try {
      await authClient.signIn.social({
        provider: "google",
      })
      toast.success("Signed in with Google")
      router.push("/")
    } catch (error) {
      console.log(error)
      toast.error("Failed to sign in with Google")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className={cn("flex flex-col gap-6", className)} {...props}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Welcome back</h1>
        </div>
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input id="email" type="email" placeholder="m@example.com" required />
        </Field>
        <Field>
          <div className="flex items-center justify-between">
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <FieldLabel>Forgot your password?</FieldLabel>
          </div>
          <Input id="password" type="password" required />
        </Field>
        <Field>
          <Button type="submit">Login</Button>
        </Field>
        <FieldSeparator>Or continue with</FieldSeparator>
        <Field>
          <Button
            disabled={loading}
            variant="outline"
            type="button"
            className="cursor-pointer"
            onClick={googleSignIn}
          >
            {loading && <SpinnerIcon className="h-4 w-4 animate-spin" />}
            <Image height={16} width={16} src="/google.png" alt="Google" />
            Login with Google
          </Button>
          <FieldDescription className="text-center">
            Don&apos;t have an account? <Link href="/sign-up">Sign up</Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  )
}
