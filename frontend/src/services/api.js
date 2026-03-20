import axios from 'axios'

const API_BASE_URL = 'http://localhost:8080/api'

// Store admin key in memory
let adminKey = null

export const setAdminKey = (key) => {
  adminKey = key
}

export const getAdminKey = () => adminKey

export const clearAdminKey = () => {
  adminKey = null
}

// Helper function to get admin headers
const getAdminHeaders = () => {
  if (adminKey) {
    return {
      'X-ADMIN-KEY': adminKey
    }
  }
  return {}
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Course APIs
export const getAllCourses = () => api.get('/courses')
export const getCourseById = (id) => api.get(`/courses/${id}`)
export const getCourseBySlug = (slug) => api.get(`/courses/slug/${slug}`)
export const getCourseUnits = (id) => api.get(`/courses/${id}/course-units`)
export const getCourseYears = (id) => api.get(`/courses/${id}/years`)
export const getCourseSemesters = (id, year) => api.get(`/courses/${id}/semesters?year=${year}`)

// Exam APIs
export const getExamPapers = (params) => {
  const { course, year, semester, type, academicYear, courseUnitName, page = 0, size = 20 } = params
  return api.get('/exams', {
    params: {
      course,
      year,
      semester,
      type,
      academicYear,
      courseUnitName,
      page,
      size,
    },
  })
}

export const getAcademicYears = (courseId) => api.get(`/exams/academicYears?course=${courseId}`)

// Admin APIs (require X-ADMIN-KEY header)
export const createCourseUnit = (data) => api.post('/admin/course-units', data, {
  headers: getAdminHeaders()
})

export const updateCourseUnit = (id, data) => api.put(`/admin/course-units/${id}`, data, {
  headers: getAdminHeaders()
})

export const deleteCourseUnit = (id) => api.delete(`/admin/course-units/${id}`, {
  headers: getAdminHeaders()
})

export const uploadExamPaper = (formData) => {
  return api.post('/admin/exams', formData, {
    headers: {
      ...getAdminHeaders(),
      'Content-Type': 'multipart/form-data',
    },
  })
}

export const deleteExamPaper = (id) => api.delete(`/admin/exams/${id}`, {
  headers: getAdminHeaders()
})

export default api
