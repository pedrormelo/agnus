
"use client"

// Helper to format date/time in a readable way (DD/MM/YYYY HH:mm)
function formatDateTime(dateString?: string | null) {
  if (!dateString) return "Não definida";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Menu,
  ChevronLeft,
  Clock,
  CheckCircle,
  AlertTriangle,
  User,
  MapPin,
  Monitor,
  FileText,
  Calendar,
  History,
  Home,
  ChevronRight,
  Printer,
  Trash2,
  Edit,
  Check,
} from "lucide-react"
import { SidebarMenu } from "@/components/sidebar-menu"
import { toast, Toaster } from "sonner"
import api from "@/lib/api"

interface DetalhesRegistroProps {
  onNavigate: (page: string, data?: any) => void
  data?: any
}

export default function DetalhesRegistro({ onNavigate, data }: DetalhesRegistroProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [printDialogOpen, setPrintDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [markReadyDialogOpen, setMarkReadyDialogOpen] = useState(false)
  const [markDeliveredDialogOpen, setMarkDeliveredDialogOpen] = useState(false)

  // Real ticket details state
  const [ticketDetails, setTicketDetails] = useState<any>(data || null)
  const [ticketLoading, setTicketLoading] = useState(false)
  const [ticketError, setTicketError] = useState<string | null>(null)

  // Fetch real ticket details if not provided
  useEffect(() => {
    if (data) {
      setTicketDetails(data)
      return
    }
    // Try to get id from URL or context if needed (here, assume id is passed in data or via prop)
    // If not, do nothing
    if (!ticketDetails?.id && !data?.id) return
    setTicketLoading(true)
    setTicketError(null)
    api.get(`/equipamentos/${data?.id || ticketDetails?.id}`)
      .then(res => setTicketDetails(res.data))
      .catch(() => setTicketError('Erro ao buscar detalhes do registro'))
      .finally(() => setTicketLoading(false))
  }, [data])

  // Edit form state
  const [editFormData, setEditFormData] = useState({
    tombamento: ticketDetails?.tombamento || '',
    ambiente: ticketDetails?.ambiente || '',
    tipo: ticketDetails?.tipo || '',
    unidade: ticketDetails?.unidade || '',
    descricao: ticketDetails?.descricao || '',
    tecnico: ticketDetails?.tecnico ? String(ticketDetails?.tecnico) : '',
  })

  const [unidades, setUnidades] = useState<{ idUnidade: number, nomeUnidade: string }[]>([])
  // tecnicos can be array of string or array of objects
  const [tecnicos, setTecnicos] = useState<any[]>([])

  useEffect(() => {
    // Fetch unidades
    api.get('/unidades').then(res => {
      if (Array.isArray(res.data)) {
        setUnidades(res.data.map((u: any) => ({ idUnidade: u.idUnidade, nomeUnidade: u.nomeUnidade })))
      }
    })
    // Fetch tecnicos
    api.get('/tecnicos').then(res => {
      if (Array.isArray(res.data)) {
        // If backend returns array of objects with idTec and nomeTec, use as is
        if (res.data.length > 0 && typeof res.data[0] === 'object' && 'idTec' in res.data[0]) {
          setTecnicos(res.data)
        } else {
          setTecnicos(res.data.map((t: any) => ({ nomeTec: t })))
        }
      }
    })
  }, [])

  // Real related tickets and history
  const [relatedTickets, setRelatedTickets] = useState<any[]>([])
  const [relatedLoading, setRelatedLoading] = useState(false)
  const [relatedError, setRelatedError] = useState<string | null>(null)
  const [ticketHistory, setTicketHistory] = useState<any[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [historyError, setHistoryError] = useState<string | null>(null)

  useEffect(() => {
    if (!ticketDetails?.id) return;
    setRelatedLoading(true)
    setRelatedError(null)
    api.get(`/equipamentos/${ticketDetails.id}/relacionados`)
      .then(res => setRelatedTickets(res.data || []))
      .catch(() => setRelatedError('Erro ao buscar chamados relacionados'))
      .finally(() => setRelatedLoading(false))
  }, [ticketDetails.id])

  useEffect(() => {
    if (!ticketDetails?.id) return;
    setHistoryLoading(true)
    setHistoryError(null)
    api.get(`/equipamentos/${ticketDetails.id}/historico`)
      .then(res => setTicketHistory(res.data || []))
      .catch(() => setHistoryError('Erro ao buscar histórico'))
      .finally(() => setHistoryLoading(false))
  }, [ticketDetails.id])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ENTRADA":
        return <Clock className="h-4 w-4 text-red-400" />
      case "SAÍDA":
        return <CheckCircle className="h-4 w-4 text-green-400" />
      case "PRONTO":
        return <AlertTriangle className="h-4 w-4 text-blue-400" />
      default:
        return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ENTRADA":
        return "bg-red-500/20 text-red-300 border-red-500/30"
      case "SAÍDA":
        return "bg-green-500/20 text-green-300 border-green-500/30"
      case "PRONTO":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30"
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/30"
    }
  }

  // --- API Actions ---
  const handleMarkAsReady = async () => {
    try {
      await api.patch(`/equipamentos/${ticketDetails.id}/status`, { status: "PRONTO" })
      toast.success(`Registro ${ticketDetails.tombamento} marcado como PRONTO`, {
        duration: 3000,
        position: "top-right",
      })
      setMarkReadyDialogOpen(false)
      // Optionally refresh data here
    } catch (err) {
      toast.error("Erro ao marcar como PRONTO")
    }
  }

  const handleMarkAsDelivered = async () => {
    try {
      await api.patch(`/equipamentos/${ticketDetails.id}/status`, { status: "SAÍDA" })
      toast.success(`Registro ${ticketDetails.tombamento} marcado como SAÍDA`, {
        duration: 3000,
        position: "top-right",
      })
      setMarkDeliveredDialogOpen(false)
      // Optionally refresh data here
    } catch (err) {
      toast.error("Erro ao marcar como SAÍDA")
    }
  }

  const handlePrintLabel = async () => {
    try {
      // Download or print the label (ZPL)
      const res = await api.get(`/equipamentos/${ticketDetails.id}/etiqueta`, { responseType: 'blob' })
      // Optionally trigger print or download
      toast.success("Etiqueta gerada com sucesso", { duration: 3000, position: "top-right" })
      setPrintDialogOpen(false)
    } catch (err) {
      toast.error("Erro ao gerar etiqueta")
    }
  }

  const handleDeleteRecord = async () => {
    try {
      await api.delete(`/equipamentos/${ticketDetails.id}`)
      toast.success(`Registro ${ticketDetails.tombamento} foi excluído com sucesso`, {
        duration: 3000,
        position: "top-right",
      })
      setDeleteDialogOpen(false)
      onNavigate("home")
    } catch (err) {
      toast.error("Erro ao excluir registro")
    }
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.put(`/equipamentos/${ticketDetails.id}`, {
        idTomb: editFormData.tombamento,
        ambiente: editFormData.ambiente,
        tipo: editFormData.tipo,
        descDefeito: editFormData.descricao,
        unidade: editFormData.unidade,
        tecnico: editFormData.tecnico,
      })
      toast.success(`Registro ${ticketDetails.tombamento} foi atualizado com sucesso`, {
        duration: 3000,
        position: "top-right",
      })
      setEditDialogOpen(false)
      // Optionally refresh data here
    } catch (err) {
      toast.error("Erro ao atualizar registro")
    }
  }

  const isEditFormValid =
    editFormData.tombamento &&
    editFormData.ambiente &&
    editFormData.unidade &&
    editFormData.descricao &&
    editFormData.tecnico

  // Atualiza os dados do formulário de edição ao abrir o popup
  useEffect(() => {
    if (editDialogOpen && ticketDetails) {
      setEditFormData({
        tombamento: ticketDetails.tombamento,
        ambiente: ticketDetails.ambiente,
        tipo: ticketDetails.tipo,
        unidade: ticketDetails.unidade,
        descricao: ticketDetails.descricao,
        tecnico: ticketDetails.tecnico ? String(ticketDetails.tecnico) : '',
      })
    }
  }, [editDialogOpen, ticketDetails])

  // Atualiza os dados do formulário de edição ao abrir o popup, garantindo que os selects estejam pré-selecionados
  useEffect(() => {
    if (editDialogOpen && unidades.length && tecnicos.length && ticketDetails) {
      setEditFormData(prev => ({
        tombamento: ticketDetails.tombamento,
        ambiente: ticketDetails.ambiente,
        tipo: ticketDetails.tipo,
        unidade: unidades.some(u => String(u.idUnidade) === String(ticketDetails.unidade))
          ? String(ticketDetails.unidade)
          : String(unidades[0].idUnidade),
        descricao: ticketDetails.descricao,
        tecnico: tecnicos.some(t => String(t.idTec) === String(ticketDetails.tecnico))
          ? String(ticketDetails.tecnico)
          : String(tecnicos[0]?.idTec || ''),
      }))
    }
  }, [editDialogOpen, ticketDetails, unidades, tecnicos])

  if (ticketLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#191818] text-white">
        <span className="text-2xl font-arial">Carregando detalhes do registro...</span>
      </div>
    )
  }
  if (ticketError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#191818] text-white">
        <span className="text-2xl text-red-400 font-arial">{ticketError}</span>
      </div>
    )
  }
  if (!ticketDetails) {
    return null
  }

  return (
    <div className="min-h-screen bg-[#191818] text-white">
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
        currentPage="detalhes"
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
            <Button
              variant="link"
              className="p-0 h-auto text-[#E0CAA5] hover:text-[#E9A870] transition-colors font-arial"
              onClick={() => onNavigate("home")}
            >
              <span>Computadores</span>
            </Button>
            <ChevronRight className="h-3 w-3 mx-2 text-gray-500" />
            <span className="text-gray-400 font-arial">Detalhes</span>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => onNavigate("home")}
            className="text-[#E0CAA5] hover:bg-gradient-to-r hover:from-[#E9A870]/20 hover:to-[#A8784F]/20 transition-all duration-200 hover:scale-110"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
        </div>
      </header>

      <div className="p-6 custom-scroll">
        <div className="mb-6">
          <h2 className="text-[58px] font-afacad bg-gradient-to-r from-[#E9A870] via-[#E0CAA5] to-[#A8784F] bg-clip-text text-transparent font-semibold leading-tight drop-shadow-sm">
            DETALHES DO REGISTRO
          </h2>
          <p className="text-[32px] font-afacad text-[#E0CAA5] leading-tight opacity-90">
            TOMBAMENTO: {ticketDetails.tombamento}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card className="bg-[#1C1815] border-[#E9A870] border-2 rounded-xl overflow-hidden shadow-2xl backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-[#E9A870] to-[#A8784F] p-4">
                <h3 className="text-xl font-bold text-black flex items-center gap-2 font-arial">
                  <FileText className="h-5 w-5" />
                  INFORMAÇÕES BÁSICAS
                </h3>
              </CardHeader>
              <CardContent className="p-6 bg-[#1C1815] space-y-4 custom-scroll">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#E9A870] font-arial">ID</label>
                    <p className="text-white font-bold text-lg font-abel">{ticketDetails.id}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#E9A870] font-arial">TOMBAMENTO</label>
                    <p className="text-white font-bold text-lg font-abel">{ticketDetails.tombamento}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#E9A870] font-arial">STATUS</label>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(ticketDetails.status)}
                      <Badge className={`${getStatusColor(ticketDetails.status)} font-bold font-arial`}>
                        {ticketDetails.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#E9A870] flex items-center gap-1 font-arial">
                      <Calendar className="h-4 w-4" />
                      DATA SAÍDA
                    </label>
                    <p className="text-white text-lg font-abel">{ticketDetails.dataSaida || "Não definida"}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#E9A870] flex items-center gap-1 font-arial">
                      <User className="h-4 w-4" />
                      TÉCNICO
                    </label>
                    <button
                      onClick={() => onNavigate("tecnicos", { selectedTecnico: ticketDetails.tecnico })}
                      className="text-white font-bold hover:text-[#E9A870] transition-colors cursor-pointer text-lg font-abel"
                    >
                      {(() => {
                        // Always show the tecnico name if possible
                        let found = null;
                        if (tecnicos && tecnicos.length > 0) {
                          found = tecnicos.find(
                            t => t.idTec === ticketDetails.tecnico || t.nomeTec === ticketDetails.tecnico
                          );
                        }
                        if (found && found.nomeTec) return found.nomeTec;
                        // fallback: show as string
                        return ticketDetails.tecnico;
                      })()}
                    </button>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#E9A870] flex items-center gap-1 font-arial">
                      <MapPin className="h-4 w-4" />
                      UNIDADE
                    </label>
                    <p className="text-white font-bold text-lg font-abel">
                      {unidades.find(u => u.idUnidade === ticketDetails.unidade)?.nomeUnidade || ticketDetails.unidade}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#E9A870] font-arial">AMBIENTE</label>
                    <p className="text-white font-bold text-lg font-abel">{ticketDetails.ambiente}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#E9A870] flex items-center gap-1 font-arial">
                      <Monitor className="h-4 w-4" />
                      TIPO
                    </label>
                    <p className="text-white font-bold text-lg font-abel">{ticketDetails.tipo}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#E9A870] font-arial">DESCRIÇÃO DO PROBLEMA</label>
                  <p className="text-white bg-[#121212] p-4 rounded-lg border border-[#E9A870]/20 text-base font-arial leading-relaxed">
                    {ticketDetails.descricao}
                  </p>
                </div>

                {ticketDetails.observacoes && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#E9A870] font-arial">OBSERVAÇÕES</label>
                    <p className="text-white bg-[#121212] p-4 rounded-lg border border-[#E9A870]/20 text-base font-arial leading-relaxed">
                      {ticketDetails.observacoes}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#E9A870] flex items-center gap-1 font-arial">
                      <Calendar className="h-4 w-4" />
                      DATA DE ABERTURA
                    </label>
                    <p className="text-white text-base font-arial">{formatDateTime(ticketDetails.dataEntrada)}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#E9A870] flex items-center gap-1 font-arial">
                      <Calendar className="h-4 w-4" />
                      ÚLTIMA ATUALIZAÇÃO
                    </label>
                    <p className="text-white text-base font-arial">{formatDateTime(ticketDetails.dataSaida || ticketDetails.dataEntrada)}</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-center gap-4 pt-4 border-t border-[#E9A870]/20">
                  {/* MARCAR COMO PRONTO */}
                  <div className="relative">
                    <button
                      onClick={() => setMarkReadyDialogOpen(true)}
                      className="w-16 h-16 flex items-center justify-center rounded-xl bg-[#1C1815] hover:bg-[#2A231E] transition-all duration-200 hover:scale-105 cursor-pointer"
                      title="MARCAR COMO PRONTO"
                    >
                      <div className="w-14 h-14 rounded-xl flex items-center justify-center border-2 border-[#E9A870]">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path
                            d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                            stroke="#E9A870"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M9 12L11 14L15 10"
                            stroke="#E9A870"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    </button>
                    <AlertDialog open={markReadyDialogOpen} onOpenChange={setMarkReadyDialogOpen}>
                      <AlertDialogContent className="bg-[#1C1815] border-[#E9A870] text-white">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-[#E9A870] text-xl font-abel">
                            Marcar como Pronto
                          </AlertDialogTitle>
                          <AlertDialogDescription className="text-gray-300 font-arial">
                            Tem certeza que deseja marcar o registro{" "}
                            <span className="font-bold text-white">{ticketDetails.tombamento}</span> como PRONTO?
                            <br />
                            <span className="text-blue-400 text-sm">
                              O status será alterado para "PRONTO" e ficará disponível para entrega.
                            </span>
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="bg-gray-600 hover:bg-gray-700 text-white border-gray-500">
                            Cancelar
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleMarkAsReady}
                            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Marcar como Pronto
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>

                  {/* MARCAR COMO SAÍDA */}
                  <div className="relative">
                    <button
                      onClick={() => setMarkDeliveredDialogOpen(true)}
                      className="w-16 h-16 flex items-center justify-center rounded-xl bg-[#1C1815] hover:bg-[#2A231E] transition-all duration-200 hover:scale-105 cursor-pointer"
                      title="MARCAR COMO SAÍDA"
                    >
                      <div className="w-14 h-14 rounded-xl flex items-center justify-center border-2 border-[#E9A870]">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path
                            d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9"
                            stroke="#E9A870"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M16 17L21 12L16 7"
                            stroke="#E9A870"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M21 12H9"
                            stroke="#E9A870"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    </button>
                    <AlertDialog open={markDeliveredDialogOpen} onOpenChange={setMarkDeliveredDialogOpen}>
                      <AlertDialogContent className="bg-[#1C1815] border-[#E9A870] text-white">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-[#E9A870] text-xl font-abel">
                            Marcar como Saída
                          </AlertDialogTitle>
                          <AlertDialogDescription className="text-gray-300 font-arial">
                            Tem certeza que deseja marcar o registro{" "}
                            <span className="font-bold text-white">{ticketDetails.tombamento}</span> como SAÍDA?
                            <br />
                            <span className="text-green-400 text-sm">
                              O equipamento será marcado como entregue e o chamado será finalizado.
                            </span>
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="bg-gray-600 hover:bg-gray-700 text-white border-gray-500">
                            Cancelar
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleMarkAsDelivered}
                            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Marcar como Saída
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>

                  {/* IMPRIMIR ETIQUETA */}
                  <div className="relative">
                    <button
                      onClick={() => setPrintDialogOpen(true)}
                      className="w-16 h-16 flex items-center justify-center rounded-xl bg-[#1C1815] hover:bg-[#2A231E] transition-all duration-200 hover:scale-105 cursor-pointer"
                      title="IMPRIMIR ETIQUETA"
                    >
                      <div className="w-14 h-14 rounded-xl flex items-center justify-center border-2 border-[#E9A870]">
                        <Printer className="h-6 w-6 text-[#E9A870]" />
                      </div>
                    </button>
                    <Dialog open={printDialogOpen} onOpenChange={setPrintDialogOpen}>
                      <DialogContent className="bg-gradient-to-b from-[#1C1815] to-[#0C0C0C] border-2 border-[#E9A870] text-white max-w-md shadow-2xl backdrop-blur-sm">
                        <DialogHeader>
                          <DialogTitle className="text-[#E9A870] text-xl font-abel bg-gradient-to-r from-[#E9A870] to-[#A8784F] bg-clip-text text-transparent">
                            Imprimir Etiqueta
                          </DialogTitle>
                          <div className="w-full h-px bg-gradient-to-r from-transparent via-[#E9A870] to-transparent mt-4"></div>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="bg-gradient-to-r from-[#121212] to-[#0C0C0C] p-4 rounded-lg border border-[#E9A870]/20">
                            <h4 className="font-bold text-white mb-2 font-arial">Prévia da Etiqueta:</h4>
                            <div className="bg-white text-black p-3 rounded text-sm font-mono">
                              <div className="text-center border-b border-gray-300 pb-2 mb-2">
                                <strong>AGNUS - GETI</strong>
                              </div>
                              <div>ID: {ticketDetails.id}</div>
                              <div>TOMB: {ticketDetails.tombamento}</div>
                              <div>UNIDADE: {ticketDetails.unidade}</div>
                              <div>TÉCNICO: {ticketDetails.tecnico}</div>
                              <div>DATA: {new Date().toLocaleDateString("pt-BR")}</div>
                            </div>
                          </div>
                          <div className="flex justify-end gap-3">
                            <Button
                              variant="outline"
                              onClick={() => setPrintDialogOpen(false)}
                              className="bg-gradient-to-r from-[#2A231E] to-[#1C1815] border-[#E9A870]/40 text-[#E0CAA5] hover:bg-gradient-to-r hover:from-[#3D3024] hover:to-[#2A231E] hover:border-[#E9A870] transition-all duration-200"
                            >
                              Cancelar
                            </Button>
                            <Button
                              onClick={handlePrintLabel}
                              className="bg-gradient-to-r from-[#E9A870] to-[#A8784F] hover:from-[#E0CAA5] hover:to-[#E9A870] text-black font-bold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                            >
                              <Printer className="h-4 w-4 mr-2" />
                              Imprimir
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>

                  {/* EXCLUIR REGISTRO */}
                  <div className="relative">
                    <button
                      onClick={() => setDeleteDialogOpen(true)}
                      className="w-16 h-16 flex items-center justify-center rounded-xl bg-[#1C1815] hover:bg-[#2A231E] transition-all duration-200 hover:scale-105 cursor-pointer"
                      title="EXCLUIR REGISTRO"
                    >
                      <div className="w-14 h-14 rounded-xl flex items-center justify-center border-2 border-[#E9A870]">
                        <Trash2 className="h-6 w-6 text-[#E9A870]" />
                      </div>
                    </button>
                    <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                      <AlertDialogContent className="bg-[#1C1815] border-[#E9A870] text-white">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-[#E9A870] text-xl font-abel">
                            Confirmar Exclusão
                          </AlertDialogTitle>
                          <AlertDialogDescription className="text-gray-300 font-arial">
                            Tem certeza que deseja excluir o registro do computador{" "}
                            <span className="font-bold text-white">{ticketDetails.tombamento}</span>?
                            <br />
                            <span className="text-red-400 text-sm">Esta ação não pode ser desfeita.</span>
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="bg-gray-600 hover:bg-gray-700 text-white border-gray-500">
                            Cancelar
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleDeleteRecord}
                            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>

                  {/* EDITAR REGISTRO */}
                  <div className="relative">
                    <button
                      onClick={() => setEditDialogOpen(true)}
                      className="w-16 h-16 flex items-center justify-center rounded-xl bg-[#1C1815] hover:bg-[#2A231E] transition-all duration-200 hover:scale-105 cursor-pointer"
                      title="EDITAR REGISTRO"
                    >
                      <div className="w-14 h-14 rounded-xl flex items-center justify-center border-2 border-[#E9A870]">
                        <Edit className="h-6 w-6 text-[#E9A870]" />
                      </div>
                    </button>
                    <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                      <DialogContent className="bg-gradient-to-b from-[#1C1815] to-[#0C0C0C] border-2 border-[#E9A870] text-white max-w-4xl font-abel shadow-2xl backdrop-blur-sm">
                        <DialogHeader>
                          <DialogTitle className="text-[#E9A870] text-2xl font-bold bg-gradient-to-r from-[#E9A870] to-[#A8784F] bg-clip-text text-transparent">
                            EDITAR REGISTRO
                          </DialogTitle>
                          <div className="w-full h-px bg-gradient-to-r from-transparent via-[#E9A870] to-transparent mt-4"></div>
                        </DialogHeader>
                        <form
                          onSubmit={handleEditSubmit}
                          className="space-y-6 custom-scroll max-h-[70vh] overflow-y-auto p-1"
                        >
                          {/* First Row */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-[#E9A870]">
                                TOMBAMENTO <span className="text-red-400">*</span>
                              </label>
                              <Input
                                placeholder="Ex: 202212345"
                                value={editFormData.tombamento}
                                onChange={(e) => setEditFormData({ ...editFormData, tombamento: e.target.value })}
                                className="bg-gradient-to-r from-[#121212] to-[#0C0C0C] border-[#E9A870]/40 text-white placeholder:text-gray-400 focus:border-[#E9A870] focus:ring-1 focus:ring-[#E9A870]/50 font-abel transition-all duration-200"
                              />
                            </div>

                            <div className="space-y-2">
                              <label className="text-sm font-medium text-[#E9A870]">
                                AMBIENTE <span className="text-red-400">*</span>
                              </label>
                              <Input
                                placeholder="Ex: Médico"
                                value={editFormData.ambiente}
                                onChange={(e) => setEditFormData({ ...editFormData, ambiente: e.target.value })}
                                className="bg-gradient-to-r from-[#121212] to-[#0C0C0C] border-[#E9A870]/40 text-white placeholder:text-gray-400 focus:border-[#E9A870] focus:ring-1 focus:ring-[#E9A870]/50 font-abel transition-all duration-200"
                              />
                            </div>

                            <div className="space-y-2">
                              <label className="text-sm font-medium text-[#E9A870]">TIPO</label>
                              <Input
                                placeholder="Ex: TCORP"
                                value={editFormData.tipo}
                                onChange={(e) => setEditFormData({ ...editFormData, tipo: e.target.value })}
                                className="bg-gradient-to-r from-[#121212] to-[#0C0C0C] border-[#E9A870]/40 text-white placeholder:text-gray-400 focus:border-[#E9A870] focus:ring-1 focus:ring-[#E9A870]/50 font-abel transition-all duration-200"
                              />
                            </div>
                          </div>

                          {/* Second Row */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-[#E9A870]">
                                UNIDADE <span className="text-red-400">*</span>
                              </label>
                              <Select
                                value={editFormData.unidade}
                                onValueChange={(value) => setEditFormData({ ...editFormData, unidade: value })}
                              >
                                <SelectTrigger className="bg-gradient-to-r from-[#121212] to-[#0C0C0C] border-[#E9A870]/40 text-white focus:border-[#E9A870] focus:ring-1 focus:ring-[#E9A870]/50 font-abel transition-all duration-200">
                                  <SelectValue placeholder="SELECIONE A UNIDADE" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#1C1815] border-[#E9A870]/30 text-white custom-scroll">
                                  {unidades.map((unidade) => (
                                    <SelectItem
                                      key={unidade.idUnidade}
                                      value={String(unidade.idUnidade)}
                                      className="focus:bg-[#E9A870]/20 font-arial"
                                    >
                                      {unidade.nomeUnidade}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <label className="text-sm font-medium text-[#E9A870]">
                                TÉCNICO <span className="text-red-400">*</span>
                              </label>
                              <Select
                                value={editFormData.tecnico}
                                onValueChange={(value) => setEditFormData({ ...editFormData, tecnico: value })}
                              >
                                <SelectTrigger className="bg-gradient-to-r from-[#121212] to-[#0C0C0C] border-[#E9A870]/40 text-white focus:border-[#E9A870] focus:ring-1 focus:ring-[#E9A870]/50 font-abel transition-all duration-200">
                                  <SelectValue placeholder="TÉCNICO" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#1C1815] border-[#E9A870]/30 text-white custom-scroll">
                                  {tecnicos.map((tecnico) => (
                                    <SelectItem
                                      key={tecnico.idTec}
                                      value={String(tecnico.idTec)}
                                      className="focus:bg-[#E9A870]/20 font-arial"
                                    >
                                      {tecnico.nomeTec}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          {/* Third Row */}
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-[#E9A870]">
                              DESCRIÇÃO DO DEFEITO <span className="text-red-400">*</span>
                            </label>
                            <Textarea
                              placeholder="Ex: SEM APRESENTAR IMAGEM, PROVÁVEL DF NA MEMÓRIA RAM"
                              value={editFormData.descricao}
                              onChange={(e) => setEditFormData({ ...editFormData, descricao: e.target.value })}
                              className="bg-gradient-to-r from-[#121212] to-[#0C0C0C] border-[#E9A870]/40 text-white placeholder:text-gray-400 focus:border-[#E9A870] focus:ring-1 focus:ring-[#E9A870]/50 min-h-[100px] font-arial resize-none custom-scroll transition-all duration-200"
                            />
                          </div>

                          <div className="flex justify-end gap-4 pt-6 border-t border-[#E9A870]/20">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setEditDialogOpen(false)}
                              className="bg-gradient-to-r from-[#2A231E] to-[#1C1815] border-[#E9A870]/40 text-[#E0CAA5] hover:bg-gradient-to-r hover:from-[#3D3024] hover:to-[#2A231E] hover:border-[#E9A870] transition-all duration-200 font-abel"
                            >
                              CANCELAR
                            </Button>
                            <Button
                              type="submit"
                              disabled={!isEditFormValid}
                              className="bg-gradient-to-r from-[#E9A870] to-[#A8784F] hover:from-[#E0CAA5] hover:to-[#E9A870] text-[#0C0C0C] font-bold disabled:opacity-50 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                            >
                              <Check className="h-4 w-4 mr-2" />
                              ATUALIZAR REGISTRO
                            </Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Related Tickets */}
            <Card className="bg-[#1C1815] border-[#E9A870] border-2 rounded-xl overflow-hidden shadow-2xl backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-[#E9A870] to-[#A8784F] p-4">
                <h3 className="text-lg font-bold text-black font-arial">CHAMADOS RELACIONADOS</h3>
              </CardHeader>
              <CardContent className="p-4 bg-[#1C1815] custom-scroll">
                {relatedLoading ? (
                  <div className="text-gray-400 font-arial">Carregando...</div>
                ) : relatedError ? (
                  <div className="text-red-400 font-arial">{relatedError}</div>
                ) : relatedTickets.length === 0 ? (
                  <div className="text-gray-400 font-arial">Nenhum chamado relacionado encontrado.</div>
                ) : (
                  <div className="space-y-3">
                    {relatedTickets.map((ticket) => (
                      <div
                        key={ticket.id}
                        className="p-3 bg-[#121212] rounded-lg border border-[#E9A870]/20 hover:bg-[#262626] transition-colors cursor-pointer"
                        onClick={() => onNavigate("detalhes", ticket)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-white text-base font-abel">{ticket.id}</span>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(ticket.status)}
                            <Badge className={`${getStatusColor(ticket.status)} text-sm font-arial`}>
                              {ticket.status}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm text-gray-300 mb-1 font-arial">{ticket.tombamento}</p>
                        <p className="text-sm text-gray-400 mb-2 font-arial">{ticket.unidade}</p>
                        <p className="text-sm text-white font-arial">{ticket.descricao}</p>
                        <p className="text-sm text-[#E9A870] mt-1 font-arial">{ticket.dataAbertura}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* History */}
            <Card className="bg-[#1C1815] border-[#E9A870] border-2 rounded-xl overflow-hidden shadow-2xl backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-[#E9A870] to-[#A8784F] p-4">
                <h3 className="text-lg font-bold text-black flex items-center gap-2 font-arial">
                  <History className="h-5 w-5" />
                  HISTÓRICO
                </h3>
              </CardHeader>
              <CardContent className="p-4 bg-[#1C1815] custom-scroll">
                {historyLoading ? (
                  <div className="text-gray-400 font-arial">Carregando...</div>
                ) : historyError ? (
                  <div className="text-red-400 font-arial">{historyError}</div>
                ) : ticketHistory.length === 0 ? (
                  <div className="text-gray-400 font-arial">Nenhum histórico encontrado.</div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto custom-scroll">
                    {ticketHistory.map((item, index) => (
                      <div
                        key={item.id || index}
                        className="flex items-start gap-3 p-3 bg-[#121212] rounded-lg border border-[#E9A870]/20 hover:bg-[#262626] transition-colors"
                      >
                        <div className="w-2 h-2 bg-[#E9A870] rounded-full mt-2 flex-shrink-0"></div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-bold text-white text-sm font-arial">{item.acao}</h4>
                            <span className="text-sm text-gray-400 font-arial">{item.data}</span>
                          </div>
                          <p className="text-sm text-gray-300 mb-1 font-arial">{item.detalhes}</p>
                          <p className="text-sm text-[#E9A870] font-arial">por {item.usuario}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
