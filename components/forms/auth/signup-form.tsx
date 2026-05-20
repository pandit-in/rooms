import { Button } from "@/components/ui/button"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import Image from "next/image"
import { authClient } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import React from "react"
import { toast } from "sonner"
import { SpinnerIcon, XIcon } from "@phosphor-icons/react"
import z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { CardContent } from "@/components/ui/card"
import { AvatarUploader } from "@/components/uploads/avatar"

export const formSchema = z.object({
  image: z.string().optional(),
  email: z.email(),
  password: z.string().min(6),
  confirmPassword: z.string().min(6),
  name: z.string(),
})

type FormValues = z.infer<typeof formSchema>

export function SignUpForm() {
  const [isPending, startTransition] = React.useTransition()
  const router = useRouter()
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      image: "",
    },
  })

  function onSubmit(data: FormValues) {
    startTransition(async () => {
      try {
        const { error } = await authClient.signUp.email(data)
        if (error) {
          toast.error(error.message)
        } else {
          toast.success("Account created successfully!")
          router.push("/onboarding")
        }
      } catch (err) {
        console.log(err)
        toast.error("Something went wrong.")
      }
    })
  }

  async function googleSignIn() {
    startTransition(async () => {
      try {
        await authClient.signIn.social({
          provider: "google",
          callbackURL: "/onboarding",
        })
        toast.success("Signed in with Google")
        router.push("/onboarding")
      } catch (error) {
        console.log(error)
        toast.error("Failed to sign in with Google")
      }
    })
  }
  return (
    <div>
      <div className="w-full">
        <CardContent>
          <form id="signup-form" onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              <Controller
                name="image"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="signup-image">Avatar</FieldLabel>
                    {field.value ? (
                      <div className="relative flex items-center gap-4">
                        <Image
                          src={field.value}
                          alt={`Preview`}
                          className="h-20 w-20 rounded-full object-cover"
                          width={100}
                          height={100}
                        />
                        <Button
                          type="button"
                          size={"sm"}
                          onClick={() => form.setValue("image", "")}
                          variant="destructive"
                          className="cursor-pointer p-1"
                        >
                          <XIcon size={16} /> remove
                        </Button>
                      </div>
                    ) : (
                      <AvatarUploader
                        onUploadSuccess={(url) => {
                          form.setValue("image", url, {
                            shouldValidate: true,
                            shouldDirty: true,
                          })
                        }}
                      />
                    )}

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="signup-name">Name</FieldLabel>
                    <Input
                      {...field}
                      id="signup-name"
                      aria-invalid={fieldState.invalid}
                      placeholder="name"
                      autoComplete="name"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="signup-email">Email</FieldLabel>
                    <Input
                      {...field}
                      id="signup-email"
                      placeholder="email@example.com"
                      autoComplete="email"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="password"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="signup-password">Password</FieldLabel>
                    <Input
                      {...field}
                      id="signup-password"
                      placeholder="********"
                      aria-invalid={fieldState.invalid}
                      type="password"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="confirmPassword"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="signup-confirmPassword">
                      Confirm Password
                    </FieldLabel>
                    <Input
                      {...field}
                      id="signup-confirmPassword"
                      placeholder="********"
                      aria-invalid={fieldState.invalid}
                      type="password"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <FieldSeparator>Or continue with</FieldSeparator>

              <Button
                disabled={isPending}
                variant="outline"
                type="button"
                className="cursor-pointer"
                onClick={googleSignIn}
              >
                {isPending && <SpinnerIcon className="h-4 w-4 animate-spin" />}
                <Image height={16} width={16} src="/google.png" alt="Google" />
                Login with Google
              </Button>
              <Button
                type="submit"
                form="signup-form"
                className={"w-full cursor-pointer"}
                disabled={isPending}
              >
                {isPending ? "Creating..." : "Create Account"}
              </Button>
            </FieldGroup>
          </form>
        </CardContent>
      </div>
    </div>
  )
}
