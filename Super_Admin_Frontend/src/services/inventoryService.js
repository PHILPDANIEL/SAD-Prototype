import api from './api'
export const inventoryService = {
  getAll:  ()         => api.get('/inventory'),
  update:  (id, data) => api.put(`/inventory/${id}`, data),
}