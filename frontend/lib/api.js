// front-end/lib/api.js
import axios from "axios"

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "http://10.87.20.9:3005",
    withCredentials: true,
});

// Equipamentos
export const getEquipamentos = () => api.get("/equipamentos");
export const getEquipamento = (id) => api.get(`/equipamentos/${id}`);
export const createEquipamento = (payload) => api.post("/equipamentos", payload);
export const updateEquipamento = (id, payload) => api.put(`/equipamentos/${id}`, payload);
export const deleteEquipamento = (id) => api.delete(`/equipamentos/${id}`);
export const patchEquipamentoStatus = (id, status) => api.patch(`/equipamentos/${id}/status`, { status });
export const getEquipamentoEtiqueta = (id) => api.get(`/equipamentos/${id}/etiqueta`, { responseType: 'blob' });
export const getEquipamentoRelacionados = (id) => api.get(`/equipamentos/${id}/relacionados`);
export const getEquipamentoHistorico = (id) => api.get(`/equipamentos/${id}/historico`);
export const buscarPorCodigoEtiqueta = (codigo) => api.get(`/equipamentos/etiqueta/${codigo}`);

// Workflow endpoints
export const moverParaReparo = (id, payload) => api.put(`/equipamentos/${id}/reparo`, payload);
export const completarPronto = (id, payload) => api.put(`/equipamentos/${id}/pronto`, payload);
export const marcarDescarte = (id, payload) => api.put(`/equipamentos/${id}/descarte`, payload);

// Unidades
export const getUnidades = () => api.get("/unidades");
export const createUnidade = (payload) => api.post("/unidades", payload);
export const updateUnidade = (id, payload) => api.put(`/unidades/${id}`, payload);
export const deleteUnidade = (id) => api.delete(`/unidades/${id}`);

// Tecnicos
export const getTecnicos = () => api.get("/tecnicos");
export const createTecnico = (payload) => api.post("/tecnicos", payload);
export const updateTecnico = (id, payload) => api.put(`/tecnicos/${id}`, payload);
export const deleteTecnico = (id) => api.delete(`/tecnicos/${id}`);

export default api;
