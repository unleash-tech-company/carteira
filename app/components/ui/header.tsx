"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import { SignedIn, SignedOut, UserButton, useUser } from "@clerk/react-router"
import { Menu, MoveRight, User, X } from "lucide-react"
import { useState } from "react"
import { Link } from "react-router"

export function Header() {
  const { user } = useUser()
  const navigationItems = [
    {
      title: "Home",
      href: "/",
      description: "",
    },
    {
      title: "Serviços",
      description: "Explore todos os serviços disponíveis para compartilhamento.",
      items: [
        {
          title: "Streaming",
          href: "/servicos/streaming",
          description: "Netflix, Disney+, Prime Video e mais",
        },
        {
          title: "Educação",
          href: "/servicos/educacao",
          description: "Udemy, Coursera, Skillshare e outros",
        },
        {
          title: "Música",
          href: "/servicos/musica",
          description: "Spotify, Apple Music, YouTube Music",
        },
        {
          title: "Ver Todos",
          href: "/servicos",
          description: "Explore nossa lista completa de serviços",
        },
      ],
    },
    {
      title: "Como Funciona",
      description: "Entenda como você pode economizar ou lucrar compartilhando assinaturas.",
      items: [
        {
          title: "Para Economizar",
          href: "/como-funciona/economia",
          description: "Aprenda a dividir custos e economizar",
        },
        {
          title: "Para Lucrar",
          href: "/como-funciona/monetizacao",
          description: "Transforme suas assinaturas em renda extra",
        },
        {
          title: "Segurança",
          href: "/como-funciona/seguranca",
          description: "Como mantemos suas senhas protegidas",
        },
        {
          title: "FAQ",
          href: "/como-funciona/faq",
          description: "Dúvidas frequentes",
        },
      ],
    },
  ]

  const [isOpen, setOpen] = useState(false)
  return (
    <header className="w-full z-40 fixed top-0 left-0 bg-background">
      <div className="container relative mx-auto min-h-20 flex gap-4 flex-row items-center">
        <div className="justify-start items-center gap-4 lg:flex hidden flex-row">
          <NavigationMenu className="flex justify-start items-start">
            <NavigationMenuList className="flex justify-start gap-4 flex-row">
              <NavigationMenuItem>
                <NavigationMenuLink>
                  <Link to="/">
                    <Button variant="ghost" className="font-mono">
                      carteira.app
                    </Button>
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              {navigationItems.map((item) => (
                <NavigationMenuItem key={item.title}>
                  {item.href ? (
                    <>
                      <NavigationMenuLink>
                        <Button variant="ghost">{item.title}</Button>
                      </NavigationMenuLink>
                    </>
                  ) : (
                    <>
                      <NavigationMenuTrigger className="font-medium text-sm">{item.title}</NavigationMenuTrigger>
                      <NavigationMenuContent className="!w-[450px] p-4">
                        <div className="flex flex-col lg:grid grid-cols-2 gap-4">
                          <div className="flex flex-col h-full justify-between">
                            <div className="flex flex-col">
                              <p className="text-base">{item.title}</p>
                              <p className="text-muted-foreground text-sm">{item.description}</p>
                            </div>
                            <Button size="sm" className="mt-10" asChild>
                              <Link to={item.items?.[0].href || "/"}>Explorar {item.title.toLowerCase()}</Link>
                            </Button>
                          </div>
                          <div className="flex flex-col text-sm h-full justify-end">
                            {item.items?.map((subItem) => (
                              <NavigationMenuLink
                                key={subItem.title}
                                className="flex flex-row justify-between items-center hover:bg-muted py-2 px-4 rounded group"
                              >
                                <Link to={subItem.href} className="flex flex-col flex-1">
                                  <span className="font-medium">{subItem.title}</span>
                                  {subItem.description && (
                                    <span className="text-muted-foreground text-xs">{subItem.description}</span>
                                  )}
                                </Link>
                                <MoveRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                              </NavigationMenuLink>
                            ))}
                          </div>
                        </div>
                      </NavigationMenuContent>
                    </>
                  )}
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </div>
        <div className="flex justify-end w-full gap-4">
          <SignedIn>
            <Button variant="ghost" className="hidden md:inline" asChild>
              <Link to="/dashboard">Meu Dashboard</Link>
            </Button>
            <div className="border-r hidden md:inline"></div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user?.imageUrl} alt={user?.fullName || ""} />
                    <AvatarFallback>
                      <User className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.fullName}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.primaryEmailAddress?.emailAddress}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/dashboard">Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/perfil">Perfil</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/minhas-assinaturas">Minhas Assinaturas</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <UserButton afterSignOutUrl="/" />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SignedIn>
          <SignedOut>
            <Button variant="ghost" className="hidden md:inline" asChild>
              <Link to="/explorar">Explorar Serviços</Link>
            </Button>
            <div className="border-r hidden md:inline"></div>
            <Button variant="outline" asChild>
              <Link to="/entrar">Entrar</Link>
            </Button>
            <Button asChild>
              <Link to="/cadastro">Começar Grátis</Link>
            </Button>
          </SignedOut>
        </div>
        <div className="flex w-12 shrink lg:hidden items-end justify-end">
          <Button variant="ghost" onClick={() => setOpen(!isOpen)}>
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
          {isOpen && (
            <div className="absolute top-20 border-t flex flex-col w-full right-0 bg-background shadow-lg py-4 container gap-8">
              {navigationItems.map((item) => (
                <div key={item.title}>
                  <div className="flex flex-col gap-2">
                    {item.href ? (
                      <Link to={item.href} className="flex justify-between items-center">
                        <span className="text-lg">{item.title}</span>
                        <MoveRight className="w-4 h-4 stroke-1 text-muted-foreground" />
                      </Link>
                    ) : (
                      <>
                        <p className="text-lg">{item.title}</p>
                        <div className="flex flex-col gap-1">
                          {item.items?.map((subItem) => (
                            <Link
                              key={subItem.title}
                              to={subItem.href}
                              className="flex flex-col hover:bg-muted p-2 rounded-md group"
                            >
                              <span className="font-medium">{subItem.title}</span>
                              {subItem.description && (
                                <span className="text-sm text-muted-foreground">{subItem.description}</span>
                              )}
                            </Link>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
              <SignedIn>
                <div className="flex flex-col gap-2 pt-4 border-t">
                  <Button variant="outline" asChild className="w-full">
                    <Link to="/dashboard">Meu Dashboard</Link>
                  </Button>
                  <Button variant="outline" asChild className="w-full">
                    <Link to="/perfil">Meu Perfil</Link>
                  </Button>
                  <Button variant="outline" asChild className="w-full">
                    <Link to="/minhas-assinaturas">Minhas Assinaturas</Link>
                  </Button>
                  <UserButton afterSignOutUrl="/" />
                </div>
              </SignedIn>
              <SignedOut>
                <div className="flex flex-col gap-2 pt-4 border-t">
                  <Button variant="outline" asChild className="w-full">
                    <Link to="/entrar">Entrar</Link>
                  </Button>
                  <Button asChild className="w-full">
                    <Link to="/cadastro">Começar Grátis</Link>
                  </Button>
                </div>
              </SignedOut>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
