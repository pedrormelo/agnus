"use client"

import { Button } from "@/components/ui/button"
import { HomeIcon as House, PenTool, Wrench, LayoutDashboard, ChevronLeft } from "lucide-react"
import { useTheme } from "@/app/contexts/ThemeContext"
import React, { useMemo } from "react"
import Image from "next/image"

interface SidebarMenuProps {
  isOpen: boolean
  onClose: () => void
  onNavigate: (page: string, data?: any) => void
  currentPage?: string
}

// Deer/Stag SVG Icon
const DeerIcon = React.memo(() => (
  <div className="w-34 h-34 rounded-lg p-2 flex items-center justify-center shadow-lg">
    <Image src="/lamb.svg" alt="Deer Icon" width={70} height={70} />
  </div>
))

// QR Code SVG with proper gradient
const QRCode = React.memo(() => (
  <div className="w-34 h-34 rounded-lg p-2 flex items-center justify-center shadow-lg">
    <Image src="/qr-code.svg" alt="QR Code" width={120} height={120} />
  </div>
))

export function SidebarMenu({ isOpen, onClose, onNavigate, currentPage = "home" }: SidebarMenuProps) {
  const { theme, toggleTheme } = useTheme()

  // Memoize menuItems
  const menuItems = useMemo(
    () => [
      {
        id: "HOME",
        label: "HOME",
        icon: House,
        page: "home",
      },
      {
        id: "REGISTRO",
        label: "REGISTRO",
        icon: PenTool,
        page: "registro",
      },
      {
        id: "TECNICOS",
        label: "TÉCNICOS",
        icon: Wrench,
        page: "tecnicos",
      },
      {
        id: "DASHBOARD",
        label: "DASHBOARD",
        icon: LayoutDashboard,
        page: "dashboard",
      },
    ],
    []
  )

  // Derive activeItem from currentPage
  const pageToMenuMap: { [key: string]: string } = {
    home: "HOME",
    registro: "REGISTRO",
    tecnicos: "TECNICOS",
    dashboard: "DASHBOARD",
    detalhes: "HOME",
  }
  const activeItem = pageToMenuMap[currentPage] || "HOME"

  const handleMenuClick = (item: any) => {
    onNavigate(item.page)
    onClose()
  }

  return (
    <>
      {/* Overlay */}
      {isOpen && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={onClose} />}

      {/* Sidebar */}
      <div
        className={`
          fixed top-0 left-0 h-full w-72 
          bg-gradient-to-b from-[#0C0C0C] via-[#1A1A1A] to-[#0C0C0C]
          z-50 transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          flex flex-col font-abel shadow-2xl border-r border-[#E9A870]/20
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#E9A870]/10">
          <DeerIcon />
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-[#E0CAA5] hover:bg-gradient-to-r hover:from-[#E9A870]/20 hover:to-[#A8784F]/20 w-8 h-8 rounded-lg transition-all duration-200"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation Menu - Centered */}
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="space-y-4 w-full max-w-[200px]">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleMenuClick(item)}
                className={`
                  w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl font-medium text-sm
                  transition-all duration-300 transform hover:scale-105
                  ${
                    activeItem === item.id
                      ? "bg-gradient-to-r from-[#E9A870] to-[#A8784F] text-black shadow-lg shadow-[#E9A870]/25"
                      : "bg-[#3D3024] text-[#E0CAA5] hover:bg-[#4D4034] hover:shadow-md"
                  }
                `}
              >
                <item.icon className={`h-5 w-5 ${item.id === "TECNICOS" ? "stroke-[2.5]" : ""}`} />
                <span className="tracking-wide">{item.label}</span>
              </button>
            ))}
            <div className="mt-6 pt-4 border-t border-[#E9A870]/20">
              <button
                onClick={toggleTheme}
                className={`
                  w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl font-medium text-sm
                  transition-all duration-300 transform hover:scale-105
                  bg-[#3D3024] text-[#E0CAA5] hover:bg-[#4D4034] hover:shadow-md
                `}
              >
                {theme === "dark" ? (
                  <>
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                    <span className="tracking-wide">Light Mode</span>
                  </>
                ) : (
                  <>
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                      />
                    </svg>
                    <span className="tracking-wide">Dark Mode</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Footer with QR Code and gradient background */}
        <div className="p-6 flex flex-col items-center bg-gradient-to-t from-[#2A231E] via-[#1A1A1A] to-transparent rounded-t-2xl">
          <QRCode />
          <div className="mt-4 text-center bg-gradient-to-b from-[#E9A870] to-[#A8784F] bg-clip-text text-transparent">
            <p className="text-xs leading-relaxed font-medium">
              AGNUS - GETI DA SEC. DE SAÚDE -<br />
              JABOATÃO DOS GUARARAPES - JUNHO DE
              <br />
              2025 - VER: 4.2
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
