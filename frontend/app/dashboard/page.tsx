"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Menu,
  Monitor,
  Clock,
  CheckCircle,
  AlertTriangle,
  Users,
  Building,
  TrendingUp,
  Activity,
  Zap,
  Home,
  ChevronRight,
  Filter,
  Calendar,
  RefreshCw,
  Download,
  Eye,
  User,
  Timer,
  Award,
  Target,
  Bell,
  Check,
  Trash2,
  ChevronLeft,
  Wrench,
  OctagonX,
} from "lucide-react"
import { SidebarMenu } from "@/components/sidebar-menu"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast, Toaster } from "sonner"
import { getEquipamentos, getTecnicos, getUnidades } from "@/lib/api"

interface DashboardPageProps {
  onNavigate: (page: string, data?: any) => void
}

export default function DashboardPage({ onNavigate }: DashboardPageProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [dateFilter, setDateFilter] = useState("hoje")
  const [statusFilter, setStatusFilter] = useState("todos")
  const [tecnicoFilter, setTecnicoFilter] = useState("todos")
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [lastRefresh, setLastRefresh] = useState(new Date())
  const [currentTecnicoIndex, setCurrentTecnicoIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)

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

  const [equipamentos, setEquipamentos] = useState<any[]>([])
  const [tecnicos, setTecnicos] = useState<any[]>([])
  const [unidades, setUnidades] = useState<any[]>([])

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Auto refresh data every 30 seconds
  useEffect(() => {
    if (autoRefresh) {
      const refreshTimer = setInterval(() => {
        setLastRefresh(new Date());
        // Fetch all dashboard data again
        getEquipamentos().then((res) => setEquipamentos(res.data)).catch(() => toast.error("Erro ao carregar equipamentos"));
        getTecnicos().then((res) => setTecnicos(res.data)).catch(() => toast.error("Erro ao carregar técnicos"));
        getUnidades().then((res) => setUnidades(res.data)).catch(() => toast.error("Erro ao carregar unidades"));
        console.log("Refreshing dashboard data...");
      }, 30000);
      return () => clearInterval(refreshTimer);
    }
  }, [autoRefresh]);

  useEffect(() => {
    getEquipamentos().then((res) => setEquipamentos(res.data)).catch(() => toast.error("Erro ao carregar equipamentos"))
    getTecnicos().then((res) => setTecnicos(res.data)).catch(() => toast.error("Erro ao carregar técnicos"))
    getUnidades().then((res) => setUnidades(res.data)).catch(() => toast.error("Erro ao carregar unidades"))
  }, [])

  // Real stats from backend data
  const stats = {
    totalComputadores: equipamentos.length,
    entrada: equipamentos.filter((e) => e.status === "ENTRADA").length,
    prontos: equipamentos.filter((e) => e.status === "PRONTO").length,
    saida: equipamentos.filter((e) => e.status === "SAÍDA").length,
    tecnicos: tecnicos.length,
    unidades: unidades.length,
    tempoMedioReparo: "-", // Placeholder
    eficiencia: 0, // Placeholder
    satisfacao: 0, // Placeholder
    resolucaoRapida: 0, // Placeholder
  }

  // Compute tecnico stats from real data
  const computedTecnicoStats = tecnicos.map((tecnico: any) => {
    const tickets = equipamentos.filter((e) => e.idTecnico === tecnico.idTec).length
    // Placeholder: eficiencia could be calculated if you have more data
    return {
      nome: tecnico.nomeTec,
      tickets,
      eficiencia: 100, // TODO: replace with real calculation if available
    }
  })

  // Compute unidade stats from real data
  const computedUnidadeStats = unidades
    .map((unidade: any) => {
      const entrada = equipamentos.filter((e) => e.idUnidade === unidade.idUnidade && e.status === "ENTRADA").length
      const prontos = equipamentos.filter((e) => e.idUnidade === unidade.idUnidade && e.status === "PRONTO").length
      const saida = equipamentos.filter((e) => e.idUnidade === unidade.idUnidade && e.status === "SAÍDA").length
      return {
        nome: unidade.nomeUnidade,
        entrada,
        prontos,
        saida,
      }
    })

  // Recent activity from real data (last 10 equipamentos, newest first)
  const recentActivity = equipamentos
    .slice()
    .reverse()
    .slice(0, 10)
    .map((e) => ({
      id: e.idEquip,
      tipo: e.status,
      tombamento: e.idTomb,
      unidade: unidades.find((u) => u.idUnidade === e.idUnidade)?.nomeUnidade || e.idUnidade,
      tempo: e.dataEntrada ? new Date(e.dataEntrada).toLocaleString() : "",
      tecnico: tecnicos.find((t) => t.idTec === e.idTecnico)?.nomeTec || e.idTecnico,
      ambiente: e.ambiente,
    }))

  // Filter for PRONTO items
  const prontosItems = recentActivity.filter((item) => item.tipo === "PRONTO")

  // Prontos items: all equipamentos with status PRONTO
  const allProntosItems = equipamentos
    .filter((e) => e.status === "PRONTO")
    .map((e) => ({
      id: e.idEquip,
      tombamento: e.idTomb,
      unidade: unidades.find((u) => u.idUnidade === e.idUnidade)?.nomeUnidade || e.idUnidade,
      tempo: e.dataEntrada ? new Date(e.dataEntrada).toLocaleString() : "",
      tecnico: tecnicos.find((t) => t.idTec === e.idTecnico)?.nomeTec || e.idTecnico,
      ambiente: e.ambiente,
    }))

  // Filters for activity
  const filteredActivity = recentActivity.filter((item) => {
    let statusOk = statusFilter === "todos" || item.tipo.toLowerCase() === statusFilter
    let tecnicoOk = tecnicoFilter === "todos" || item.tecnico === tecnicoFilter
    return statusOk && tecnicoOk
  })

  // --- Improved Técnicos Carousel Logic (Page-based) ---
  const TECNICOS_PER_PAGE = 4
  const totalPages = Math.ceil(computedTecnicoStats.length / TECNICOS_PER_PAGE)
  const [currentPage, setCurrentPage] = useState(0)

  useEffect(() => {
    if (currentPage > totalPages - 1) {
      setCurrentPage(Math.max(0, totalPages - 1))
    }
  }, [computedTecnicoStats.length, totalPages])

  // Auto-scroll horizontal técnicos carousel
  useEffect(() => {
    if (totalPages > 1) {
      const scrollTimer = setInterval(() => {
        setCurrentPage((prev) => (prev < totalPages - 1 ? prev + 1 : 0))
      }, 3500)
      return () => clearInterval(scrollTimer)
    }
  }, [totalPages])

  const nextTecnico = () => {
    if (isTransitioning) return
    setIsTransitioning(true)
    setCurrentPage((prev) => (prev < totalPages - 1 ? prev + 1 : prev))
    setTimeout(() => setIsTransitioning(false), 300)
  }

  const prevTecnico = () => {
    if (isTransitioning) return
    setIsTransitioning(true)
    setCurrentPage((prev) => (prev > 0 ? prev - 1 : 0))
    setTimeout(() => setIsTransitioning(false), 300)
  }

  const visibleTecnicos = computedTecnicoStats.slice(
    currentPage * TECNICOS_PER_PAGE,
    currentPage * TECNICOS_PER_PAGE + TECNICOS_PER_PAGE
  )

  // --- Unidade Carousel Logic (Page-based) ---
  const UNIDADES_PER_PAGE = 4
  const totalUnidadePages = Math.ceil(computedUnidadeStats.length / UNIDADES_PER_PAGE)
  const [currentUnidadePage, setCurrentUnidadePage] = useState(0)
  const [isUnidadeTransitioning, setIsUnidadeTransitioning] = useState(false)

  useEffect(() => {
    if (currentUnidadePage > totalUnidadePages - 1) {
      setCurrentUnidadePage(Math.max(0, totalUnidadePages - 1))
    }
  }, [computedUnidadeStats.length, totalUnidadePages])

  // Auto-scroll horizontal unidades carousel
  useEffect(() => {
    if (totalUnidadePages > 1) {
      const scrollTimer = setInterval(() => {
        setCurrentUnidadePage((prev) => (prev < totalUnidadePages - 1 ? prev + 1 : 0))
      }, 3500)
      return () => clearInterval(scrollTimer)
    }
  }, [totalUnidadePages])

  const nextUnidade = () => {
    if (isUnidadeTransitioning) return
    setIsUnidadeTransitioning(true)
    setCurrentUnidadePage((prev) => (prev < totalUnidadePages - 1 ? prev + 1 : prev))
    setTimeout(() => setIsUnidadeTransitioning(false), 300)
  }

  const prevUnidade = () => {
    if (isUnidadeTransitioning) return
    setIsUnidadeTransitioning(true)
    setCurrentUnidadePage((prev) => (prev > 0 ? prev - 1 : 0))
    setTimeout(() => setIsUnidadeTransitioning(false), 300)
  }

  const visibleUnidades = computedUnidadeStats.slice(
    currentUnidadePage * UNIDADES_PER_PAGE,
    currentUnidadePage * UNIDADES_PER_PAGE + UNIDADES_PER_PAGE
  )

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ENTRADA":
        return <Clock className="h-3 w-3 text-amber-500" />
      case "REPARO":
        return <Wrench className="h-3 w-3 text-teal-200" />
      case "PRONTO":
        return <AlertTriangle className="h-3 w-3 text-blue-600" />
      case "DESCARTE":
        return <OctagonX className="h-3 w-3 text-red-500" />
      case "SAÍDA":
        return <CheckCircle className="h-3 w-3 text-green-500" />
      default:
        return <Clock className="h-3 w-3 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ENTRADA":
        return "bg-amber-500/20 text-amber-500 border-amber-500/30"
      case "REPARO":
        return "bg-teal-200/20 text-teal-200 border-teal-200/30"
      case "PRONTO":
        return "bg-blue-600/20 text-blue-600 border-blue-600/30"
      case "DESCARTE":
        return "bg-red-500/20 text-red-500 border-red-500/30"
      case "SAÍDA":
        return "bg-green-500/20 text-green-500 border-green-500/30"
      default:
        return "text-gray-400"
    }
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

  // --- Automatic vertical scroll for Recent Activity and Prontos ---
  const recentActivityRef = useRef<HTMLDivElement>(null)
  const prontosRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const scrollInterval = setInterval(() => {
      if (recentActivityRef.current) {
        recentActivityRef.current.scrollTop += 40
        if (
          recentActivityRef.current.scrollTop + recentActivityRef.current.clientHeight >=
          recentActivityRef.current.scrollHeight - 1
        ) {
          recentActivityRef.current.scrollTop = 0
        }
      }
      if (prontosRef.current) {
        prontosRef.current.scrollTop += 40
        if (
          prontosRef.current.scrollTop + prontosRef.current.clientHeight >=
          prontosRef.current.scrollHeight - 1
        ) {
          prontosRef.current.scrollTop = 0
        }
      }
    }, 2000)
    return () => clearInterval(scrollInterval)
  }, [])

  return (
    <div className="min-h-screen bg-[var(--agnus-bg-primary)] text-[var(--agnus-text-primary)] font-abel tv-display">
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
        onClose={() => setSidebarOpen(false)}
        onNavigate={onNavigate}
        currentPage="dashboard"
      />

      {/* Header - Fixed/Sticky */}
      <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 bg-[#0C0C0C] border-b border-[#E9A870] shadow-lg backdrop-blur-sm">
        <div className="flex items-center gap-6">
          <Button
            variant="ghost"
            size="icon"
            className="text-[#E0CAA5] hover:bg-gradient-to-r hover:from-[#E9A870]/20 hover:to-[#A8784F]/20 transition-all duration-200 hover:scale-110"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </Button>
          <h1 className="text-[42px] font-abel text-[#E0CAA5] tracking-wider drop-shadow-sm">AGNUS</h1>

          {/* Breadcrumbs */}
          <div className="flex items-center text-sm text-gray-400 ml-6">
            <Button
              variant="link"
              className="p-0 h-auto text-[#E0CAA5] hover:text-[#E9A870] transition-colors font-arial"
              onClick={() => onNavigate("home")}
            >
              <Home className="h-4 w-4 mr-1" />
              <span>Início</span>
            </Button>
            <ChevronRight className="h-3 w-3 mx-2 text-gray-500" />
            <span className="text-gray-400 font-arial">Dashboard</span>
          </div>
        </div>

        {/* Header Controls */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`text-sm ${
              autoRefresh ? "text-green-400" : "text-gray-400"
            } hover:bg-[#E9A870]/20 transition-all duration-200`}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${autoRefresh ? "animate-spin" : ""}`} />
            Auto
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="text-[#E0CAA5] hover:bg-[#E9A870]/20 transition-all duration-200"
          >
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>

          {/* Notifications Dropdown */}
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

          <div className="text-right">
            <div className="text-lg font-bold text-[#E9A870]">
              {currentTime.toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
            <div className="text-sm text-gray-400">
              {currentTime.toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "short",
              })}
            </div>
          </div>
        </div>
      </header>

      <div className="p-6 space-y-6">
        {/* Title and Filters */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-4xl font-afacad bg-gradient-to-r from-[#E9A870] via-[#E0CAA5] to-[#A8784F] bg-clip-text text-transparent font-semibold">
              DASHBOARD
            </h2>
            <p className="text-lg font-afacad text-[#E0CAA5] opacity-80">Monitoramento em tempo real</p>
          </div>

          <div className="flex items-center gap-3">
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-28 h-8 bg-[#3D3024] border-[#E9A870]/20 text-white text-sm">
                <Calendar className="h-3 w-3 mr-1" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1C1815] border-[#E9A870]/30 text-white">
                <SelectItem value="hoje">Hoje</SelectItem>
                <SelectItem value="semana">Semana</SelectItem>
                <SelectItem value="mes">Mês</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32 h-8 bg-[#3D3024] border-[#E9A870]/20 text-white text-sm">
                <Filter className="h-3 w-3 mr-1" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1C1815] border-[#E9A870]/30 text-white">
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="entrada">Entrada</SelectItem>
                <SelectItem value="pronto">Pronto</SelectItem>
                <SelectItem value="saida">Saída</SelectItem>
              </SelectContent>
            </Select>

            <Select value={tecnicoFilter} onValueChange={setTecnicoFilter}>
              <SelectTrigger className="w-32 h-8 bg-[#3D3024] border-[#E9A870]/20 text-white text-sm">
                <Filter className="h-3 w-3 mr-1" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1C1815] border-[#E9A870]/30 text-white">
                <SelectItem value="todos">Todos</SelectItem>
                {computedTecnicoStats.map((tecnico) => (
                  <SelectItem key={tecnico.nome} value={tecnico.nome}>
                    {tecnico.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Main Stats - Simplified */}
        <div className="grid grid-cols-4 gap-4">
          <Card className="bg-[#1C1815] border-[#E9A870]/30 hover:border-[#E9A870]/50 transition-all duration-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg text-[var(--agnus-text-muted)] uppercase tracking-wide font-bold">Total</p>
                  <p className="text-4xl font-bold text-[var(--agnus-text-primary)]">{stats.totalComputadores}</p>
                </div>
                <Monitor className="h-6 w-6 text-[#E9A870]" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1C1815] border-red-500/30 hover:border-red-500/50 transition-all duration-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 uppercase tracking-wide">Entrada</p>
                  <p className="text-2xl font-bold text-red-400">{stats.entrada}</p>
                </div>
                <Clock className="h-6 w-6 text-red-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1C1815] border-blue-500/30 hover:border-blue-500/50 transition-all duration-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 uppercase tracking-wide">Prontos</p>
                  <p className="text-2xl font-bold text-blue-400">{stats.prontos}</p>
                </div>
                <AlertTriangle className="h-6 w-6 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1C1815] border-green-500/30 hover:border-green-500/50 transition-all duration-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 uppercase tracking-wide">Entregues</p>
                  <p className="text-2xl font-bold text-green-400">{stats.saida}</p>
                </div>
                <CheckCircle className="h-6 w-6 text-green-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Secondary Stats - Condensed */}
        <div className="grid grid-cols-6 gap-3">
          {[
            { icon: Users, label: "Técnicos", value: stats.tecnicos, color: "text-[#E9A870]" },
            { icon: Building, label: "Unidades", value: stats.unidades, color: "text-[#E9A870]" },
            { icon: Timer, label: "Tempo Médio", value: stats.tempoMedioReparo, color: "text-[#E9A870]" },
            { icon: Zap, label: "Eficiência", value: `${stats.eficiencia}%`, color: "text-[#E9A870]" },
            { icon: Award, label: "Satisfação", value: `${stats.satisfacao}%`, color: "text-[#E9A870]" },
            { icon: Target, label: "Resolução", value: `${stats.resolucaoRapida}%`, color: "text-[#E9A870]" },
          ].map((stat, index) => (
            <Card
              key={index}
              className="bg-[#1C1815] border-[#E9A870]/20 hover:bg-[#1C1815]/80 transition-all duration-200"
            >
              <CardContent className="p-3 text-center">
                <stat.icon className={`h-4 w-4 ${stat.color} mx-auto mb-1`} />
                <p className="text-sm font-bold text-white">{stat.value}</p>
                <p className="text-sm text-gray-400">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-3 gap-6">
          {/* Recent Activity - Left Side */}
          <div className="col-span-2">
            <Card className="bg-[#1C1815] border-[#E9A870]/30 h-[350px]">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Activity className="h-4 w-4 text-[#E9A870]" />
                    Atividade Recente
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-[#E9A870] hover:bg-[#E9A870]/10 h-7 px-2 text-sm"
                    onClick={() => onNavigate("home")}
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Ver Todos
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0 h-[280px] overflow-y-auto custom-scroll" ref={recentActivityRef}>
                <div className="space-y-1.5">
                  {filteredActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-center justify-between p-2.5 bg-[#121212] rounded-lg hover:bg-[#1a1a1a] transition-colors cursor-pointer"
                      onClick={() => onNavigate("detalhes", { tombamento: activity.tombamento })}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="flex items-center gap-1.5">
                          {getStatusIcon(activity.tipo)}
                          <span className={`text-xs font-medium ${getStatusColor(activity.tipo)}`}> 
                            {activity.tipo}
                          </span>
                        </div>
                        <div>
                          <p className="text-base font-medium text-[var(--agnus-text-primary)]">
                            {activity.tombamento}
                          </p>
                          <p className="text-sm text-[var(--agnus-text-muted)]">{activity.unidade}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">{activity.ambiente}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-[#E9A870]">{activity.tecnico}</p>
                        <p className="text-xs text-gray-500">{activity.tempo}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* PRONTOS Card - Right Side, matching height */}
          <div>
            <Card className="bg-[#1C1815] border-[#E9A870]/30 h-[350px]">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-blue-400" />
                    Prontos
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-[#E9A870] hover:bg-[#E9A870]/10 h-7 px-2 text-sm"
                    onClick={() => onNavigate("home")}
                  >
                    <Eye className="h-3 w-3" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0 h-[280px] overflow-y-auto custom-scroll" ref={prontosRef}>
                <div className="space-y-2">
                  {allProntosItems.length > 0 ? (
                    allProntosItems.map((item) => (
                      <div
                        key={item.id}
                        className="p-2.5 bg-[#121212] rounded-lg hover:bg-[#1a1a1a] transition-colors cursor-pointer border-l-2 border-l-blue-400"
                        onClick={() => onNavigate("detalhes", { tombamento: item.tombamento })}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <p className="text-base font-bold text-white">{item.tombamento}</p>
                          <span className="text-xs text-blue-400 font-medium">{item.ambiente}</span>
                        </div>
                        <p className="text-xs text-gray-400 mb-1">{item.unidade}</p>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-[#E9A870]">{item.tecnico}</p>
                          <p className="text-xs text-gray-500">{item.tempo}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-gray-400">
                      <AlertTriangle className="h-10 w-10 mx-auto mb-2 opacity-50" />
                      <p className="text-base">Nenhum item pronto</p>
                      <p className="text-xs">Aguardando conclusão de reparos</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Técnicos Carousel */}
        <Card className="bg-[#1C1815] border-[#E9A870]/30">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <User className="h-4 w-4 text-[#E9A870]" />
                Técnicos
              </h3>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={prevTecnico}
                  className="h-8 w-8 text-[#E9A870] hover:bg-[#E9A870]/10 rounded-full transition-all duration-200"
                  disabled={isTransitioning || currentPage === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={nextTecnico}
                  className="h-8 w-8 text-[#E9A870] hover:bg-[#E9A870]/10 rounded-full transition-all duration-200"
                  disabled={isTransitioning || currentPage === totalPages - 1}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-[#E9A870] hover:bg-[#E9A870]/10 h-7 px-2 text-sm ml-2"
                  onClick={() => onNavigate("tecnicos")}
                >
                  <Eye className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="relative overflow-hidden">
              <div
                className="flex transition-transform duration-300 ease-in-out gap-2"
                style={{
                  width: `${totalPages * 100}%`,
                  transform: `translateX(-${currentPage * (100 / totalPages)}%)`,
                }}
              >
                {computedTecnicoStats.map((tecnico, index) => (
                  <div
                    key={tecnico.nome}
                    className="p-2.5 bg-[#121212] rounded-lg hover:bg-[#1a1a1a] transition-colors cursor-pointer border border-[#E9A870]/20 hover:border-[#E9A870]/40"
                    style={{ width: `${100 / (totalPages * TECNICOS_PER_PAGE)}%`, minWidth: 0 }}
                    onClick={() => onNavigate("tecnicos", { selectedTecnico: tecnico.nome })}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 bg-gradient-to-r from-[#E9A870] to-[#A8784F] rounded-full flex items-center justify-center">
                        <User className="h-3.5 w-3.5 text-black" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">{tecnico.nome}</p>
                        <p className="text-xs text-gray-400">{tecnico.tickets} tickets</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-base font-bold text-[#E9A870]">{tecnico.eficiencia}%</span>
                      <div className="w-12 bg-gray-700 rounded-full h-1.5">
                        <div
                          className="bg-[#E9A870] h-1.5 rounded-full transition-all duration-500"
                          style={{ width: `${tecnico.eficiencia}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Scroll Indicators */}
              <div className="flex justify-center mt-3 gap-1">
                {Array.from({ length: totalPages }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      if (!isTransitioning) {
                        setIsTransitioning(true)
                        setCurrentPage(index)
                        setTimeout(() => setIsTransitioning(false), 300)
                      }
                    }}
                    className={`w-2 h-2 rounded-full transition-all duration-200 ${
                      currentPage === index ? "bg-[#E9A870]" : "bg-gray-600 hover:bg-gray-500"
                    }`}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Units Overview - Carousel */}
        <Card className="bg-[#1C1815] border-[#E9A870]/30">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Building className="h-4 w-4 text-[#E9A870]" />
                Unidades de Saúde
              </h3>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={prevUnidade}
                  className="h-8 w-8 text-[#E9A870] hover:bg-[#E9A870]/10 rounded-full transition-all duration-200"
                  disabled={isUnidadeTransitioning || currentUnidadePage === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={nextUnidade}
                  className="h-8 w-8 text-[#E9A870] hover:bg-[#E9A870]/10 rounded-full transition-all duration-200"
                  disabled={isUnidadeTransitioning || currentUnidadePage === totalUnidadePages - 1}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="relative overflow-hidden">
              <div
                className="flex transition-transform duration-300 ease-in-out gap-4"
                style={{
                  width: `${totalUnidadePages * 100}%`,
                  transform: `translateX(-${currentUnidadePage * (100 / totalUnidadePages)}%)`,
                }}
              >
                {computedUnidadeStats.map((unidade, index) => (
                  <div
                    key={unidade.nome}
                    className="p-3 bg-[#121212] rounded-lg hover:bg-[#1a1a1a] transition-colors border border-[#E9A870]/20 hover:border-[#E9A870]/40"
                    style={{ width: `${100 / (UNIDADES_PER_PAGE)}%`, minWidth: 0 }}
                  >
                    <h4 className="text-sm font-bold text-white mb-2">{unidade.nome}</h4>
                    <div className="flex justify-between text-sm">
                      <div className="text-center">
                        <div className="flex items-center gap-1 mb-1">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          <span className="text-red-400">{unidade.entrada}</span>
                        </div>
                        <p className="text-gray-500">Entrada</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center gap-1 mb-1">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-blue-400">{unidade.prontos}</span>
                        </div>
                        <p className="text-gray-500">Prontos</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center gap-1 mb-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-green-400">{unidade.saida}</span>
                        </div>
                        <p className="text-gray-500">Saída</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {/* Scroll Indicators */}
              <div className="flex justify-center mt-3 gap-1">
                {Array.from({ length: totalUnidadePages }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      if (!isUnidadeTransitioning) {
                        setIsUnidadeTransitioning(true)
                        setCurrentUnidadePage(index)
                        setTimeout(() => setIsUnidadeTransitioning(false), 300)
                      }
                    }}
                    className={`w-2 h-2 rounded-full transition-all duration-200 ${
                      currentUnidadePage === index ? "bg-[#E9A870]" : "bg-gray-600 hover:bg-gray-500"
                    }`}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Indicators - Simplified */}
        <Card className="bg-[#1C1815] border-[#E9A870]/30">
          <CardHeader className="pb-3">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-[#E9A870]" />
              Indicadores de Performance
            </h3>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-4 gap-6">
              {[
                { label: "Taxa de Resolução", value: "87%", target: "85%", progress: 87, color: "green" },
                { label: "Tempo Médio", value: "2.5h", target: "3h", progress: 75, color: "blue" },
                { label: "Satisfação", value: "94%", target: "90%", progress: 94, color: "orange" },
                { label: "Tempo de Resposta", value: "1.2h", target: "1.5h", progress: 80, color: "purple" },
              ].map((metric, index) => (
                <div key={index} className="text-center">
                  <div className={`text-2xl font-bold text-${metric.color}-400 mb-1`}>{metric.value}</div>
                  <p className="text-sm text-gray-400 mb-2">{metric.label}</p>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className={`bg-${metric.color}-400 h-2 rounded-full transition-all duration-500`}
                      style={{ width: `${metric.progress}%` }}
                    ></div>
                  </div>
                  <p className={`text-sm text-${metric.color}-400 mt-1`}>Meta: {metric.target}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
