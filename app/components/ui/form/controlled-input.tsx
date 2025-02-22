import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import type { ComponentProps } from "react"
import type { Control } from "react-hook-form"
import { NumericFormat } from "react-number-format"

type BaseProps = {
  name: string
  control: Control<any>
  label?: string
}

type InputProps = ComponentProps<typeof Input>
type NumericFormatProps = ComponentProps<typeof NumericFormat>

type ControlledInputProps = BaseProps & (({ numeric?: false } & InputProps) | ({ numeric: true } & NumericFormatProps))

export function ControlledInput({ name, control, label, numeric, ...props }: ControlledInputProps) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
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
