import api from './api'
export const addonService = {
  getAll:  ()         => api.get('/addons'),
  getById: (id)       => api.get(`/addons/${id}`),
  create:  (data)     => api.post('/addons', data),
  update:  (id, data) => api.put(`/addons/${id}`, data),
  remove:  (id)       => api.delete(`/addons/${id}`),
}