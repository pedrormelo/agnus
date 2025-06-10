"use client"

import type React from "react"
import { Abel, Afacad } from "next/font/google"
import "./globals.css"
import { useState } from "react"
import Dashboard from "./page"
import Registro from "./registro/page"
import DetalhesRegistro from "./detalhes/page"
import Tecnicos from "./tecnicos/page"
import DashboardPage from "./dashboard/page"
import { ThemeProvider } from "./contexts/ThemeContext"

const abel = Abel({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-abel",
})

const afacad = Afacad({
  subsets: ["latin"],
  variable: "--font-afacad",
})

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [currentPage, setCurrentPage] = useState("home")
  const [pageData, setPageData] = useState<any>(null)

  const handleNavigate = (page: string, data?: any) => {
    setCurrentPage(page)
    setPageData(data)
  }

  const renderPage = () => {
    switch (currentPage) {
      case "home":
        return <Dashboard onNavigate={handleNavigate} />
      case "registro":
        return <Registro onNavigate={handleNavigate} />
      case "detalhes":
        return <DetalhesRegistro onNavigate={handleNavigate} data={pageData} />
      case "tecnicos":
        return <Tecnicos onNavigate={handleNavigate} data={pageData} />
      case "dashboard":
        return <DashboardPage onNavigate={handleNavigate} />
      default:
        return <Dashboard onNavigate={handleNavigate} />
    }
  }

  return (
    <html lang="en">
      <body className={`${abel.variable} ${afacad.variable} antialiased`}>
        <ThemeProvider>{renderPage()}</ThemeProvider>
      </body>
    </html>
  )
}
