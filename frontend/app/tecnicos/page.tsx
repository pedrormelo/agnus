"use client"

import React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
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
import { Menu, Plus, Filter, Edit, Trash2, Search, X, Phone, Mail, Check, Home, ChevronRight } from "lucide-react"
import { SidebarMenu } from "@/components/sidebar-menu"
import { cn } from "@/lib/utils"
import { toast, Toaster } from "sonner"

interface TecnicosProps {
  onNavigate: (page: string, data?: any) => void
  data?: any
}

// Mock data for technicians
const mockTecnicos = [
  {
    id: 1,
    nome: "JOÃO SILVA",
    atuacao: "INTERNO",
    telefone: "(81) 99999-1111",
    email: "joao.silva@saude.jaboatao.pe.gov.br",
    unidade: "USF RIO DAS VELHAS II",
    dataAdmissao: "2023-01-15",
    especialidades: ["Hardware", "Redes"],
    status: "ATIVO",
  },
  {
    id: 2,
    nome: "MARIA SANTOS",
    atuacao: "EXTERNO",
    telefone: "(81) 99999-2222",
    email: "maria.santos@empresa.com",
    unidade: "MÚLTIPLAS",
    dataAdmissao: "2023-03-20",
    especialidades: ["Software", "Sistemas"],
    status: "ATIVO",
  },
  {
    id: 3,
    nome: "PEDRO COSTA",
    atuacao: "INTERNO",
    telefone: "(81) 99999-3333",
    email: "pedro.costa@saude.jaboatao.pe.gov.br",
    unidade: "USF QUADROS III",
    dataAdmissao: "2022-11-10",
    especialidades: ["Hardware", "Manutenção"],
    status: "ATIVO",
  },
  {
    id: 4,
    nome: "ANA LIMA",
    atuacao: "INTERNO",
    telefone: "(81) 99999-4444",
    email: "ana.lima@saude.jaboatao.pe.gov.br",
    unidade: "USF VIETNÃ",
    dataAdmissao: "2023-06-01",
    especialidades: ["Software", "Suporte"],
    status: "ATIVO",
  },
  {
    id: 5,
    nome: "FELIPE FILIPE FELIPE",
    atuacao: "EXTERNO",
    telefone: "(81) 99999-5555",
    email: "felipe@empresa.com",
    unidade: "MÚLTIPLAS",
    dataAdmissao: "2023-08-15",
    especialidades: ["Redes", "Infraestrutura"],
    status: "ATIVO",
  },
]

