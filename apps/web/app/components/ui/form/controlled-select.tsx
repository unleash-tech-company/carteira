import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { AnimatePresence, motion } from "framer-motion"
import { Check, ChevronsUpDown, Plus } from "lucide-react"
import { useState } from "react"
import { useFormContext } from "react-hook-form"
import type { ZodOptional, ZodType } from "zod"

export type SelectOption<T> = {
  value: T
  label: string
  description?: string
}

type BaseProps<T> = {
  name: string
  label?: string
  placeholder?: string
  options: SelectOption<T>[]
  eq: (a: T, b: T) => boolean
  searchPlaceholder?: string
  emptyMessage?: string
  onSearch?: (value: string) => void
  onSelect?: (value: T) => void
  onCreate?: (value: string) => SelectOption<T>
  createOptionLabel?: (value: string) => string
  disabled?: boolean
  schema: ZodType<any> | ZodOptional<ZodType<any>>
}

export function ControlledSelect<T>({
  name,
  label,
  placeholder = "Selecione uma opção...",
  options,
  searchPlaceholder = "Buscar...",
  onSelect,
  eq,
  emptyMessage = "Nenhuma opção encontrada.",
  onSearch,
  onCreate,
  createOptionLabel = (value) => `Criar "${value}"`,
  disabled,
  schema,
}: BaseProps<T>) {
  const { control, setValue } = useFormContext()
  const [selectedOption, setSelectedOption] = useState<SelectOption<T> | null>(null)
  const [open, setOpen] = useState(false)
  const [inputValue, setInputValue] = useState("")

  const handleInputChange = (value: string) => {
    setInputValue(value)
    onSearch?.(value)
  }

  const showCreateOption =
    // has crete function
    onCreate &&
    // has input value
    inputValue &&
    // not in options
    !options.some((option) => option.label.toLowerCase() === inputValue.toLowerCase())

  const handleCreate = () => {
    if (!onCreate || !inputValue) return

    const newValue = onCreate(inputValue)
    handleSelect(newValue)
  }

  const handleSelect = (value: SelectOption<T>) => {
    setSelectedOption(value)
    setValue(name, value.value)
    setOpen(false)
    onSelect?.(value.value)
  }

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
      render={({ field }) => {
        return (
          <FormItem>
            {label && <FormLabel>{label}</FormLabel>}
            <FormControl>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                    disabled={disabled}
                  >
                    {selectedOption?.label ?? field.value?.label ?? placeholder}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command shouldFilter={false}>
                    <CommandInput
                      placeholder={searchPlaceholder}
                      value={inputValue}
                      onValueChange={handleInputChange}
                    />
                    <CommandList>
                      <CommandEmpty className="pt-2">
                        {showCreateOption ? (
                          <button
                            type="button"
                            className="relative flex w-full cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-3 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 hover:bg-accent hover:text-accent-foreground"
                            onClick={handleCreate}
                          >
                            <Plus className="h-4 w-4" />
                            <div className="flex flex-col items-start">
                              <span>{createOptionLabel(inputValue)}</span>
                            </div>
                          </button>
                        ) : (
                          emptyMessage
                        )}
                      </CommandEmpty>
                      <CommandGroup>
                        {options.map((option) => (
                          <CommandItem
                            key={option.label}
                            value={option.label}
                            onSelect={() => {
                              handleSelect(option)
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                eq(field.value, option.value) ? "opacity-100" : "opacity-0"
                              )}
                            />
                            <div className="flex flex-col">
                              <span>{option.label}</span>
                              {option.description && (
                                <span className="text-sm text-muted-foreground">{option.description}</span>
                              )}
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </FormControl>
            <AnimatePresence mode="wait">
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <FormMessage />
              </motion.div>
            </AnimatePresence>
          </FormItem>
        )
      }}
    />
  )
}
