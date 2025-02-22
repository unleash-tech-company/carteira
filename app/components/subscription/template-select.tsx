import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import type { SubscriptionTemplate } from "@/db/drizzle-schema"
import { useSubscriptionTemplates } from "@/hooks/use-subscription-templates"
import { cn } from "@/lib/utils"
import { Check, ChevronsUpDown, Loader2 } from "lucide-react"
import { useState } from "react"

interface TemplateSelectProps {
  onSelect: (
    template: Pick<
      SubscriptionTemplate,
      "id" | "name" | "description" | "recommendedMaxMembers" | "recommendedPriceInCents"
    > | null
  ) => void
  value?: string | null
}

export function TemplateSelect({ onSelect, value }: TemplateSelectProps) {
  const [open, setOpen] = useState(false)
  const [inputValue, setInputValue] = useState("")
  const { templates, isLoading } = useSubscriptionTemplates()

  const selectedTemplate = templates?.find((template) => template.id === value)

  const filteredTemplates = templates?.filter((template) =>
    template.name.toLowerCase().includes(inputValue.toLowerCase())
  )

  const handleInputChange = (value: string) => {
    setInputValue(value)
  }

  const handleSelect = (currentValue: string) => {
    const matchedTemplate = templates?.find((template) => template.name.toLowerCase() === currentValue.toLowerCase())

    if (matchedTemplate) {
      setOpen(false)
      return onSelect(matchedTemplate)
    }
    onSelect({
      id: `custom-${Date.now()}`,
      name: currentValue,
      description: "",
      recommendedMaxMembers: 1,
      recommendedPriceInCents: 0,
    })
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              Selecione um template...
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          ) : value && selectedTemplate ? (
            selectedTemplate.name
          ) : (
            inputValue || "Selecione um template..."
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Buscar ou criar template..."
            value={inputValue}
            onValueChange={handleInputChange}
          />
          <CommandList>
            <CommandEmpty>
              {inputValue && (
                <CommandItem value={inputValue} onSelect={() => handleSelect(inputValue)} className="text-sm">
                  <Check className="mr-2 h-4 w-4 opacity-0" />
                  <div className="flex flex-col">
                    <span>Criar "{inputValue}"</span>
                    <span className="text-sm text-muted-foreground">
                      Pressione enter para criar um template personalizado
                    </span>
                  </div>
                </CommandItem>
              )}
            </CommandEmpty>
            <CommandGroup>
              {filteredTemplates?.map((template) => (
                <CommandItem key={template.id} value={template.name} onSelect={() => handleSelect(template.name)}>
                  <Check className={cn("mr-2 h-4 w-4", value === template.id ? "opacity-100" : "opacity-0")} />
                  <div className="flex flex-col">
                    <span>{template.name}</span>
                    {template.description && (
                      <span className="text-sm text-muted-foreground">{template.description}</span>
                    )}
                  </div>
                </CommandItem>
              ))}
              <CommandItem value="" onSelect={() => handleSelect(inputValue)}>
                <Check className={cn("mr-2 h-4 w-4", !value ? "opacity-100" : "opacity-0")} />
                <div className="flex flex-col">
                  <span>Criar assinatura personalizada</span>
                  <span className="text-sm text-muted-foreground">
                    Defina suas próprias configurações de assinatura
                  </span>
                </div>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
