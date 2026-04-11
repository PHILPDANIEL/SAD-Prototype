import api from './api'
export const orderService = {
  getAll:      ()              => api.get('/orders'),
  getById:     (id)            => api.get(`/orders/${id}`),
  updateStatus:(id, status)    => api.patch(`/orders/${id}/status`, { status }),
}