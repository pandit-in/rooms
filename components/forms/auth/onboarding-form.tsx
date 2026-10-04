import { Button } from "@/components/ui/button"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useRouter } from "next/navigation"
import React from "react"
import { toast } from "sonner"
import z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { CardContent } from "@/components/ui/card"
import { onboardingAction } from "@/app/actions/user"

export const onboardingFormSchema = z.object({
  role: z.enum(["user", "landlord", "admin"]),
})

export type OnboardingFormValues = z.infer<typeof onboardingFormSchema>

export function OnboardingForm() {
  const [isPending, startTransition] = React.useTransition()
  const router = useRouter()
  const form = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingFormSchema),
    defaultValues: {
      role: "user",
    },
  })

  function onSubmit(data: OnboardingFormValues) {
    startTransition(async () => {
      try {
        const response = await onboardingAction(data.role)
        if (response.error) {
          toast.error(response.error)
        } else {
          toast.success("Account updated successfully!")
          if (data.role === "landlord") {
            router.push("/landlord")
          } else if (data.role === "user") {
            router.push("/profile")
          } else {
            router.push("/")
          }
        }
      } catch (err) {
        console.log(err)
        toast.error("Something went wrong.")
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
                name="role"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="signup-role">Role</FieldLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="user">User</SelectItem>
                          <SelectItem value="landlord">Landlord</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
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
