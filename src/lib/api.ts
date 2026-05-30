import axios from "axios";
import { API_BASE_URL } from "./constants";

const getStoredValue = (key: string) =>
  typeof window !== "undefined" ? localStorage.getItem(key) : null;

const clearStoredAuth = () => {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("sessionToken");
};

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = getStoredValue("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = getStoredValue("refreshToken");
        const sessionToken = getStoredValue("sessionToken");
        
        if (refreshToken && sessionToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
            refreshToken,
            sessionToken,
          });
          
          const { token } = response.data.data;
          if (typeof window !== "undefined") {
            localStorage.setItem("token", token);
          }
          
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        clearStoredAuth();
        if (typeof window !== "undefined") {
          window.location.href = "/auth/signin";
        }
      }
    }

    return Promise.reject(error);
  }
);

// API endpoints
export const authApi = {
  register: (data: { email: string; password: string; name: string }) =>
    apiClient.post("/auth/register", data),
  login: (data: { email: string; password: string }) =>
    apiClient.post("/auth/login", data),

  verifyEmail: (data: { email: string; otp: string }) =>
    apiClient.post("/auth/verify-email", data),
  logout: () => {
    const sessionToken = getStoredValue("sessionToken");
    return apiClient.post("/auth/logout", { sessionToken });
  },
  getMe: () => apiClient.get("/auth/me"),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    apiClient.post("/auth/change-password", data),
  forgotPassword: (data: { email: string }) =>
    apiClient.post("/auth/forgot-password", data),
  resetPassword: (data: { email: string; otp: string; newPassword: string }) =>
    apiClient.post("/auth/reset-password", data),
};

export const postsApi = {
  getAll: (params?: { page?: number; limit?: number; status?: string; search?: string }) =>
    apiClient.get("/posts", { params }),
  getById: (id: string) => apiClient.get(`/posts/${id}`),
  create: (data: { content: string; isAnonymous?: boolean; visibleTo?: string }) =>
    apiClient.post("/posts", data),
  update: (id: string, data: { content?: string; status?: string }) =>
    apiClient.patch(`/posts/${id}`, data),
  delete: (id: string) => apiClient.delete(`/posts/${id}`),
  getMyPosts: (params?: { page?: number; limit?: number }) =>
    apiClient.get("/posts/my-posts", { params }),
};

export const commentsApi = {
  getByPost: (postId: string, params?: { page?: number; limit?: number }) =>
    apiClient.get(`/comments/post/${postId}`, { params }),
  create: (data: { postId: string; content: string; parentCommentId?: string }) =>
    apiClient.post(`/comments/post/${data.postId}`, { content: data.content, parentCommentId: data.parentCommentId }),
  update: (id: string, data: { content: string }) =>
    apiClient.patch(`/comments/${id}`, data),
  delete: (id: string) => apiClient.delete(`/comments/${id}`),
};

export const reactionsApi = {
  create: (data: { postId: string; reactionType: string }) =>
    apiClient.post(`/reactions/post/${data.postId}`, { reactionType: data.reactionType }),
  delete: (postId: string) => apiClient.delete(`/reactions/post/${postId}`),
  getByPost: (postId: string) => apiClient.get(`/reactions/post/${postId}`),
};

export const votesApi = {
  upvote: (postId: string) =>
    apiClient.post(`/reactions/post/${postId}`, { reactionType: "UPVOTE" }),
  downvote: (postId: string) =>
    apiClient.post(`/reactions/post/${postId}`, { reactionType: "DOWNVOTE" }),
  remove: (postId: string) => apiClient.delete(`/reactions/post/${postId}`),
  getByPost: (postId: string) => apiClient.get(`/reactions/post/${postId}`),
};

export const consultantsApi = {
  getAll: (params?: { 
    page?: number; 
    limit?: number; 
    specialization?: string; 
    minRating?: number;
    maxPrice?: number;
    isAvailable?: boolean;
  }) => apiClient.get("/consultants", { params }),
  getById: (id: string) => apiClient.get(`/consultants/${id}`),
  getMyProfile: () => apiClient.get("/consultants/me/profile"),
  create: (data: {
    professionalTitle: string;
    licenseNumber: string;
    bio: string;
    hourlyRate: number;
    yearsExperience: number;
    specializations: string[];
  }) => apiClient.post("/consultants", data),
  update: (data: Partial<ConsultantData>) =>
    apiClient.patch("/consultants/me/profile", data),
  getReviews: (id: string, params?: { page?: number; limit?: number }) =>
    apiClient.get(`/reviews/consultant/${id}`, { params }),
};

export const consultantApplicationsApi = {
  createPaymentIntent: () => apiClient.post("/consultant-applications/application-payment"),
  submit: (data: FormData) =>
    apiClient.post("/consultant-applications", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),
  getMine: () => apiClient.get("/consultant-applications/me"),
  getAdminList: (params?: { page?: number; limit?: number; status?: string }) =>
    apiClient.get("/consultant-applications/admin", { params }),
  review: (id: string, data: { status: "APPROVED" | "REJECTED"; reviewNote?: string }) =>
    apiClient.patch(`/consultant-applications/admin/${id}/review`, data),
  
};

