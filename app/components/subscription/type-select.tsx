import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useSubscriptionTemplates } from "@/hooks/use-subscription-templates"
import { cn } from "@/lib/utils"
import { Check, ChevronsUpDown } from "lucide-react"
import { useState } from "react"

interface TypeSelectProps {
  onSelect: (type: string) => void
  value?: string | null
}

export function TypeSelect({ onSelect, value }: TypeSelectProps) {
  const [open, setOpen] = useState(false)
  const [inputValue, setInputValue] = useState("")
  const { templates, isLoading } = useSubscriptionTemplates()

  // Filtra apenas templates aprovados e pega tipos únicos
  const approvedTypes = templates
    ? Array.from(new Set(templates.filter((template) => template.approved).map((template) => template.type)))
    : []

  const filteredTypes = approvedTypes.filter((type) => type?.toLowerCase().includes(inputValue.toLowerCase()))

  const handleInputChange = (value: string) => {
    setInputValue(value)
  }

  const handleSelect = (currentValue: string) => {
    onSelect(currentValue)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between">
          {value || "Selecione o tipo..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput placeholder="Buscar tipo..." value={inputValue} onValueChange={handleInputChange} />
          <CommandList>
            <CommandEmpty>Nenhum tipo encontrado.</CommandEmpty>
            <CommandGroup>
              {filteredTypes.map((type) => (
                <CommandItem key={type} value={type || ""} onSelect={() => handleSelect(type || "")}>
                  <Check className={cn("mr-2 h-4 w-4", value === type ? "opacity-100" : "opacity-0")} />
                  <div className="flex flex-col">
                    <span>{type}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
