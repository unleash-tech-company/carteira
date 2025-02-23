import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ControlledInput } from "@/components/ui/form/controlled-input"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TypographyH1, TypographyH2, TypographyMuted } from "@/components/ui/typography"
import type { Schema, Subscription } from "@carteira/db"
import { useUser } from "@clerk/react-router"
import { useQuery, useZero } from "@rocicorp/zero/react"
import { AlertTriangle, CreditCard, Crown, Eye, EyeOff, Plus, Settings, Trash2, Users } from "lucide-react"
import { useEffect, useState } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { useNavigate, useParams } from "react-router"
import { toast } from "sonner"
import { v4 as uuidv4 } from "uuid"
import * as z from "zod"

export default function SubscriptionDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const z = useZero<Schema>()
  const [subscription] = useQuery(z.query.subscription.where((q) => q.cmp("id", "=", id!)))
  const subscriptionData = subscription[0] as Subscription | undefined
  const [allowedUsers] = useQuery(z.query.usersAllowedInASubscription.where((q) => q.cmp("subscriptionId", "=", id!)))
  const [subscriptionAccount] = useQuery(z.query.subscriptionAccount.where((q) => q.cmp("subscriptionId", "=", id!)))
  const { user: currentUser } = useUser()

  if (!subscriptionData) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Assinatura não encontrada
            </CardTitle>
            <CardDescription>A assinatura que você está procurando não existe ou foi removida.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/app/subscriptions")}>Voltar para lista</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <main className="container mx-auto py-8">
      <div className="mb-8 gap-2">
        <TypographyH1>{subscriptionData.name}</TypographyH1>
        <TypographyMuted>{subscriptionData.description}</TypographyMuted>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Geral
          </TabsTrigger>
          <TabsTrigger value="members" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Membros
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configurações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <GeneralTab
            subscriptionData={subscriptionData}
            subscriptionPassword={subscriptionAccount?.[0]}
            isCurrentUserAllowed={allowedUsers.some((au) => au.userId === currentUser?.id)}
          />
        </TabsContent>

        <TabsContent value="members" className="space-y-4">
          <MembersTab />
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <SettingsTab />
        </TabsContent>
      </Tabs>
    </main>
  )
}

function GeneralTab({
  subscriptionData,
  subscriptionPassword,
  isCurrentUserAllowed,
}: {
  subscriptionData: Subscription
  subscriptionPassword?: { subscriptionId: string; encryptedPassword: string }
  isCurrentUserAllowed: boolean
}) {
  const [showPassword, setShowPassword] = useState(false)
  const totalPrice = subscriptionData.princeInCents / 100
  const membersCount = subscriptionData.maxMembers
  const pricePerPerson = totalPrice / membersCount
  // TODO: Implementar cálculo real de economia baseado no preço individual do serviço
  const savings = totalPrice - pricePerPerson
  const formatter = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  })

  return (
    <div className="space-y-4">
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Dia de Cobrança</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Dia {subscriptionData.renewalDay}</div>
            <p className="text-xs text-muted-foreground mt-1">Próxima cobrança em __DD/MM/YYYY__</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Por Pessoa</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatter.format(pricePerPerson)}</div>
            <p className="text-xs text-muted-foreground mt-1">Dividido entre ___{membersCount} membros ativos___</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">__Economia Mensal__</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{formatter.format(savings)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              __Comparado ao preço individual de {formatter.format(totalPrice)}__
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">__Economia Anual__</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{formatter.format(savings * 12)}</div>
            <p className="text-xs text-muted-foreground mt-1">__Total economizado por ano (projeção)__</p>
          </CardContent>
        </Card>
      </div>

      {subscriptionPassword && isCurrentUserAllowed && (
        <Card>
          <CardHeader>
            <CardTitle>Senha da Assinatura</CardTitle>
            <CardDescription>
              Esta é a senha compartilhada para acessar o serviço. Guarde-a em um local seguro.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Input
                type={showPassword ? "text" : "password"}
                value={subscriptionPassword.encryptedPassword}
                readOnly
                className="font-mono"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>__Atividade Recente__</CardTitle>
          <CardDescription>Histórico de atividades da assinatura</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-muted-foreground">__Nenhuma atividade registrada__</div>
        </CardContent>
      </Card>
    </div>
  )
}