export const bookingsApi = {
  getAll: (params?: { page?: number; limit?: number; status?: string }) =>
    apiClient.get("/bookings/me", { params }),
  getConsultantBookings: (params?: { page?: number; limit?: number; status?: string }) =>
    apiClient.get("/bookings/consultant/bookings", { params }),
  getById: (id: string) => apiClient.get(`/bookings/${id}`),
  create: (data: {
    consultantId: string;
    scheduledAt: string;
    durationMinutes?: number;
    preSessionNotes?: string;
  }) => apiClient.post("/bookings", data),
  update: (id: string, data: { status?: string; meetingLink?: string }) =>
    apiClient.patch(`/bookings/${id}`, data),
  cancel: (id: string) => apiClient.patch(`/bookings/${id}/cancel`),
  confirm: (id: string) => apiClient.patch(`/bookings/${id}/confirm`),
  decline: (id: string) => apiClient.patch(`/bookings/${id}/decline`),
  complete: (id: string) => apiClient.patch(`/bookings/${id}/complete`),
  getAvailability: (consultantId: string, date: string) =>
    apiClient.get(`/availabilities/slots/${consultantId}`, { params: { fromDate: date } }),
};

export const availabilitiesApi = {
  getMine: () => apiClient.get("/availabilities/me"),
  update: (id: string, data: { dayOfWeek?: number; startTime?: string; endTime?: string; isRecurring?: boolean; isBlocked?: boolean }) =>
    apiClient.patch(`/availabilities/${id}`, data),
  delete: (id: string) => apiClient.delete(`/availabilities/${id}`),
};

export const nicknamesApi = {
  getMine: () => apiClient.get("/nicknames/me"),
  create: (data: { handle: string }) => apiClient.post("/nicknames", data),
  update: (_id: string, data: { handle?: string; avatarUrl?: string }) =>
    apiClient.patch("/nicknames/me", data),
  rotate: () => apiClient.post("/nicknames/me/rotate"),
  checkAvailability: (handle: string) => apiClient.get(`/nicknames/check/${handle}`),
};

export const usersApi = {
  updateProfile: (formData: FormData) =>
    apiClient.patch("/users/me/profile", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  getPublicProfile: (userId: string) => apiClient.get(`/users/profile/${userId}`),
};

export const reportsApi = {
  create: (data: {
    postId?: string;
    commentId?: string;
    reportType: string;
    notes?: string;
  }) => apiClient.post("/reports", data),
};

export const reviewsApi = {
  create: (data: {
    bookingId: string;
    rating: number;
    content?: string;
    isPublic?: boolean;
  }) => apiClient.post("/reviews", data),
  getByConsultant: (consultantId: string, params?: { page?: number; limit?: number }) =>
    apiClient.get(`/reviews/consultant/${consultantId}`, { params }),
  getStats: (consultantId: string) => apiClient.get(`/reviews/consultant/${consultantId}/stats`),
};

export const adminApi = {
  // Legacy / simple
  getUsers: (params?: { page?: number; limit?: number; search?: string }) =>
    apiClient.get("/users", { params }),
  getReports: (params?: { page?: number; limit?: number; status?: string }) =>
    apiClient.get("/reports", { params }),
  getPendingConsultants: (params?: { page?: number; limit?: number }) =>
    apiClient.get("/consultants/admin/pending", { params }),
  getConsultantApplications: (params?: { page?: number; limit?: number; status?: string }) =>
    apiClient.get("/consultant-applications/admin", { params }),
  reviewConsultantApplication: (
    id: string,
    data: { status: "APPROVED" | "REJECTED"; reviewNote?: string }
  ) => apiClient.patch(`/consultant-applications/admin/${id}/review`, data),

  // Admin management endpoints
  getDashboardStats: () => apiClient.get("/admin/dashboard/stats"),
  getDailyStats: (days = 30) => apiClient.get("/admin/stats/daily", { params: { days } }),
  getAllUsers: (params?: { page?: number; limit?: number; search?: string }) =>
    apiClient.get("/admin/users", { params }),
  getUserById: (id: string) => apiClient.get(`/admin/users/${id}`),
  moderateUser: (id: string, data: { action: string; reason?: string }) =>
    apiClient.post(`/admin/users/${id}/moderate`, data),
  deactivateUser: (id: string) => apiClient.patch(`/users/${id}/deactivate`),
  activateUser: (id: string) => apiClient.patch(`/users/${id}/activate`),
  getAllPosts: (params?: { page?: number; limit?: number }) =>
    apiClient.get("/admin/posts", { params }),
  deletePost: (id: string) => apiClient.delete(`/admin/posts/${id}`),
  updatePost: (id: string, data: object) => apiClient.patch(`/admin/posts/${id}`, data),
  getAllConsultants: (params?: { page?: number; limit?: number }) =>
    apiClient.get("/admin/consultants", { params }),
  verifyConsultant: (id: string, data: { verificationStatus: "VERIFIED" | "PENDING" | "REJECTED" | "SUSPENDED" }) =>
    apiClient.patch(`/consultants/${id}/verification`, data),
  changeUserRole: (id: string, role: "USER" | "ADMIN") =>
    apiClient.patch(`/admin/users/${id}/role`, { role }),
};

// Types
interface ConsultantData {
  professionalTitle?: string;
  licenseNumber?: string;
  bio?: string;
  hourlyRate?: number;
  yearsExperience?: number;
  specializations?: string[];
  isAvailable?: boolean;
}
