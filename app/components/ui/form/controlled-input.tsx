import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import type { ComponentProps } from "react"
import { useFormContext } from "react-hook-form"
import { NumericFormat } from "react-number-format"

type BaseProps = {
  name: string
  label?: string
}

type InputProps = ComponentProps<typeof Input>
type NumericFormatProps = ComponentProps<typeof NumericFormat>

type ControlledInputProps = BaseProps & (({ numeric?: false } & InputProps) | ({ numeric: true } & NumericFormatProps))

export function ControlledInput({ name, label, numeric, ...props }: ControlledInputProps) {
  const { control } = useFormContext()

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          {label && <FormLabel>{label}</FormLabel>}
          <FormControl>
            {numeric ? (
              <NumericFormat
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={field.value}
                onValueChange={(values) => field.onChange(values.value)}
                {...(props as NumericFormatProps)}
              />
            ) : (
              <Input {...field} {...(props as InputProps)} />
            )}
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
