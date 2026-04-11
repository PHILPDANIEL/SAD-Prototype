import api from './api'
export const salesService = {
  getSummary:   ()     => api.get('/sales/summary'),
  getTopProducts: ()   => api.get('/sales/top-products'),
  getByRange:   (from, to) => api.get('/sales', { params: { from, to } }),
}