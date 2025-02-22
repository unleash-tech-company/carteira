import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useSubscriptionTemplates } from "@/hooks/use-subscription-templates"
import { cn } from "@/lib/utils"
import { Check, ChevronsUpDown } from "lucide-react"
import { useState } from "react"

interface TemplateSelectProps {
  onSelect: (
    template: {
      id: string
      name: string
      description: string | null
      recommendedMaxMembers: number
      recommendedPriceInCents: number
    } | null
  ) => void
  value?: string | null
}

export function TemplateSelect({ onSelect, value }: TemplateSelectProps) {
  const [open, setOpen] = useState(false)
  const { templates, isLoading } = useSubscriptionTemplates()

  const selectedTemplate = templates?.find((template) => template.id === value)

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
          {value && selectedTemplate ? selectedTemplate.name : "Selecione um template..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput placeholder="Buscar template..." />
          <CommandList>
            <CommandEmpty>Nenhum template encontrado.</CommandEmpty>
            <CommandGroup>
              {templates?.map((template) => (
                <CommandItem
                  key={template.id}
                  value={template.name}
                  onSelect={() => {
                    onSelect(template)
                    setOpen(false)
                  }}
                >
                  <Check className={cn("mr-2 h-4 w-4", value === template.id ? "opacity-100" : "opacity-0")} />
                  <div className="flex flex-col">
                    <span>{template.name}</span>
                    {template.description && (
                      <span className="text-sm text-muted-foreground">{template.description}</span>
                    )}
                  </div>
                </CommandItem>
              ))}
              <CommandItem
                value="custom"
                onSelect={() => {
                  onSelect(null)
                  setOpen(false)
                }}
              >
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
