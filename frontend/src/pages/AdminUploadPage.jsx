import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getAllCourses, getCourseUnits } from '../services/api'
import { uploadExamPaper } from '../services/api'

function AdminUploadPage() {
  const navigate = useNavigate()
  const [courses, setCourses] = useState([])
  const [selectedCourse, setSelectedCourse] = useState('')
  const [courseUnits, setCourseUnits] = useState([])
  const [selectedCourseUnit, setSelectedCourseUnit] = useState('')
  const [examType, setExamType] = useState('FINAL')
  const [academicYear, setAcademicYear] = useState('2024/2025')
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await getAllCourses()
        setCourses(response.data)
      } catch (error) {
        console.error('Error fetching courses:', error)
      }
    }
    fetchCourses()
  }, [])

  useEffect(() => {
    const fetchCourseUnits = async () => {
      if (selectedCourse) {
        try {
          const response = await getCourseUnits(selectedCourse)
          setCourseUnits(response.data)
        } catch (error) {
          console.error('Error fetching course units:', error)
        }
      } else {
        setCourseUnits([])
      }
    }
    fetchCourseUnits()
  }, [selectedCourse])

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

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!selectedCourseUnit || !file) {
      setMessage({ type: 'error', text: 'Please fill all fields and select a file' })
      return
    }

    setUploading(true)
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
      const backendMessage = error?.response?.data?.error || error?.response?.data?.message
      const statusText = error?.response?.status ? ` (HTTP ${error.response.status})` : ''
      setMessage({ type: 'error', text: backendMessage ? `${backendMessage}${statusText}` : `Failed to upload exam paper${statusText}` })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-cocis-dark">
      {/* Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="bg-cocis-primary py-6 px-4 shadow-lg"
      >
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="text-white text-lg hover:text-cocis-gold transition-colors"
          >
            ← Back
          </button>
          <h1 className="text-xl md:text-2xl font-bold text-white">Upload Exam Paper</h1>
          <div className="w-24" />
        </div>
      </motion.header>

      <main className="max-w-2xl mx-auto py-8 px-4">
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="bg-cocis-primary rounded-xl p-8 shadow-lg space-y-6"
        >
          {/* Course Selection */}
          <div>
            <label className="block text-white/70 text-sm mb-2">Course</label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full bg-cocis-dark text-white px-4 py-3 rounded-lg border border-cocis-accent focus:border-cocis-gold focus:outline-none"
              required
            >
              <option value="">Select a Course</option>
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
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
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

          {/* Message */}
          {message.text && (
            <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-600/20 text-green-400' : 'bg-red-600/20 text-red-400'}`}>
              {message.text}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={uploading}
            className="w-full bg-cocis-gold hover:bg-cocis-gold/80 disabled:opacity-50 text-white py-3 rounded-lg font-semibold transition-colors"
          >
            {uploading ? 'Uploading...' : 'Upload Exam Paper'}
          </button>
        </motion.form>
      </main>
    </div>
  )
}

export default AdminUploadPage
