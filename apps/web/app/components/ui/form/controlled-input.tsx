import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { parseCurrency } from "@/lib/currency"
import type { ComponentProps } from "react"
import { useFormContext, type FieldPath, type FieldValues } from "react-hook-form"
import { NumericFormat } from "react-number-format"
import type { ZodOptional, ZodType } from "zod"

type BaseProps<TFieldValues extends FieldValues> = {
  name: FieldPath<TFieldValues>
  label?: string
  schema: ZodType<string | number> | ZodOptional<ZodType<string | number>>
}

type InputProps = ComponentProps<typeof Input>
type NumericFormatProps = ComponentProps<typeof NumericFormat>

type ControlledInputProps<TFieldValues extends FieldValues> = BaseProps<TFieldValues> &
  (({ numeric?: false } & InputProps) | ({ numeric: true } & NumericFormatProps))

export function ControlledInput<TFieldValues extends FieldValues>({
  name,
  label,
  numeric,
  ...props
}: ControlledInputProps<TFieldValues>) {
  const { control } = useFormContext<TFieldValues>()

  return (
    <FormField
      control={control}
      key={name}
      name={name}
      rules={{
        validate: (value) => {
          if (props.schema) {
            const result = props.schema.safeParse(value)
            if (!result.success) {
              return result.error.errors[0].message
            }
          }

          return true
        },
      }}
      render={({ field }) => {
        const value = numeric ? parseCurrency(field.value) : field.value
        return (
          <FormItem>
            {label && <FormLabel>{label}</FormLabel>}
            <FormControl>
              {numeric ? (
                <NumericFormat
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={Number(value ?? 0) / 100}
                  onValueChange={(values) => field.onChange((Number(values.value) || 0) * 100)}
                  {...(props as NumericFormatProps)}
                />
              ) : (
                <Input {...field} value={field.value ?? ""} {...(props as InputProps)} />
              )}
            </FormControl>
            <FormMessage />
          </FormItem>
        )
      }}
    />
  )
}