export default function Tecnicos({ onNavigate, data }: TecnicosProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("TODOS")
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredTecnicos, setFilteredTecnicos] = useState(mockTecnicos)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedTecnico, setSelectedTecnico] = useState<any>(null)
  const [tecnicoToDelete, setTecnicoToDelete] = useState<any>(null)
  const [formData, setFormData] = useState({
    nome: "",
    atuacao: "",
    telefone: "",
    email: "",
    unidade: "",
    especialidades: "",
  })

  const tabs = ["TODOS", "INTERNOS", "EXTERNOS"]
  const unidades = ["USF RIO DAS VELHAS II", "USF QUADROS III", "USF VIETNÃ", "USF CENTRO", "MÚLTIPLAS"]

  // Filter technicians based on search and tab
  React.useEffect(() => {
    let filtered = mockTecnicos

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (tecnico) =>
          tecnico.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tecnico.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tecnico.unidade.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tecnico.atuacao.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Apply tab filter
    if (activeTab === "INTERNOS") {
      filtered = filtered.filter((tecnico) => tecnico.atuacao === "INTERNO")
    } else if (activeTab === "EXTERNOS") {
      filtered = filtered.filter((tecnico) => tecnico.atuacao === "EXTERNO")
    }

    setFilteredTecnicos(filtered)
  }, [searchQuery, activeTab])

  // Highlight selected technician if coming from another page
  React.useEffect(() => {
    if (data?.selectedTecnico) {
      const tecnico = mockTecnicos.find((t) => t.nome === data.selectedTecnico)
      if (tecnico) {
        setSelectedTecnico(tecnico)
        // Auto-scroll to technician or highlight it
      }
    }
  }, [data])

  const handleAddTecnico = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would normally submit to API
    console.log("Adding technician:", formData)
    toast.success("Técnico adicionado com sucesso!", {
      duration: 3000,
      position: "top-right",
    })
    setIsAddDialogOpen(false)
    setFormData({
      nome: "",
      atuacao: "",
      telefone: "",
      email: "",
      unidade: "",
      especialidades: "",
    })
  }

  const handleEditTecnico = (tecnico: any) => {
    setSelectedTecnico(tecnico)
    setFormData({
      nome: tecnico.nome,
      atuacao: tecnico.atuacao,
      telefone: tecnico.telefone,
      email: tecnico.email,
      unidade: tecnico.unidade,
      especialidades: tecnico.especialidades.join(", "),
    })
    setIsEditDialogOpen(true)
  }

  const handleUpdateTecnico = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would normally submit to API
    console.log("Updating technician:", formData)
    toast.success("Técnico atualizado com sucesso!", {
      duration: 3000,
      position: "top-right",
    })
    setIsEditDialogOpen(false)
    setSelectedTecnico(null)
  }

  const handleDeleteClick = (tecnico: any) => {
    setTecnicoToDelete(tecnico)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (tecnicoToDelete) {
      toast.success(`Técnico ${tecnicoToDelete.nome} foi excluído com sucesso`, {
        duration: 3000,
        position: "top-right",
      })
      setDeleteDialogOpen(false)
      setTecnicoToDelete(null)
    }
  }

  const isFormValid = formData.nome && formData.atuacao && formData.telefone && formData.email && formData.unidade

  return (
    <div className="min-h-screen bg-[#191818] text-white font-abel">
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
        currentPage="tecnicos"
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
            <span className="text-gray-400 font-arial">Técnicos</span>
          </div>
        </div>
      </header>

      <div className="p-6 custom-scroll">
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-2">
            <h2 className="text-[58px] font-afacad bg-gradient-to-r from-[#E9A870] via-[#E0CAA5] to-[#A8784F] bg-clip-text text-transparent font-semibold leading-tight drop-shadow-sm">
              TÉCNICOS
            </h2>
            {/* Add Technician Dialog */}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  size="icon"
                  className="bg-gradient-to-r from-[#3D3024] to-[#2a2a2a] hover:from-[#E9A870]/20 hover:to-[#A8784F]/20 rounded-full h-10 w-10 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 border border-[#E9A870]/20"
                >
                  <Plus className="h-5 w-5 text-[#E9A870]" />
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gradient-to-b from-[#1C1815] to-[#0C0C0C] border-2 border-[#E9A870] text-white max-w-2xl font-abel shadow-2xl backdrop-blur-sm">
                <DialogHeader>
                  <DialogTitle className="text-[#E9A870] text-2xl font-bold bg-gradient-to-r from-[#E9A870] to-[#A8784F] bg-clip-text text-transparent">
                    ADICIONAR TÉCNICO
                  </DialogTitle>
                  <div className="w-full h-px bg-gradient-to-r from-transparent via-[#E9A870] to-transparent mt-4"></div>
                </DialogHeader>
                <form onSubmit={handleAddTecnico} className="space-y-6 custom-scroll max-h-[70vh] overflow-y-auto p-1">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-[#E9A870]">
                        NOME COMPLETO <span className="text-red-400">*</span>
                      </label>
                      <Input
                        placeholder="Nome do técnico"
                        value={formData.nome}
                        onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                        className="bg-gradient-to-r from-[#121212] to-[#0C0C0C] border-[#E9A870]/40 text-white placeholder:text-gray-400 focus:border-[#E9A870] focus:ring-1 focus:ring-[#E9A870]/50 font-abel transition-all duration-200"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-[#E9A870]">
                        ATUAÇÃO <span className="text-red-400">*</span>
                      </label>
                      <Select
                        value={formData.atuacao}
                        onValueChange={(value) => setFormData({ ...formData, atuacao: value })}
                      >
                        <SelectTrigger className="bg-gradient-to-r from-[#121212] to-[#0C0C0C] border-[#E9A870]/40 text-white focus:border-[#E9A870] focus:ring-1 focus:ring-[#E9A870]/50 font-abel transition-all duration-200">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1C1815] border-[#E9A870]/30 text-white custom-scroll">
                          <SelectItem value="INTERNO">INTERNO</SelectItem>
                          <SelectItem value="EXTERNO">EXTERNO</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-[#E9A870]">
                        TELEFONE <span className="text-red-400">*</span>
                      </label>
                      <Input
                        placeholder="(81) 99999-9999"
                        value={formData.telefone}
                        onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                        className="bg-gradient-to-r from-[#121212] to-[#0C0C0C] border-[#E9A870]/40 text-white placeholder:text-gray-400 focus:border-[#E9A870] focus:ring-1 focus:ring-[#E9A870]/50 font-abel transition-all duration-200"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-[#E9A870]">
                        EMAIL <span className="text-red-400">*</span>
                      </label>
                      <Input
                        type="email"
                        placeholder="email@exemplo.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="bg-gradient-to-r from-[#121212] to-[#0C0C0C] border-[#E9A870]/40 text-white placeholder:text-gray-400 focus:border-[#E9A870] focus:ring-1 focus:ring-[#E9A870]/50 font-abel transition-all duration-200"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-[#E9A870]">
                        UNIDADE <span className="text-red-400">*</span>
                      </label>
                      <Select
                        value={formData.unidade}
                        onValueChange={(value) => setFormData({ ...formData, unidade: value })}
                      >
                        <SelectTrigger className="bg-gradient-to-r from-[#121212] to-[#0C0C0C] border-[#E9A870]/40 text-white focus:border-[#E9A870] focus:ring-1 focus:ring-[#E9A870]/50 font-abel transition-all duration-200">
                          <SelectValue placeholder="Selecione a unidade" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1C1815] border-[#E9A870]/30 text-white custom-scroll">
                          {unidades.map((unidade) => (
                            <SelectItem key={unidade} value={unidade}>
                              {unidade}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-[#E9A870]">ESPECIALIDADES</label>
                      <Input
                        placeholder="Hardware, Software, Redes..."
                        value={formData.especialidades}
                        onChange={(e) => setFormData({ ...formData, especialidades: e.target.value })}
                        className="bg-gradient-to-r from-[#121212] to-[#0C0C0C] border-[#E9A870]/40 text-white placeholder:text-gray-400 focus:border-[#E9A870] focus:ring-1 focus:ring-[#E9A870]/50 font-abel transition-all duration-200"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-4 pt-6 border-t border-[#E9A870]/20">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsAddDialogOpen(false)}
                      className="border-[#E9A870]/40 text-[#E0CAA5] hover:bg-[#E9A870]/10 hover:border-[#E9A870] transition-all duration-200 font-abel"
                    >
                      CANCELAR
                    </Button>
                    <Button
                      type="submit"
                      disabled={!isFormValid}
                      className="bg-gradient-to-r from-[#E9A870] to-[#A8784F] hover:from-[#E0CAA5] hover:to-[#E9A870] text-[#0C0C0C] font-bold disabled:opacity-50 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      ADICIONAR
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          <p className="text-[32px] font-afacad text-[#E0CAA5] leading-tight opacity-90">INTERNOS E EXTERNOS</p>

          {/* Filter and Tabs */}
          <div className="flex items-center gap-6 mb-6 mt-6">
            <Button
              variant="outline"
              size="icon"
              className="bg-[#3D3024] border-[#E9A870]/20 hover:bg-[#4D4034] rounded-lg h-10 w-10 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
            >
              <Filter className="h-5 w-5 text-[#E9A870]" />
            </Button>

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
                  type="text"
                  placeholder="Pesquisar técnicos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={cn(
                    "h-10 bg-transparent border-0 focus-visible:ring-0 text-white placeholder:text-gray-400",
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
                  className={`text-base font-medium px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105 ${
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

        {/* Table */}
        <Card className="bg-[#1C1815] border-[#E9A870] border-2 rounded-xl overflow-hidden shadow-2xl backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-[#E9A870] to-[#A8784F] p-0">
            <div className="grid grid-cols-4 gap-6 px-6 py-4 text-black font-bold text-lg">
              <div className="text-center">ID</div>
              <div>NOME</div>
              <div>ATUAÇÃO</div>
              <div>AÇÕES</div>
            </div>
          </CardHeader>
          <CardContent className="p-0 min-h-[350px] bg-[#1C1815] custom-scroll">
            {filteredTecnicos.length > 0 ? (
              filteredTecnicos.map((tecnico, index) => (
                <div
                  key={tecnico.id}
                  className={`grid grid-cols-4 gap-6 px-6 py-4 border-b border-[#E9A870]/30 items-center hover:bg-gradient-to-r hover:from-gray-800/20 hover:to-gray-700/20 transition-all duration-300 group hover:scale-[1.01] hover:shadow-lg ${
                    selectedTecnico?.id === tecnico.id ? "bg-[#E9A870]/10 border-[#E9A870]/50" : ""
                  }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="text-gray-300 group-hover:text-white transition-colors text-center font-bold">
                    {tecnico.id}
                  </div>
                  <div className="space-y-1">
                    <div className="text-gray-300 group-hover:text-white transition-colors font-bold">
                      {tecnico.nome}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Mail className="h-3 w-3" />
                      {tecnico.email}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Phone className="h-3 w-3" />
                      {tecnico.telefone}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div
                      className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${
                        tecnico.atuacao === "INTERNO"
                          ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                          : "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                      }`}
                    >
                      {tecnico.atuacao}
                    </div>
                    <div className="text-sm text-gray-400">{tecnico.especialidades.join(", ")}</div>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditTecnico(tecnico)}
                      className="h-8 w-8 hover:bg-gradient-to-r hover:from-gray-700/50 hover:to-gray-600/50 transition-all duration-200 hover:scale-110"
                    >
                      <Edit className="h-4 w-4 text-[#E0CAA5]" />
                    </Button>
                    <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteClick(tecnico)}
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
                            Tem certeza que deseja excluir o técnico{" "}
                            <span className="font-bold text-white">{tecnicoToDelete?.nome}</span>?
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
              ))
            ) : (
              <div className="flex justify-center items-center h-40 text-gray-400">Nenhum técnico encontrado</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-gradient-to-b from-[#1C1815] to-[#0C0C0C] border-2 border-[#E9A870] text-white max-w-2xl font-abel shadow-2xl backdrop-blur-sm">
          <DialogHeader>
            <DialogTitle className="text-[#E9A870] text-2xl font-bold bg-gradient-to-r from-[#E9A870] to-[#A8784F] bg-clip-text text-transparent">
              EDITAR TÉCNICO
            </DialogTitle>
            <div className="w-full h-px bg-gradient-to-r from-transparent via-[#E9A870] to-transparent mt-4"></div>
          </DialogHeader>
          <form onSubmit={handleUpdateTecnico} className="space-y-6 custom-scroll max-h-[70vh] overflow-y-auto p-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#E9A870]">
                  NOME COMPLETO <span className="text-red-400">*</span>
                </label>
                <Input
                  placeholder="Nome do técnico"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="bg-gradient-to-r from-[#121212] to-[#0C0C0C] border-[#E9A870]/40 text-white placeholder:text-gray-400 focus:border-[#E9A870] focus:ring-1 focus:ring-[#E9A870]/50 font-abel transition-all duration-200"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#E9A870]">
                  ATUAÇÃO <span className="text-red-400">*</span>
                </label>
                <Select
                  value={formData.atuacao}
                  onValueChange={(value) => setFormData({ ...formData, atuacao: value })}
                >
                  <SelectTrigger className="bg-gradient-to-r from-[#121212] to-[#0C0C0C] border-[#E9A870]/40 text-white focus:border-[#E9A870] focus:ring-1 focus:ring-[#E9A870]/50 font-abel transition-all duration-200">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1C1815] border-[#E9A870]/30 text-white custom-scroll">
                    <SelectItem value="INTERNO">INTERNO</SelectItem>
                    <SelectItem value="EXTERNO">EXTERNO</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#E9A870]">
                  TELEFONE <span className="text-red-400">*</span>
                </label>
                <Input
                  placeholder="(81) 99999-9999"
                  value={formData.telefone}
                  onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                  className="bg-gradient-to-r from-[#121212] to-[#0C0C0C] border-[#E9A870]/40 text-white placeholder:text-gray-400 focus:border-[#E9A870] focus:ring-1 focus:ring-[#E9A870]/50 font-abel transition-all duration-200"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#E9A870]">
                  EMAIL <span className="text-red-400">*</span>
                </label>
                <Input
                  type="email"
                  placeholder="email@exemplo.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="bg-gradient-to-r from-[#121212] to-[#0C0C0C] border-[#E9A870]/40 text-white placeholder:text-gray-400 focus:border-[#E9A870] focus:ring-1 focus:ring-[#E9A870]/50 font-abel transition-all duration-200"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#E9A870]">
                  UNIDADE <span className="text-red-400">*</span>
                </label>
                <Select
                  value={formData.unidade}
                  onValueChange={(value) => setFormData({ ...formData, unidade: value })}
                >
                  <SelectTrigger className="bg-gradient-to-r from-[#121212] to-[#0C0C0C] border-[#E9A870]/40 text-white focus:border-[#E9A870] focus:ring-1 focus:ring-[#E9A870]/50 font-abel transition-all duration-200">
                    <SelectValue placeholder="Selecione a unidade" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1C1815] border-[#E9A870]/30 text-white custom-scroll">
                    {unidades.map((unidade) => (
                      <SelectItem key={unidade} value={unidade}>
                        {unidade}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#E9A870]">ESPECIALIDADES</label>
                <Input
                  placeholder="Hardware, Software, Redes..."
                  value={formData.especialidades}
                  onChange={(e) => setFormData({ ...formData, especialidades: e.target.value })}
                  className="bg-gradient-to-r from-[#121212] to-[#0C0C0C] border-[#E9A870]/40 text-white placeholder:text-gray-400 focus:border-[#E9A870] focus:ring-1 focus:ring-[#E9A870]/50 font-abel transition-all duration-200"
                />
              </div>
            </div>
            <div className="flex justify-end gap-4 pt-6 border-t border-[#E9A870]/20">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                className="bg-gradient-to-r from-[#2A231E] to-[#1C1815] border-[#E9A870]/40 text-[#E0CAA5] hover:bg-gradient-to-r hover:from-[#3D3024] hover:to-[#2A231E] hover:border-[#E9A870] transition-all duration-200 font-abel"
              >
                CANCELAR
              </Button>
              <Button
                type="submit"
                disabled={!isFormValid}
                className="bg-gradient-to-r from-[#E9A870] to-[#A8784F] hover:from-[#E0CAA5] hover:to-[#E9A870] text-[#0C0C0C] font-bold disabled:opacity-50 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
              >
                <Check className="h-4 w-4 mr-2" />
                ATUALIZAR
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