function MembersTab() {
  const { id } = useParams()
  const z = useZero<Schema>()
  const [subscription] = useQuery(z.query.subscription.where((q) => q.cmp("id", "=", id!)))
  const subscriptionData = subscription[0] as Subscription | undefined
  const [users] = useQuery(z.query.user)
  const [allowedUsers] = useQuery(z.query.usersAllowedInASubscription.where((q) => q.cmp("subscriptionId", "=", id!)))

  const handleRemoveMember = async (userId: string) => {
    try {
      await z.mutate.usersAllowedInASubscription.delete({
        subscriptionId: id!,
        userId,
      })
      toast.success("Membro removido com sucesso")
    } catch (error) {
      console.error(error)
      toast.error("Erro ao remover membro", {
        description: "Ocorreu um erro ao remover o membro. Por favor, tente novamente.",
      })
    }
  }

  const handleInvite = async (data: InviteForm) => {
    try {
      // Check if user exists
      const user = users.find((u) => u.email === data.email)
      if (!user) {
        toast.error("Usuário não encontrado", {
          description: "O email informado não está cadastrado no sistema.",
        })
        return
      }

      // Check if user is already a member
      const isAlreadyMember = allowedUsers.some((au) => au.userId === user.id)
      if (isAlreadyMember) {
        toast.error("Usuário já é membro", {
          description: "O usuário já é membro desta assinatura.",
        })
        return
      }

      // Add user to subscription
      await z.mutate.usersAllowedInASubscription.insert({
        id: uuidv4(),
        subscriptionId: id!,
        userId: user.id,
      })

      toast.success("Convite enviado com sucesso")
    } catch (error) {
      console.error(error)
      toast.error("Erro ao enviar convite", {
        description: "Ocorreu um erro ao enviar o convite. Por favor, tente novamente.",
      })
    }
  }
  const { user: currentUser } = useUser()
  const inviteForm = useForm<InviteForm>({
    defaultValues: {
      email: "",
    },
  })

  const currentUserAllowed = allowedUsers.some((au) => au.userId === currentUser?.id)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Membros</CardTitle>
          <CardDescription>Gerenciar membros da assinatura</CardDescription>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Convidar Membro
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Convidar Membro</DialogTitle>
              <DialogDescription>Envie um convite para um novo membro participar da assinatura.</DialogDescription>
            </DialogHeader>

            <FormProvider {...inviteForm}>
              <form onSubmit={inviteForm.handleSubmit(handleInvite)} className="space-y-4">
                <ControlledInput
                  name="email"
                  label="Email"
                  placeholder="Digite o email do novo membro"
                  schema={inviteSchema.shape.email}
                />
                <DialogFooter>
                  <Button type="submit">Enviar Convite</Button>
                </DialogFooter>
              </form>
            </FormProvider>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Função</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allowedUsers.map((allowedUser) => {
              const user = users.find((u) => u.id === allowedUser.userId)
              const isOwner = user?.id === subscriptionData?.ownerId
              const isCurrentUser = user?.id === currentUser?.id

              if (!user) return null

              return (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    {isOwner ? (
                      <div className="flex items-center gap-1 text-primary">
                        <Crown className="h-4 w-4" />
                        <span>Dono</span>
                      </div>
                    ) : isCurrentUser ? (
                      <span className="text-muted-foreground">Você</span>
                    ) : (
                      <span className="text-muted-foreground">Membro</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {!isOwner && !isCurrentUser && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() => handleRemoveMember(user.id)}
                      >
                        Remover
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

function SettingsTab() {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState("")
  const settingsForm = useForm<SettingsForm>()
  const { id } = useParams()
  const navigate = useNavigate()
  const z = useZero<Schema>()
  const [subscription] = useQuery(z.query.subscription.where((q) => q.cmp("id", "=", id!)))
  const subscriptionData = subscription[0] as Subscription | undefined

  const handleDelete = async () => {
    try {
      await z.mutate.subscription.delete({ id: id! })
      toast.success("Assinatura excluída com sucesso")
      navigate("/app/subscriptions")
    } catch (error) {
      console.error(error)
      toast.error("Erro ao excluir assinatura", {
        description: "Ocorreu um erro ao excluir sua assinatura. Por favor, tente novamente.",
      })
    }
  }

  const handleUpdateSettings = async (data: SettingsForm) => {
    try {
      const result = settingsSchema.safeParse(data)
      if (!result.success) {
        toast.error("Dados inválidos", {
          description: "Por favor, verifique os campos e tente novamente.",
        })
        return
      }

      const { name, description, maxMembers, princeInCents, renewalDay } = result.data
      await z.mutate.subscription.update({
        id: id!,
        name,
        description: description || null,
        maxMembers,
        princeInCents,
        renewalDay,
      })
      toast.success("Configurações atualizadas com sucesso")
    } catch (error) {
      console.error(error)
      toast.error("Erro ao atualizar configurações", {
        description: "Ocorreu um erro ao atualizar as configurações. Por favor, tente novamente.",
      })
    }
  }

  useEffect(() => {
    if (subscriptionData) {
      settingsForm.reset({
        name: subscriptionData.name,
        description: subscriptionData.description ?? "",
        maxMembers: subscriptionData.maxMembers.toString(),
        princeInCents: new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(subscriptionData.princeInCents / 100),
        renewalDay: subscriptionData.renewalDay.toString(),
      })
    }
  }, [subscriptionData])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurações</CardTitle>
        <CardDescription>Gerenciar configurações da assinatura</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          <TypographyH2>Informações Básicas</TypographyH2>
          <FormProvider {...settingsForm}>
            <form onSubmit={settingsForm.handleSubmit(handleUpdateSettings)} className="space-y-4">
              <ControlledInput
                name="name"
                label="Nome"
                placeholder="Nome da assinatura"
                schema={settingsSchema.shape.name}
              />

              <ControlledInput
                name="description"
                label="Descrição"
                placeholder="Descrição da assinatura"
                schema={settingsSchema.shape.description}
              />

              <ControlledInput
                name="maxMembers"
                label="Número máximo de membros"
                type="number"
                min={1}
                max={16}
                placeholder="Entre 1 e 16 membros"
                schema={settingsSchema.shape.maxMembers}
              />

              <ControlledInput
                name="princeInCents"
                label="Valor total"
                placeholder="R$ 0,00"
                schema={settingsSchema.shape.princeInCents}
                numeric
                thousandSeparator="."
                decimalSeparator=","
                prefix="R$ "
                decimalScale={2}
                fixedDecimalScale
              />

              <ControlledInput
                name="renewalDay"
                label="Dia de renovação"
                type="number"
                min={1}
                max={31}
                placeholder="Entre 1º e 31º"
                schema={settingsSchema.shape.renewalDay}
              />

              <Button type="submit">Salvar Alterações</Button>
            </form>
          </FormProvider>
        </div>

        <div className="space-y-2">
          <TypographyH2 className="text-destructive">Zona de Perigo</TypographyH2>
          <Button variant="destructive" className="flex items-center gap-2" onClick={() => setShowDeleteDialog(true)}>
            <Trash2 className="h-4 w-4" />
            Excluir Assinatura
          </Button>

          <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                <AlertDialogDescription className="space-y-4">
                  <p>
                    Esta ação não pode ser desfeita. Isso irá excluir permanentemente a assinatura
                    <span className="font-medium"> {subscriptionData?.name}</span> e remover todos os dados associados.
                  </p>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Para confirmar, digite o nome da assinatura:{" "}
                      <span className="font-medium">{subscriptionData?.name}</span>
                    </p>
                    <Input
                      value={deleteConfirmation}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDeleteConfirmation(e.target.value)}
                      placeholder="Digite o nome da assinatura"
                    />
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deleteConfirmation !== subscriptionData?.name}
                >
                  Excluir Assinatura
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  )
}

type InviteForm = z.infer<typeof inviteSchema>
type SettingsForm = {
  name: string
  description: string
  maxMembers: string
  princeInCents: string
  renewalDay: string
}
const inviteSchema = z.object({
  email: z.string().email("Email inválido"),
})

const settingsSchema = z.object({
  name: z.string().min(1, "O nome é obrigatório"),
  description: z.string().optional(),
  maxMembers: z
    .string()
    .transform((val) => parseInt(val))
    .refine((val) => val >= 1 && val <= 16, "O número de membros deve estar entre 1 e 16"),
  princeInCents: z
    .string()
    .transform((val) => Number(val.replace(/\D/g, "")))
    .refine((val) => val > 0, "O valor deve ser maior que zero"),
  renewalDay: z
    .string()
    .transform((val) => parseInt(val))
    .refine((val) => val >= 1 && val <= 31, "O dia de renovação deve estar entre 1º e 31º"),
})
