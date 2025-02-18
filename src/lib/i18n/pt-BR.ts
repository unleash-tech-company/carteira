export const ptBR = {
  auth: {
    backToHome: "Voltar para o início",
    signIn: {
      title: "Bem-vindo de volta",
      subtitle: "Escolha como deseja entrar",
      noAccount: "Ainda não tem uma conta?",
      signUpAction: "Criar conta",
    },
    signUp: {
      title: "Criar uma conta",
      subtitle: "Escolha como deseja criar sua conta",
      hasAccount: "Já tem uma conta?",
      signInAction: "Entrar",
    },
    errors: {
      multipleSessions: "Detectamos sessões adicionais, você foi desconectado",
    },
  },
} as const

export type Locale = typeof ptBR 