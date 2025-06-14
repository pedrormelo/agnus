import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "AGNUS",
  description: "Controle de Entradas e Saídas de Ativos da GTI",
}

import ClientLayout from "./ClientLayout"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ClientLayout>{children}</ClientLayout>
}
