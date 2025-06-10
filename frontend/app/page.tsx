"use client"

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react"
import debounce from "lodash.debounce"

import { Button } from "@/components/ui/button"
import {
  Menu,
  Plus,
  Filter,
  Eye,
  Edit,
  Trash2,
  Search,
  Bell,
  Home,
  ChevronRight,
  X,
  Clock,
  AlertTriangle,
  CheckCircle,
  Check,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { cn } from "@/lib/utils"
import { SidebarMenu } from "@/components/sidebar-menu"
import { toast, Toaster } from "sonner"

// Mock data for computers
const mockComputers = [
  {
    id: "O1",
    tombamento: "202259123",
    status: "ENTRADA",
    statusColor: "red",
    unidade: "USF RIO DAS VELHAS II",
    priority: "high",
    timestamp: "2h atrás",
    tecnico: "João Silva",
    ambiente: "MÉDICO",
    tipo: "DESKTOP",
    descricao: "Computador não liga",
  },
  {
    id: "O2",
    tombamento: "202259124",
    status: "SAÍDA",
    statusColor: "green",
    unidade: "USF QUADROS III",
    priority: "normal",
    timestamp: "1h atrás",
    tecnico: "Maria Santos",
    ambiente: "RECEPÇÃO",
    tipo: "NOTEBOOK",
    descricao: "Problema no teclado",
  },
  {
    id: "O3",
    tombamento: "202259125",
    status: "PRONTO",
    statusColor: "blue",
    unidade: "USF VIETNÃ",
    priority: "normal",
    timestamp: "30min atrás",
    tecnico: "Pedro Costa",
    ambiente: "ENFERMARIA",
    tipo: "DESKTOP",
    descricao: "Lentidão no sistema",
  },
  {
    id: "O4",
    tombamento: "202259126",
    status: "ENTRADA",
    statusColor: "red",
    unidade: "USF RIO DAS VELHAS II",
    priority: "urgent",
    timestamp: "15min atrás",
    tecnico: "Ana Lima",
    ambiente: "LABORATÓRIO",
    tipo: "DESKTOP",
    descricao: "Tela azul frequente",
  },
]

interface DashboardProps {
  onNavigate: (page: string, data?: any) => void
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const [activeTab, setActiveTab] = useState("TODOS")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredComputers, setFilteredComputers] = useState(mockComputers)
  const [isLoading, setIsLoading] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [unidadeFilter, setUnidadeFilter] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [computerToDelete, setComputerToDelete] = useState<any>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Notifications state
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "Novo computador adicionado",
      time: "Agora mesmo",
      read: false,
      type: "info",
    },
    {
      id: 2,
      title: "Manutenção concluída",
      time: "5 minutos atrás",
      read: false,
      type: "success",
    },
    {
      id: 3,
      title: "Alerta de sistema",
      time: "1 hora atrás",
      read: true,
      type: "warning",
    },
    {
      id: 4,
      title: "Técnico João Silva finalizou reparo",
      time: "2 horas atrás",
      read: false,
      type: "success",
    },
    {
      id: 5,
      title: "USF Centro com alta demanda",
      time: "3 horas atrás",
      read: true,
      type: "warning",
    },
  ])

  const tabs = ["TODOS", "RECOLHIDOS", "ENTREGUES"]
  const readyItems = [
    { text: "MÉDICO - USF RIO DAS VELHAS II", id: "O5", tombamento: "202259127", timestamp: "Pronto há 2h" },
    { text: "ENFERMEIRA - USF QUADROS III", id: "O6", tombamento: "202259128", timestamp: "Pronto há 1h" },
    { text: "RECEPÇÃO - USF VIETNÃ", id: "O7", tombamento: "202259129", timestamp: "Pronto há 30min" },
  ]

  // Handle search
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [searchOpen])

  // Debounced search handler
  const [debouncedSearch, setDebouncedSearch] = useState("")

  // Debounce searchQuery updates
  const debouncedSetSearch = useMemo(
    () => debounce((value: string) => setDebouncedSearch(value), 300),
    [],
  )

  useEffect(() => {
    debouncedSetSearch(searchQuery)
    return () => debouncedSetSearch.cancel()
  }, [searchQuery, debouncedSetSearch])

  // Memoized handlers
  const handleRowClick = useCallback(
    (computer: any) => {
      onNavigate("detalhes", computer)
    },
    [onNavigate],
  )

  const handleTecnicoClick = useCallback(
    (tecnico: string, e: React.MouseEvent) => {
      e.stopPropagation()
      onNavigate("tecnicos", { selectedTecnico: tecnico })
    },
    [onNavigate],
  )

  const handleDeleteClick = useCallback(
    (computer: any, e: React.MouseEvent) => {
      e.stopPropagation()
      setComputerToDelete(computer)
      setDeleteDialogOpen(true)
    },
    [],
  )

  // Filter computers based on search, status, and unidade
  useEffect(() => {
    if (debouncedSearch || statusFilter || unidadeFilter || activeTab !== "TODOS") {
      setIsLoading(true)
      const timer = setTimeout(() => {
        let filtered = mockComputers

        // Apply search filter
        if (debouncedSearch) {
          filtered = filtered.filter(
            (computer) =>
              computer.id.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
              computer.tombamento.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
              computer.unidade.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
              computer.status.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
              computer.tecnico.toLowerCase().includes(debouncedSearch.toLowerCase()),
          )
        }

        // Apply status filter
        if (statusFilter) {
          filtered = filtered.filter((computer) => computer.status === statusFilter)
        }

        // Apply unidade filter
        if (unidadeFilter) {
          filtered = filtered.filter((computer) => computer.unidade === unidadeFilter)
        }

        // Apply tab filter
        if (activeTab === "RECOLHIDOS") {
          filtered = filtered.filter((computer) => computer.status === "ENTRADA")
        } else if (activeTab === "ENTREGUES") {
          filtered = filtered.filter((computer) => computer.status === "SAÍDA")
        }

        setFilteredComputers(filtered)
        setIsLoading(false)
      }, 0)
      return () => clearTimeout(timer)
    } else {
      setFilteredComputers(mockComputers)
      setIsLoading(false)
    }
  }, [debouncedSearch, statusFilter, unidadeFilter, activeTab])

  // Notification functions
  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })))
    toast.success("Todas as notificações foram marcadas como lidas", {
      duration: 3000,
      position: "top-right",
    })
  }

  const clearAllNotifications = () => {
    setNotifications([])
    toast.success("Todas as notificações foram removidas", {
      duration: 3000,
      position: "top-right",
    })
  }

  const markAsRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
    )
  }

  // Get unread notifications count
  const unreadCount = notifications.filter((n) => !n.read).length

  // Get status LED color and icon
  const getStatusIndicator = (status: string, priority?: string) => {
    const baseClasses = "w-3 h-3 rounded-full shadow-sm"
    let ledColor = ""
    let icon = null
    const pulseClass = ""

    switch (status) {
      case "ENTRADA":
        ledColor = "bg-red-500"
        icon = <Clock className="h-3 w-3 text-red-400" />
        break
      case "SAÍDA":
        ledColor = "bg-green-500"
        icon = <CheckCircle className="h-3 w-3 text-green-400" />
        break
      case "PRONTO":
        ledColor = "bg-blue-600"
        icon = <AlertTriangle className="h-3 w-3 text-blue-400" />
        break
      default:
        ledColor = "bg-gray-500"
    }

    return { ledColor, icon, pulseClass, baseClasses }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-400" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-400" />
      case "info":
        return <Bell className="h-4 w-4 text-blue-400" />
      default:
        return <Bell className="h-4 w-4 text-gray-400" />
    }
  }

  // Clear all filters
  const clearFilters = () => {
    setStatusFilter(null)
    setUnidadeFilter(null)
    setSearchQuery("")
    setActiveTab("TODOS")
  }

  // Memoized TableSkeleton
  const TableSkeletonComponent = () => (
    <div className="space-y-4 p-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="grid grid-cols-5 gap-6 items-center animate-pulse">
          <div className="h-4 bg-gradient-to-r from-gray-700 to-gray-600 rounded"></div>
          <div className="h-4 bg-gradient-to-r from-gray-700 to-gray-600 rounded"></div>
          <div className="h-4 bg-gradient-to-r from-gray-700 to-gray-600 rounded"></div>
          <div className="h-4 bg-gradient-to-r from-gray-700 to-gray-600 rounded"></div>
          <div className="flex gap-2">
            <div className="h-6 w-6 bg-gradient-to-r from-gray-700 to-gray-600 rounded"></div>
            <div className="h-6 w-6 bg-gradient-to-r from-gray-700 to-gray-600 rounded"></div>
            <div className="h-6 w-6 bg-gradient-to-r from-gray-700 to-gray-600 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  )
  const TableSkeleton = useMemo(() => React.memo(TableSkeletonComponent), [])

  const confirmDelete = () => {
    if (computerToDelete) {
      toast.success(`Registro ${computerToDelete.tombamento} foi excluído com sucesso`, {
        duration: 3000,
        position: "top-right",
      })
      setDeleteDialogOpen(false)
      setComputerToDelete(null)
    }
  }

  // Memoize sidebar handlers to avoid unnecessary re-renders
  const handleSidebarClose = useCallback(() => setSidebarOpen(false), [])
  const handleSidebarNavigate = useCallback((page: string, data?: any) => onNavigate(page, data), [onNavigate])

  return (
    <div className="min-h-screen bg-[#191818] text-white transition-all duration-500 flex flex-col">
      {/* Toaster for notifications */}
      <Toaster
        theme="dark"
        position="top-right"
        toastOptions={{
          style: {
            background: "#1C1815",
            border: "1px solid #E9A870",
            color: "#E0CAA5",
          },
        }}
      />

      {/* Sidebar Menu */}
      <SidebarMenu
        isOpen={sidebarOpen}
        onClose={handleSidebarClose}
        onNavigate={handleSidebarNavigate}
        currentPage="home"
      />

      {/* Header - Fixed/Sticky */}
      <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 bg-[#0C0C0C] border-b border-[#E9A870] shadow-lg backdrop-blur-sm transition-all duration-300">
        <div className="flex items-center gap-6">
          <Button
            variant="ghost"
            size="icon"
            className="text-[#E0CAA5] hover:bg-gradient-to-r hover:from-[#E9A870]/20 hover:to-[#A8784F]/20 transition-all duration-200 hover:scale-110"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </Button>
          <h1 className="text-[42px] font-abel text-[#E0CAA5] tracking-wider drop-shadow-sm hover:drop-shadow-lg transition-all duration-300">
            AGNUS
          </h1>

          {/* Breadcrumbs */}
          <div className="flex items-center text-sm text-gray-400 ml-6">
            <Button
              variant="link"
              className="p-0 h-auto text-[#E0CAA5] hover:text-[#E9A870] transition-colors font-arial"
            >
              <Home className="h-4 w-4 mr-1" />
              <span>Início</span>
            </Button>
            <ChevronRight className="h-3 w-3 mx-2 text-gray-500" />
            <span className="text-gray-400 font-arial">Computadores</span>
          </div>
        </div>

        {/* Notifications */}
        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative text-[#E0CAA5] hover:bg-gradient-to-r hover:from-[#E9A870]/20 hover:to-[#A8784F]/20 transition-all duration-200 hover:scale-110"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-red-500 to-red-600 rounded-full text-sm font-bold flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-80 bg-gradient-to-b from-[#1C1815] to-[#1C1815] border-[#3D3024] text-white shadow-xl backdrop-blur-sm animate-in slide-in-from-top-2 duration-200 max-h-96 overflow-y-auto custom-scroll"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#3D3024]">
                <span className="font-medium font-arial">Notificações</span>
                {unreadCount > 0 && (
                  <span className="text-sm bg-gradient-to-r from-[#E9A870] to-[#A8784F] text-black px-2 py-1 rounded-full font-arial">
                    {unreadCount} novas
                  </span>
                )}
              </div>

              {/* Action Buttons - Icons Only */}
              {notifications.length > 0 && (
                <div className="flex justify-center gap-4 px-4 py-3 border-b border-[#3D3024]">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={markAllAsRead}
                    className="h-8 w-8 text-[#E9A870] hover:bg-[#E9A870]/10 rounded-full"
                    disabled={unreadCount === 0}
                    title="Marcar todas como lidas"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={clearAllNotifications}
                    className="h-8 w-8 text-red-400 hover:bg-red-400/10 rounded-full"
                    title="Limpar notificações"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <DropdownMenuItem
                    key={notification.id}
                    className={`px-4 py-3 focus:bg-gradient-to-r focus:from-[#3D3024] focus:to-[#2a2a2a] focus:text-white transition-all duration-200 hover:translate-x-1 cursor-pointer ${
                      !notification.read ? "bg-[#E9A870]/5 border-l-2 border-l-[#E9A870]" : ""
                    }`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex items-start gap-3 w-full">
                      {getNotificationIcon(notification.type)}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span
                            className={`font-medium font-arial text-sm ${!notification.read ? "text-white" : "text-gray-300"}`}
                          >
                            {notification.title}
                          </span>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-[#E9A870] rounded-full flex-shrink-0"></div>
                          )}
                        </div>
                        <div className="text-sm text-gray-400 font-arial">{notification.time}</div>
                      </div>
                    </div>
                  </DropdownMenuItem>
                ))
              ) : (
                <div className="px-4 py-8 text-center text-gray-400">
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm font-arial">Nenhuma notificação</p>
                </div>
              )}

              {notifications.length > 0 && (
                <div className="p-2 text-center border-t border-[#3D3024]">
                  <Button
                    variant="link"
                    className="text-[#E9A870] hover:text-[#E0CAA5] text-sm w-full transition-colors font-arial"
                  >
                    Ver todas as notificações
                  </Button>
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="flex flex-1 min-h-0">
        {/* Main Content - Left Side */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="p-6 pb-0">
            <div className="mb-6">
              <div className="flex items-center gap-4 mb-2">
                <h2 className="text-[58px] font-afacad bg-gradient-to-r from-[#E9A870] via-[#E0CAA5] to-[#A8784F] bg-clip-text text-transparent font-semibold leading-tight drop-shadow-sm">
                  EQUIPAMENTOS
                </h2>
                {/* Plus Button to Register Page */}
                <Button
                  size="icon"
                  onClick={() => onNavigate("registro")}
                  className="bg-gradient-to-r from-[#3D3024] to-[#2a2a2a] hover:from-[#E9A870]/20 hover:to-[#A8784F]/20 rounded-full h-10 w-10 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 border border-[#E9A870]/20"
                >
                  <Plus className="h-5 w-5 text-[#E9A870]" />
                </Button>
              </div>
              <p className="text-[32px] font-afacad text-[#E0CAA5] mb-6 leading-tight opacity-90 hover:opacity-100 transition-opacity duration-300">
                MONITORAMENTO
              </p>

              {/* Filter and Tabs */}
              <div className="flex items-center gap-6 mb-6 relative">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="bg-[#3D3024] border-[#E9A870]/20 hover:bg-[#4D4034] rounded-lg h-10 w-10 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                    >
                      <Filter className="h-5 w-5 text-[#E9A870]" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="start"
                    className="w-56 bg-gradient-to-b from-[#1C1815] to-[#1C1815] border-[#3D3024] text-white shadow-xl backdrop-blur-sm animate-in slide-in-from-left-2 duration-200 custom-scroll"
                  >
                    <div className="px-3 py-2 text-sm font-medium border-b border-[#3D3024] font-arial">
                      Filtrar por
                    </div>
                    <DropdownMenuItem
                      className="focus:bg-gradient-to-r focus:from-[#3D3024] focus:to-[#2a2a2a] focus:text-white transition-all duration-200 hover:translate-x-1 font-arial"
                      onClick={() => setStatusFilter("ENTRADA")}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span>Status: ENTRADA</span>
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="focus:bg-gradient-to-r focus:from-[#3D3024] focus:to-[#2a2a2a] focus:text-white transition-all duration-200 hover:translate-x-1 font-arial"
                      onClick={() => setStatusFilter("SAÍDA")}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span>Status: SAÍDA</span>
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="focus:bg-gradient-to-r focus:from-[#3D3024] focus:to-[#2a2a2a] focus:text-white transition-all duration-200 hover:translate-x-1 font-arial"
                      onClick={() => setStatusFilter("PRONTO")}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span>Status: PRONTO</span>
                        <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="focus:bg-gradient-to-r focus:from-[#3D3024] focus:to-[#2a2a2a] focus:text-white transition-all duration-200 hover:translate-x-1 font-arial"
                      onClick={() => setUnidadeFilter("USF RIO DAS VELHAS II")}
                    >
                      Unidade: USF RIO DAS VELHAS II
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="focus:bg-gradient-to-r focus:from-[#3D3024] focus:to-[#2a2a2a] focus:text-white transition-all duration-200 hover:translate-x-1 font-arial"
                      onClick={() => setUnidadeFilter("USF QUADROS III")}
                    >
                      Unidade: USF QUADROS III
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="focus:bg-gradient-to-r focus:from-[#3D3024] focus:to-[#2a2a2a] focus:text-white transition-all duration-200 hover:translate-x-1 font-arial"
                      onClick={() => setUnidadeFilter("USF VIETNÃ")}
                    >
                      Unidade: USF VIETNÃ
                    </DropdownMenuItem>
                    <div className="px-3 py-2 mt-1 border-t border-[#3D3024] text-center">
                      <Button
                        variant="link"
                        onClick={clearFilters}
                        className="text-[#E9A870] hover:text-[#E0CAA5] text-sm w-full transition-colors font-arial"
                      >
                        Limpar filtros
                      </Button>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Expandable Search */}
                <div
                  className={cn(
                    "flex items-center transition-all duration-300 overflow-hidden",
                    searchOpen ? "w-64" : "w-10",
                  )}
                >
                  <div className="flex items-center bg-[#3D3024] rounded-lg overflow-hidden shadow-lg border border-[#E9A870]/20">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 bg-transparent hover:bg-gradient-to-r hover:from-[#E9A870]/20 hover:to-[#A8784F]/20 transition-all duration-200 hover:scale-110"
                      onClick={() => setSearchOpen(!searchOpen)}
                    >
                      {searchOpen ? (
                        <X className="h-5 w-5 text-[#E9A870]" />
                      ) : (
                        <Search className="h-5 w-5 text-[#E9A870]" />
                      )}
                    </Button>

                    <Input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Pesquisar..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={cn(
                        "h-10 bg-transparent border-0 focus-visible:ring-0 text-white placeholder:text-gray-400 font-arial",
                        "transition-all duration-300",
                        searchOpen ? "w-full opacity-100" : "w-0 opacity-0 p-0",
                      )}
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  {tabs.map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`text-base font-medium px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105 font-arial ${
                        activeTab === tab
                          ? "text-[#E9A870] bg-gradient-to-r from-[#1C1815] to-[#1C1815] shadow-md border border-[#E9A870]/20 scale-105"
                          : "text-[#E0CAA5] hover:bg-gradient-to-r hover:from-gray-800/30 hover:to-gray-700/30 hover:shadow-sm"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Table - Full Width with Edge-to-Edge Borders */}
          <div className="flex-1 px-6 pb-6">
            <div className="bg-[#1C1815] border-[#E9A870] border-2 rounded-xl overflow-hidden shadow-2xl backdrop-blur-sm hover:shadow-[#E9A870]/10 transition-all duration-300 h-full flex flex-col">
              <div className="bg-gradient-to-r from-[#E9A870] to-[#A8784F] p-0 flex-shrink-0">
                <div className="grid grid-cols-5 gap-6 px-6 py-4 text-black font-bold text-lg font-arial">
                  <div>TOMBAMENTO</div>
                  <div>STATUS</div>
                  <div>UNIDADE</div>
                  <div className="text-center">ID</div>
                  <div>AÇÕES</div>
                </div>
              </div>
              <div className="flex-1 bg-[#1C1815] custom-scroll overflow-y-auto">
                {isLoading ? (
                  <TableSkeleton />
                ) : filteredComputers.length > 0 ? (
                  filteredComputers.map((computer, index) => {
                    const { ledColor, icon, pulseClass, baseClasses } = getStatusIndicator(
                      computer.status,
                      computer.priority,
                    )
                    return (
                      <div
                        key={computer.id}
                        className="grid grid-cols-5 gap-6 px-6 py-4 border-b border-[#E9A870]/30 items-center hover:bg-gradient-to-r hover:from-gray-800/20 hover:to-gray-700/20 transition-all duration-300 group hover:scale-[1.01] hover:shadow-lg cursor-pointer"
                        style={{ animationDelay: `${index * 100}ms` }}
                        onClick={() => handleRowClick(computer)}
                      >
                        <div className="text-gray-300 group-hover:text-white transition-colors font-bold text-base font-abel">
                          {computer.tombamento}
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            {icon}
                            <span className="text-gray-300 text-sm font-arial">{computer.status}</span>
                          </div>
                          <div className={`${baseClasses} ${ledColor} ${pulseClass}`}></div>
                        </div>
                        <div className="text-gray-300 group-hover:text-white transition-colors font-bold text-base font-abel">
                          <button
                            onClick={(e) => handleTecnicoClick(computer.tecnico, e)}
                            className="hover:text-[#E9A870] transition-colors"
                          >
                            {computer.unidade}
                          </button>
                        </div>
                        <div className="text-gray-300 group-hover:text-white transition-colors text-center text-base font-abel">
                          {computer.id}
                        </div>
                        <div className="flex gap-3">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleRowClick(computer)
                            }}
                            className="h-8 w-8 hover:bg-gradient-to-r hover:from-gray-700/50 hover:to-gray-600/50 transition-all duration-200 hover:scale-110"
                          >
                            <Eye className="h-4 w-4 text-[#E0CAA5]" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => e.stopPropagation()}
                            className="h-8 w-8 hover:bg-gradient-to-r hover:from-gray-700/50 hover:to-gray-600/50 transition-all duration-200 hover:scale-110"
                          >
                            <Edit className="h-4 w-4 text-[#E0CAA5]" />
                          </Button>
                          <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => handleDeleteClick(computer, e)}
                                className="h-8 w-8 hover:bg-gradient-to-r hover:from-red-700/50 hover:to-red-600/50 transition-all duration-200 hover:scale-110"
                              >
                                <Trash2 className="h-4 w-4 text-red-400" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-[#1C1815] border-[#E9A870] text-white">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-[#E9A870] text-xl font-abel">
                                  Confirmar Exclusão
                                </AlertDialogTitle>
                                <AlertDialogDescription className="text-gray-300 font-arial">
                                  Tem certeza que deseja excluir o registro do computador{" "}
                                  <span className="font-bold text-white">{computerToDelete?.tombamento}</span>?
                                  <br />
                                  <span className="text-red-400 text-sm">Esta ação não pode ser desfeita.</span>
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="bg-gray-600 hover:bg-gray-700 text-white border-gray-500">
                                  Cancelar
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={confirmDelete}
                                  className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Excluir
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div className="flex justify-center items-center h-40 text-gray-400 font-arial">
                    Nenhum resultado encontrado
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Full Height */}
        <div className="w-72 border-l border-[#E9A870] bg-[#191818] flex-shrink-0 flex flex-col">
          <div className="p-6 flex-1 custom-scroll">
            <h3 className="text-[32px] font-afacad bg-gradient-to-r from-[#E9A870] via-[#E0CAA5] to-[#A8784F] bg-clip-text text-transparent font-semibold mb-6 leading-tight text-center drop-shadow-sm">
              PRONTOS
            </h3>

            <div className="space-y-4">
              {readyItems.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-3 px-3 rounded-lg hover:bg-gradient-to-r hover:from-gray-800/50 hover:to-gray-700/50 transition-all duration-300 hover:shadow-md group border border-transparent hover:border-[#E9A870]/20 hover:scale-105 hover:-translate-y-1 cursor-pointer"
                  style={{ animationDelay: `${index * 150}ms` }}
                  onClick={() => onNavigate("detalhes", { id: item.id, tombamento: item.tombamento })}
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex flex-col items-center gap-1">
                      <CheckCircle className="h-3 w-3 text-blue-400 group-hover:scale-110 transition-transform duration-200" />
                      <div className="w-3 h-3 bg-blue-600 rounded-full shadow-sm group-hover:shadow-lg transition-shadow duration-200"></div>
                    </div>
                    <div className="flex-1">
                      <span className="text-sm text-gray-300 leading-relaxed group-hover:text-white transition-colors font-arial">
                        {item.text}
                      </span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-gray-500 font-arial">TOMBAMENTO: {item.tombamento}</span>
                        <span className="text-sm text-blue-400 font-arial">• {item.timestamp}</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-gradient-to-r hover:from-gray-700/50 hover:to-gray-600/50 transition-all duration-200 hover:scale-110"
                  >
                    <Eye className="h-4 w-4 text-[#E0CAA5]" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
