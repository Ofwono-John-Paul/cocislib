import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { getAllCourses, getCourseUnits, createCourseUnit, updateCourseUnit, deleteCourseUnit, uploadExamPaper, setAdminKey, getAdminKey, clearAdminKey } from '../services/api'

function AdminPage() {
  const navigate = useNavigate()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [secretKey, setSecretKey] = useState('')
  const [authError, setAuthError] = useState('')
  const [activeTab, setActiveTab] = useState('courseUnits') // 'courseUnits' or 'examPapers'
  
  // Course Units State
  const [courses, setCourses] = useState([])
  const [selectedCourse, setSelectedCourse] = useState('')
  const [courseUnits, setCourseUnits] = useState([])
  const [editingUnit, setEditingUnit] = useState(null)
  const [unitForm, setUnitForm] = useState({ name: '', code: '', year: 1, semester: 1 })
  
  // Exam Papers State
  const [selectedCourseUnit, setSelectedCourseUnit] = useState('')
  const [examType, setExamType] = useState('FINAL')
  const [academicYear, setAcademicYear] = useState('2024/2025')
  const [file, setFile] = useState(null)
  
  // UI State
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [showUnitForm, setShowUnitForm] = useState(false)

  // Check if already authenticated on mount
  useEffect(() => {
    const storedKey = getAdminKey()
    if (storedKey) {
      setIsAuthenticated(true)
      setSecretKey(storedKey)
    }
  }, [])

  // Handle secret key submission
  const handleAuthSubmit = (e) => {
    e.preventDefault()
    const correctKey = 'John@004'
    
    if (secretKey === correctKey) {
      setAdminKey(secretKey)
      setIsAuthenticated(true)
      setAuthError('')
    } else {
      setAuthError('Invalid secret key')
      setSecretKey('')
    }
  }

  // Handle logout
  const handleLogout = () => {
    clearAdminKey()
    setIsAuthenticated(false)
    setSecretKey('')
    navigate('/')
  }

  // Fetch courses on mount (only after authentication)
  useEffect(() => {
    if (!isAuthenticated) return
    
    const fetchCourses = async () => {
      try {
        const response = await getAllCourses()
        setCourses(response.data)
        if (response.data.length > 0) {
          setSelectedCourse(response.data[0].id)
        }
      } catch (error) {
        console.error('Error fetching courses:', error)
        // If we get a 403, the key is invalid
        if (error.response && error.response.status === 403) {
          setAuthError('Session expired. Please enter the secret key again.')
          setIsAuthenticated(false)
          clearAdminKey()
        }
      }
    }
    fetchCourses()
  }, [isAuthenticated])

  // Fetch course units when course changes
  useEffect(() => {
    if (!isAuthenticated || !selectedCourse) return
    
    const fetchCourseUnits = async () => {
      try {
        const response = await getCourseUnits(selectedCourse)
        setCourseUnits(response.data)
      } catch (error) {
        console.error('Error fetching course units:', error)
        if (error.response && error.response.status === 403) {
          setAuthError('Session expired. Please enter the secret key again.')
          setIsAuthenticated(false)
          clearAdminKey()
        }
      }
    }
    fetchCourseUnits()
  }, [selectedCourse, isAuthenticated])

  // Course Unit Handlers
  const handleAddUnit = () => {
    setEditingUnit(null)
    setUnitForm({ name: '', code: '', year: 1, semester: 1 })
    setShowUnitForm(true)
  }

  const handleEditUnit = (unit) => {
    setEditingUnit(unit)
    setUnitForm({ name: unit.name, code: unit.code, year: unit.year, semester: unit.semester })
    setShowUnitForm(true)
  }

  const handleSaveUnit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage({ type: '', text: '' })

    try {
      const data = {
        courseId: parseInt(selectedCourse),
        ...unitForm
      }

      if (editingUnit) {
        await updateCourseUnit(editingUnit.id, data)
        setMessage({ type: 'success', text: 'Course unit updated successfully!' })
      } else {
        await createCourseUnit(data)
        setMessage({ type: 'success', text: 'Course unit created successfully!' })
      }

      // Refresh course units
      const response = await getCourseUnits(selectedCourse)
      setCourseUnits(response.data)
      setShowUnitForm(false)
      setEditingUnit(null)
    } catch (error) {
      if (error.response && error.response.status === 403) {
        setMessage({ type: 'error', text: 'Access denied. Invalid or missing admin key.' })
        setIsAuthenticated(false)
        clearAdminKey()
      } else {
        setMessage({ type: 'error', text: 'Failed to save course unit' })
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUnit = async (id) => {
    if (!confirm('Are you sure you want to delete this course unit? This will also delete all associated exam papers.')) {
      return
    }

    setLoading(true)
    try {
      await deleteCourseUnit(id)
      const response = await getCourseUnits(selectedCourse)
      setCourseUnits(response.data)
      setMessage({ type: 'success', text: 'Course unit deleted successfully!' })
    } catch (error) {
      if (error.response && error.response.status === 403) {
        setMessage({ type: 'error', text: 'Access denied. Invalid or missing admin key.' })
        setIsAuthenticated(false)
        clearAdminKey()
      } else {
        setMessage({ type: 'error', text: 'Failed to delete course unit' })
      }
    } finally {
      setLoading(false)
    }
  }

  // Exam Paper Handlers
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    const isPdf = selectedFile && (
      selectedFile.type === 'application/pdf' ||
      selectedFile.name?.toLowerCase().endsWith('.pdf')
    )

    if (isPdf) {
      setFile(selectedFile)
    } else {
      setMessage({ type: 'error', text: 'Please select a PDF file' })
    }
  }

  const handleUploadExam = async (e) => {
    e.preventDefault()
    
    if (!selectedCourseUnit || !file) {
      setMessage({ type: 'error', text: 'Please fill all fields and select a file' })
      return
    }

    setLoading(true)
    setMessage({ type: '', text: '' })

    try {
      const formData = new FormData()
      formData.append('courseUnitId', selectedCourseUnit)
      formData.append('examType', examType)
      formData.append('academicYear', academicYear)
      formData.append('file', file)

      await uploadExamPaper(formData)
      
      setMessage({ type: 'success', text: 'Exam paper uploaded successfully!' })
      setFile(null)
      setSelectedCourseUnit('')
    } catch (error) {
      if (error.response && error.response.status === 403) {
        setMessage({ type: 'error', text: 'Access denied. Invalid or missing admin key.' })
        setIsAuthenticated(false)
        clearAdminKey()
      } else {
        const backendMessage = error?.response?.data?.error || error?.response?.data?.message
        const statusText = error?.response?.status ? ` (HTTP ${error.response.status})` : ''
        setMessage({ type: 'error', text: backendMessage ? `${backendMessage}${statusText}` : `Failed to upload exam paper${statusText}` })
      }
    } finally {
      setLoading(false)
    }
  }

  // Show authentication prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-cocis-dark flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-cocis-primary rounded-xl p-8 w-full max-w-md shadow-2xl"
        >
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-cocis-gold/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-cocis-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white">Admin Access</h1>
            <p className="text-white/60 mt-2">Enter the secret key to access the admin panel</p>
          </div>

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            <div>
              <input
                type="password"
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                placeholder="Enter secret key"
                className="w-full bg-cocis-dark text-white px-4 py-3 rounded-lg border border-cocis-accent focus:border-cocis-gold focus:outline-none"
                required
              />
            </div>
            
            {authError && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-3 bg-red-600/20 text-red-400 rounded-lg text-sm text-center"
              >
                {authError}
              </motion.div>
            )}

            <button
              type="submit"
              className="w-full px-4 py-3 bg-cocis-gold text-white rounded-lg hover:bg-cocis-gold/80 transition-colors font-semibold"
            >
              Access Admin Panel
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/')}
              className="text-white/60 hover:text-white text-sm"
            >
              ← Back to Home
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cocis-dark">
      {/* Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="bg-cocis-primary py-4 px-4 shadow-lg"
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="text-white text-lg hover:text-cocis-gold transition-colors"
          >
            ← Back
          </button>
          <h1 className="text-xl md:text-2xl font-bold text-white">Admin Panel</h1>
          <button
            onClick={handleLogout}
            className="text-white/70 hover:text-white text-sm flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </motion.header>

      <main className="max-w-6xl mx-auto py-8 px-4">
        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('courseUnits')}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === 'courseUnits' 
                ? 'bg-cocis-gold text-white' 
                : 'bg-cocis-primary text-white/70 hover:text-white'
            }`}
          >
            📚 Course Units
          </button>
          <button
            onClick={() => setActiveTab('examPapers')}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === 'examPapers' 
                ? 'bg-cocis-gold text-white' 
                : 'bg-cocis-primary text-white/70 hover:text-white'
            }`}
          >
            📄 Upload Exam Papers
          </button>
        </div>

        {/* Message */}
        {message.text && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-600/20 text-green-400' : 'bg-red-600/20 text-red-400'}`}
          >
            {message.text}
          </motion.div>
        )}

        {/* Course Units Tab */}
        <AnimatePresence mode="wait">
          {activeTab === 'courseUnits' && (
            <motion.div
              key="courseUnits"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Course Selection */}
              <div className="bg-cocis-primary rounded-xl p-6 mb-6 shadow-lg">
                <label className="block text-white/70 text-sm mb-2">Select Course</label>
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="w-full bg-cocis-dark text-white px-4 py-3 rounded-lg border border-cocis-accent focus:border-cocis-gold focus:outline-none"
                >
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>{course.name}</option>
                  ))}
                </select>
              </div>

              {/* Add Unit Button */}
              <div className="flex justify-end mb-4">
                <button
                  onClick={handleAddUnit}
                  className="px-6 py-2 bg-cocis-gold text-white rounded-lg hover:bg-cocis-gold/80 transition-colors"
                >
                  + Add Course Unit
                </button>
              </div>

              {/* Unit Form Modal */}
              <AnimatePresence>
                {showUnitForm && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                    onClick={() => setShowUnitForm(false)}
                  >
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.9, opacity: 0 }}
                      className="bg-cocis-primary rounded-xl p-6 w-full max-w-md"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <h2 className="text-xl font-bold text-white mb-4">
                        {editingUnit ? 'Edit Course Unit' : 'Add New Course Unit'}
                      </h2>
                      <form onSubmit={handleSaveUnit} className="space-y-4">
                        <div>
                          <label className="block text-white/70 text-sm mb-2">Course Unit Name</label>
                          <input
                            type="text"
                            value={unitForm.name}
                            onChange={(e) => setUnitForm({ ...unitForm, name: e.target.value })}
                            className="w-full bg-cocis-dark text-white px-4 py-2 rounded-lg border border-cocis-accent focus:border-cocis-gold focus:outline-none"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-white/70 text-sm mb-2">Course Unit Code</label>
                          <input
                            type="text"
                            value={unitForm.code}
                            onChange={(e) => setUnitForm({ ...unitForm, code: e.target.value })}
                            className="w-full bg-cocis-dark text-white px-4 py-2 rounded-lg border border-cocis-accent focus:border-cocis-gold focus:outline-none"
                            placeholder="e.g., CS101"
                            required
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-white/70 text-sm mb-2">Year</label>
                            <select
                              value={unitForm.year}
                              onChange={(e) => setUnitForm({ ...unitForm, year: parseInt(e.target.value) })}
                              className="w-full bg-cocis-dark text-white px-4 py-2 rounded-lg border border-cocis-accent focus:border-cocis-gold focus:outline-none"
                            >
                              {[1, 2, 3, 4].map((y) => (
                                <option key={y} value={y}>Year {y}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-white/70 text-sm mb-2">Semester</label>
                            <select
                              value={unitForm.semester}
                              onChange={(e) => setUnitForm({ ...unitForm, semester: parseInt(e.target.value) })}
                              className="w-full bg-cocis-dark text-white px-4 py-2 rounded-lg border border-cocis-accent focus:border-cocis-gold focus:outline-none"
                            >
                              <option value={1}>Semester 1</option>
                              <option value={2}>Semester 2</option>
                            </select>
                          </div>
                        </div>
                        <div className="flex gap-4 pt-4">
                          <button
                            type="button"
                            onClick={() => setShowUnitForm(false)}
                            className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-2 bg-cocis-gold text-white rounded-lg hover:bg-cocis-gold/80 disabled:opacity-50 transition-colors"
                          >
                            {loading ? 'Saving...' : 'Save'}
                          </button>
                        </div>
                      </form>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Course Units List */}
              <div className="bg-cocis-primary rounded-xl shadow-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-cocis-dark">
                    <tr>
                      <th className="px-6 py-3 text-left text-white/70 font-semibold">Code</th>
                      <th className="px-6 py-3 text-left text-white/70 font-semibold">Name</th>
                      <th className="px-6 py-3 text-left text-white/70 font-semibold">Year</th>
                      <th className="px-6 py-3 text-left text-white/70 font-semibold">Semester</th>
                      <th className="px-6 py-3 text-right text-white/70 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courseUnits.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-8 text-center text-white/50">
                          No course units found. Click "Add Course Unit" to create one.
                        </td>
                      </tr>
                    ) : (
                      courseUnits.map((unit, index) => (
                        <motion.tr
                          key={unit.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.05 }}
                          className="border-t border-cocis-accent"
                        >
                          <td className="px-6 py-4 text-white font-medium">{unit.code}</td>
                          <td className="px-6 py-4 text-white">{unit.name}</td>
                          <td className="px-6 py-4 text-white/70">Year {unit.year}</td>
                          <td className="px-6 py-4 text-white/70">Semester {unit.semester}</td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => handleEditUnit(unit)}
                              className="text-blue-400 hover:text-blue-300 mr-4"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteUnit(unit.id)}
                              className="text-red-400 hover:text-red-300"
                            >
                              Delete
                            </button>
                          </td>
                        </motion.tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Exam Papers Tab */}
        <AnimatePresence mode="wait">
          {activeTab === 'examPapers' && (
            <motion.div
              key="examPapers"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-cocis-primary rounded-xl p-8 shadow-lg"
            >
              <form onSubmit={handleUploadExam} className="space-y-6">
                {/* Course Selection */}
                <div>
                  <label className="block text-white/70 text-sm mb-2">Course</label>
                  <select
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                    className="w-full bg-cocis-dark text-white px-4 py-3 rounded-lg border border-cocis-accent focus:border-cocis-gold focus:outline-none"
                  >
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>{course.name}</option>
                    ))}
                  </select>
                </div>

                {/* Course Unit Selection */}
                <div>
                  <label className="block text-white/70 text-sm mb-2">Course Unit</label>
                  <select
                    value={selectedCourseUnit}
                    onChange={(e) => setSelectedCourseUnit(e.target.value)}
                    disabled={!selectedCourse}
                    className="w-full bg-cocis-dark text-white px-4 py-3 rounded-lg border border-cocis-accent focus:border-cocis-gold focus:outline-none disabled:opacity-50"
                    required
                  >
                    <option value="">Select a Course Unit</option>
                    {courseUnits.map((unit) => (
                      <option key={unit.id} value={unit.id}>
                        {unit.code} - {unit.name} (Year {unit.year}, Sem {unit.semester})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Exam Type */}
                <div>
                  <label className="block text-white/70 text-sm mb-2">Exam Type</label>
                  <select
                    value={examType}
                    onChange={(e) => setExamType(e.target.value)}
                    className="w-full bg-cocis-dark text-white px-4 py-3 rounded-lg border border-cocis-accent focus:border-cocis-gold focus:outline-none"
                    required
                  >
                    <option value="MIDTERM">Midterm</option>
                    <option value="FINAL">Final</option>
                  </select>
                </div>

                {/* Academic Year */}
                <div>
                  <label className="block text-white/70 text-sm mb-2">Academic Year</label>
                  <select
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                    className="w-full bg-cocis-dark text-white px-4 py-3 rounded-lg border border-cocis-accent focus:border-cocis-gold focus:outline-none"
                    required
                  >
                    <option value="2024/2025">2024/2025</option>
                    <option value="2023/2024">2023/2024</option>
                    <option value="2022/2023">2022/2023</option>
                    <option value="2021/2022">2021/2022</option>
                  </select>
                </div>

                {/* File Upload */}
                <div>
                  <label className="block text-white/70 text-sm mb-2">PDF File</label>
                  <div className="border-2 border-dashed border-cocis-accent rounded-lg p-6 text-center hover:border-cocis-gold transition-colors">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleFileChange}
                      className="hidden"
                      id="exam-file-upload"
                    />
                    <label htmlFor="exam-file-upload" className="cursor-pointer">
                      {file ? (
                        <div className="text-green-400">
                          <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p className="font-medium">{file.name}</p>
                          <p className="text-sm text-white/60">Click to change</p>
                        </div>
                      ) : (
                        <div className="text-white/60">
                          <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          <p className="font-medium">Click to upload PDF</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || !selectedCourseUnit || !file}
                  className="w-full px-6 py-3 bg-cocis-gold text-white rounded-lg hover:bg-cocis-gold/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
                >
                  {loading ? 'Uploading...' : 'Upload Exam Paper'}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}

export default AdminPage
