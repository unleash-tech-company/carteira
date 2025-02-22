import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import type { ZodOptional } from "node_modules/zod/lib/types"
import { useFormContext } from "react-hook-form"
import type { ZodType } from "zod"

export type ToggleOption<T> = {
  value: T
  label: string
  description?: string
  icon?: React.ComponentType<{ className?: string }>
}

type BaseProps<T> = {
  name: string
  label?: string
  options: ToggleOption<T>[]
  eq?: (a: T, b: T) => boolean
  onSelect?: (value: T) => void
  schema: ZodType<T> | ZodOptional<ZodType<T>>
}

export function ControlledToggleGroup<T>({
  name,
  label,
  options,
  eq = (a, b) => a === b,

  onSelect,
  schema,
}: BaseProps<T>) {
  const { control } = useFormContext()

  return (
    <FormField
      control={control}
      name={name}
      rules={{
        validate: (value) => {
          if (schema) {
            const result = schema.safeParse(value)
            if (!result.success) {
              return result.error.errors[0].message
            }
          }

          return true
        },
      }}
      render={({ field }) => (
        <FormItem>
          {label && <FormLabel>{label}</FormLabel>}
          <FormControl>
            <div className="grid grid-cols-2 gap-4">
              {options.map((option) => {
                const isSelected = field.value !== undefined && eq(field.value, option.value)
                const Icon = option.icon

                return (
                  <button
                    key={option.label}
                    type="button"
                    onClick={() => {
                      field.onChange(option.value)
                      onSelect?.(option.value)
                    }}
                    className={cn(
                      "relative flex flex-col items-start gap-1 rounded-lg border-2 p-4 text-left transition-colors",
                      isSelected
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-muted hover:border-muted-foreground/50"
                    )}
                  >
                    {isSelected && (
                      <motion.div
                        layoutId={`${name}-active-background`}
                        className="absolute inset-0 rounded-[calc(0.5rem-1px)] border border-primary bg-primary/5"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      />
                    )}
                    <div className="relative flex items-center gap-2">
                      {Icon && (
                        <Icon className={cn("h-5 w-5", isSelected ? "text-primary" : "text-muted-foreground")} />
                      )}
                      <span className="font-medium">{option.label}</span>
                    </div>
                    {option.description && (
                      <span
                        className={cn("relative text-sm", isSelected ? "text-primary/90" : "text-muted-foreground")}
                      >
                        {option.description}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
