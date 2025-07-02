"use client"

import type React from "react"
import api from "@/lib/api"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Menu, ChevronLeft, Check, Home, ChevronRight } from "lucide-react"
import { SidebarMenu } from "@/components/sidebar-menu"
import { toast, Toaster } from "sonner"

interface RegistroProps {
  onNavigate: (page: string, data?: any) => void
}

export default function Registro({ onNavigate }: RegistroProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [formData, setFormData] = useState({
    tombamento: "",
    ambiente: "",
    tipo: "",
    unidade: "",
    descricao: "",
    tecnico: "",
  })
  const [unidades, setUnidades] = useState<{ idUnidade: number; nomeUnidade: string }[]>([])
  const [tecnicos, setTecnicos] = useState<{ idTec: number; nomeTec: string }[]>([])

  useEffect(() => {
    api.get("/unidades").then((res) => setUnidades(res.data)).catch(() => toast.error("Erro ao carregar unidades"))
    api.get("/tecnicos").then((res) => setTecnicos(res.data)).catch(() => toast.error("Erro ao carregar técnicos"))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Map frontend fields to backend fields
      const payload = {
        idTomb: formData.tombamento,
        ambiente: formData.ambiente,
        tipo: formData.tipo,
        descDefeito: formData.descricao,
        idUnidade: Number(formData.unidade),
        idTecnico: Number(formData.tecnico),
      };
      await api.post("/equipamentos", payload);
      toast.success("Chamado registrado com sucesso!", {
        duration: 3000,
        position: "top-right",
      });
      onNavigate("home");
    } catch (err) {
      toast.error("Erro ao registrar chamado. Verifique os dados e tente novamente.");
    }
  }

  const isFormValid =
    formData.tombamento && formData.ambiente && formData.unidade && formData.descricao && formData.tecnico

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
        currentPage="registro"
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
            <span className="text-gray-400 font-arial">Registro</span>
          </div>
        </div>
      </header>

      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-[58px] font-afacad bg-gradient-to-r from-[#E9A870] via-[#E0CAA5] to-[#A8784F] bg-clip-text text-transparent font-semibold leading-tight drop-shadow-sm">
            REGISTRO
          </h2>
          <p className="text-[32px] font-afacad text-[#E0CAA5] leading-tight opacity-90">ABERTURA DE CHAMADOS</p>
        </div>

        {/* Centered Form Container */}
        <div className="flex justify-center">
          <Card className="w-full max-w-5xl bg-[#1C1815] border-[#E9A870] border-2 rounded-xl overflow-hidden shadow-2xl backdrop-blur-sm hover:shadow-[#E9A870]/10 transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-[#E9A870] to-[#A8784F] p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-black font-arial">INFORMAÇÕES DE REGISTRO DE ENTRADA</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onNavigate("home")}
                  className="text-black hover:bg-black/10 rounded-lg transition-all duration-200 hover:scale-110"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-8 bg-[#1C1815] space-y-6 custom-scroll">
              <form onSubmit={handleSubmit} className="space-y-6 custom-scroll max-h-[70vh] overflow-y-auto p-1">
                {/* First Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#E9A870] font-arial">
                      TOMBAMENTO <span className="text-red-400">*</span>
                    </label>
                    <Input
                      placeholder="Ex: 202212345"
                      value={formData.tombamento}
                      onChange={(e) => setFormData({ ...formData, tombamento: e.target.value })}
                      className="bg-[#121212] border-[#E9A870]/30 text-white placeholder:text-gray-500 focus:border-[#E9A870] font-abel h-12 text-base"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#E9A870] font-arial">
                      AMBIENTE <span className="text-red-400">*</span>
                    </label>
                    <Input
                      placeholder="Ex: Médico"
                      value={formData.ambiente}
                      onChange={(e) => setFormData({ ...formData, ambiente: e.target.value })}
                      className="bg-[#121212] border-[#E9A870]/30 text-white placeholder:text-gray-500 focus:border-[#E9A870] font-abel h-12 text-base"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#E9A870] font-arial">TIPO</label>
                    <Input
                      placeholder="Ex: TCORP"
                      value={formData.tipo}
                      onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                      className="bg-[#121212] border-[#E9A870]/30 text-white placeholder:text-gray-500 focus:border-[#E9A870] font-abel h-12 text-base"
                    />
                  </div>
                </div>

                {/* Second Row */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#E9A870] font-arial">
                    UNIDADE <span className="text-red-400">*</span>
                  </label>
                  <Select
                    value={formData.unidade}
                    onValueChange={(value) => setFormData({ ...formData, unidade: value })}
                  >
                    <SelectTrigger className="bg-gradient-to-r from-[#121212] to-[#0C0C0C] border-[#E9A870]/40 text-white focus:border-[#E9A870] focus:ring-1 focus:ring-[#E9A870]/50 font-abel transition-all duration-200">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1C1815] border-[#E9A870]/30 text-white custom-scroll">
                      {unidades.map((u) => (
                        <SelectItem key={u.idUnidade} value={u.idUnidade.toString()}>
                          {u.nomeUnidade}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Third Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-2">
                    <label className="text-sm font-medium text-[#E9A870] font-arial">
                      DESCRIÇÃO DO DEFEITO <span className="text-red-400">*</span>
                    </label>
                    <Textarea
                      placeholder="Ex: SEM APRESENTAR IMAGEM, PROVÁVEL DF NA MEMÓRIA RAM"
                      value={formData.descricao}
                      onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                      className="bg-[#121212] border-[#E9A870]/30 text-white placeholder:text-gray-500 focus:border-[#E9A870] min-h-[140px] font-arial resize-none text-base custom-scroll"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#E9A870] font-arial">
                      TÉCNICO <span className="text-red-400">*</span>
                    </label>
                    <Select
                      value={formData.tecnico}
                      onValueChange={(value) => setFormData({ ...formData, tecnico: value })}
                    >
                      <SelectTrigger className="bg-gradient-to-r from-[#121212] to-[#0C0C0C] border-[#E9A870]/40 text-white focus:border-[#E9A870] focus:ring-1 focus:ring-[#E9A870]/50 font-abel transition-all duration-200">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1C1815] border-[#E9A870]/30 text-white custom-scroll">
                        {tecnicos.map((t) => (
                          <SelectItem key={t.idTec} value={t.idTec.toString()}>
                            {t.nomeTec}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-center pt-6 border-t border-[#E9A870]/20">
                  <Button
                    type="submit"
                    disabled={!isFormValid}
                    className="bg-gradient-to-r from-[#E9A870] to-[#A8784F] hover:from-[#E0CAA5] hover:to-[#E9A870] text-black font-bold px-10 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                  >
                    <Check className="h-6 w-6 mr-3" />
                    REGISTRAR CHAMADO
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
