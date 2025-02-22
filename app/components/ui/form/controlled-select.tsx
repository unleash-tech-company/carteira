import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Check, ChevronsUpDown } from "lucide-react"
import { useState } from "react"
import { useFormContext } from "react-hook-form"

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
  disabled?: boolean
  required?: boolean
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
  disabled,
  required = false,
}: BaseProps<T>) {
  const { control } = useFormContext()
  const [open, setOpen] = useState(false)
  const [inputValue, setInputValue] = useState("")

  const handleInputChange = (value: string) => {
    setInputValue(value)
    onSearch?.(value)
  }

  return (
    <FormField
      control={control}
      name={name}
      rules={{
        validate: (value) => {
          if (required && !value) {
            return "Selecione uma opção"
          }
        },
      }}
      render={({ field }) => {
        const selectedOption = options.find((option) => eq(option.value, field.value))

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
                    {selectedOption ? selectedOption.label : placeholder}
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
                      <CommandEmpty>{emptyMessage}</CommandEmpty>
                      <CommandGroup>
                        {options.map((option) => (
                          <CommandItem
                            key={option.label}
                            value={option.label}
                            onSelect={() => {
                              console.log("onSelect", option.value)
                              field.onChange(option.value)
                              setOpen(false)
                              onSelect?.(option.value)
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
            <FormMessage />
          </FormItem>
        )
      }}
    />
  )
}
