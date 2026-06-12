import api from './axios'

// ── Auth ─────────────────────────────────────────────────────────────────────
export const authApi = {
  loginHospital:   d => api.post('/accounts/login/', d),
  loginDonor:      d => api.post('/accounts/login/', d),
  loginWard:       d => api.post('/ward/login/', d),
  registerHospital:d => api.post('/accounts/hospital/register/', d),
  registerDonor:   d => api.post('/accounts/donor/register/', d),
  registerWard:    d => api.post('/ward/register/', d),
  logout:          d => api.post('/accounts/logout/', d),
  me:              () => api.get('/accounts/me/'),
  changePassword:  d => api.post('/accounts/change-password/', d),
  updateLocation:  d => api.patch('/accounts/location/', d),
  updateFcmToken:  d => api.patch('/accounts/fcm-token/', d),
  toggleAvailability: () => api.patch('/accounts/donor/availability/'),
  hospitalProfile: () => api.get('/accounts/hospital/profile/'),
  donorProfile:    () => api.get('/accounts/donor/profile/'),
  updateHospital:  d => api.patch('/accounts/hospital/profile/', d),
  updateDonor:     d => api.patch('/accounts/donor/profile/', d),
  wards:           p => api.get('/ward/wards/', { params: p }),
}

// ── Donation ─────────────────────────────────────────────────────────────────
export const donationApi = {
  createRequest:      d => api.post('/donation/requests/', d),
  hospitalRequests:   p => api.get('/donation/requests/hospital/', { params: p }),
  requestDetail:      id => api.get(`/donation/requests/${id}/`),
  cancelRequest:      id => api.post(`/donation/requests/${id}/cancel/`),
  top3:               id => api.get(`/donation/requests/${id}/top3/`),
  confirmAll:         (id, d) => api.post(`/donation/requests/${id}/confirm-all/`, d),
  dashboard:          () => api.get('/donation/dashboard/'),
  analytics:          () => api.get('/donation/analytics/'),
  tvScreen:           id => api.get(`/donation/tv/${id}/`),
  // Donor
  pendingRequests:    () => api.get('/donation/donor/pending-requests/'),
  respond:            (id, d) => api.post(`/donation/responses/${id}/respond/`, d),
  updateLocation:     (id, d) => api.patch(`/donation/responses/${id}/location/`, d),
  completeDonation:   (id, d) => api.post(`/donation/responses/${id}/complete/`, d),
  donorHistory:       () => api.get('/donation/donor/history/'),
  donorResponses:     () => api.get('/donation/donor/responses/'),
  cooldown:           () => api.get('/donation/donor/cooldown/'),
  // Chat
  chatHistory:        id => api.get(`/donation/chat/${id}/messages/`),
  sendMessage:        (id, d) => api.post(`/donation/chat/${id}/messages/`, d),
  unreadCount:        () => api.get('/donation/chat/unread/'),
  // Ratings
  rateDonor:          (id, d) => api.post(`/donation/records/${id}/rate/`, d),
  myBadges:           () => api.get('/donation/my/badges/'),
  // Camps
  camps:              p => api.get('/donation/camps/', { params: p }),
  registerCamp:       id => api.post(`/donation/camps/${id}/register/`),
  cancelCampReg:      id => api.delete(`/donation/camps/${id}/register/`),
  myCampRegs:         () => api.get('/donation/my/camp-registrations/'),
  myCamps:            () => api.get('/donation/my/camps/'),
  createCamp:         d => api.post('/donation/camps/', d),
  // Directions
  directions:         p => api.get('/donation/directions/', { params: p }),
}

// ── Ward ─────────────────────────────────────────────────────────────────────
export const wardApi = {
  dashboard:         () => api.get('/ward/dashboard/'),
  alerts:            p => api.get('/ward/alerts/', { params: p }),
  alertDetail:       id => api.get(`/ward/alerts/${id}/`),
  top3Donors:        id => api.get(`/ward/alerts/${id}/top3/`),
  broadcast:         id => api.post(`/ward/alerts/${id}/broadcast/`),
  resolve:           id => api.post(`/ward/alerts/${id}/resolve/`),
  notificationLog:   id => api.get(`/ward/alerts/${id}/notifications/`),
  profile:           () => api.get('/ward/profile/'),
  updateFcm:         d => api.post('/ward/fcm-token/', d),
}
