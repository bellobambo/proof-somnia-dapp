'use client'

import { Drawer, message } from 'antd'
import { useCreateExam } from '@/hooks/useContract'
import { useState, useEffect } from 'react'
import dayjs from 'dayjs'
import { motion } from 'framer-motion'

interface CreateExamDrawerProps {
  open: boolean
  onClose: () => void
  courseId: bigint | null
  courses: readonly any[]
}

export function CreateExamDrawer({ open, onClose, courseId, courses }: CreateExamDrawerProps) {
  const { createExam, isPending, isConfirming, isConfirmed, error } = useCreateExam()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    duration: ''
  })
  const [storedTitle, setStoredTitle] = useState('')

  useEffect(() => {
    console.log('🔍 CreateExamDrawer Debug:', {
      open,
      courseId: courseId?.toString(),
      coursesCount: courses?.length,
      currentCourse: courses?.find(c => c.courseId?.toString() === courseId?.toString())
    })
    
    const currentCourse = courses?.find(c => c.courseId?.toString() === courseId?.toString())
    setStoredTitle(currentCourse?.title || '')
  }, [open, courseId, courses])

  useEffect(() => {
    if (!open) {
      setFormData({ title: '', date: '', duration: '' })
    }
  }, [open])

  const handleSubmit = async () => {
    console.log('🎯 Submitting exam form:', {
      courseId: courseId?.toString(),
      formData,
      isFormValid: isFormValid
    })

    if (!courseId) {
      message.error('No course selected')
      return
    }

    try {
      setLoading(true)
      
      // Validate form data
      if (!formData.title.trim()) {
        message.error('Please enter exam title')
        return
      }
      
      if (!formData.date) {
        message.error('Please select date and time')
        return
      }
      
      if (!formData.duration || parseInt(formData.duration) <= 0) {
        message.error('Please enter valid duration')
        return
      }

      const scheduledDateTime = BigInt(dayjs(formData.date).unix())
      const durationMinutes = BigInt(parseInt(formData.duration))

      console.log('📤 Creating exam with data:', {
        courseId: courseId.toString(),
        title: formData.title,
        scheduledDateTime: scheduledDateTime.toString(),
        durationMinutes: durationMinutes.toString(),
        timestamp: dayjs(formData.date).unix()
      })

      createExam(
        courseId,
        formData.title,
        scheduledDateTime,
        durationMinutes,
        [], // empty questions array for now
        [], // empty options array
        []  // empty correct answers array
      )
      
      message.loading('Creating exam on blockchain...', 3)
    } catch (err) {
      console.error('Form validation error:', err)
      message.error('Please fill all required fields correctly')
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isConfirmed) {
      message.success('Exam created successfully!')
      setFormData({ title: '', date: '', duration: '' })
      setLoading(false)
      onClose()
    }
  }, [isConfirmed, onClose])

  useEffect(() => {
    if (error) {
      console.error('❌ Error creating exam:', error)
      message.error(`Error creating exam: ${error.message}`)
      setLoading(false)
    }
  }, [error])

  // Enhanced form validation
  const isFormValid = 
    formData.title.trim() && 
    formData.date && 
    formData.duration && 
    parseInt(formData.duration) > 0 &&
    courseId !== null

  const isCreating = loading || isPending || isConfirming

  console.log('🔧 Form State:', {
    formData,
    courseId: courseId?.toString(),
    isFormValid,
    isCreating,
    isPending,
    isConfirming
  })

  return (
    <Drawer
      title={
        <div>
          <h2 className="text-2xl font-bold text-[#3D441A]">
            Create Exam for {storedTitle || 'Selected Course'}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Course ID: {courseId?.toString() || 'Not selected'}
          </p>
        </div>
      }
      placement="right"
      width={600}
      onClose={onClose}
      open={open}
      styles={{
        body: { paddingBottom: 80, backgroundColor: '#FFFDD0' },
        header: { backgroundColor: '#FFFDD0', borderBottom: '1px solid rgba(61, 68, 26, 0.2)' },
        content: { backgroundColor: '#FFFDD0' },
      }}
      destroyOnClose
    >
      <div className="space-y-6">
        {/* Debug info */}
        <div className="p-3 bg-yellow-100 rounded-lg text-sm">
          <strong>Debug Info:</strong>
          <div>Course ID: {courseId?.toString() || 'null'}</div>
          <div>Form Valid: {isFormValid ? 'Yes' : 'No'}</div>
          <div>Creating: {isCreating ? 'Yes' : 'No'}</div>
        </div>

        <div>
          <label className="block text-lg font-semibold text-[#3D441A] mb-3">
            Exam Title *
          </label>
          <input
            type="text"
            placeholder="e.g. Midterm Assessment"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full bg-white border border-[#3D441A]/20 rounded-lg px-4 py-3 text-[#3D441A] placeholder-[#3D441A]/40 focus:outline-none focus:ring-2 focus:ring-[#3D441A] focus:border-transparent transition-all text-lg"
          />
        </div>

        <div>
          <label className="block text-lg font-semibold text-[#3D441A] mb-3">
            Scheduled Date & Time *
          </label>
          <input
            type="datetime-local"
            min={new Date().toISOString().slice(0, 16)}
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="w-full bg-white border border-[#3D441A]/20 rounded-lg px-4 py-3 text-[#3D441A] focus:outline-none focus:ring-2 focus:ring-[#3D441A] focus:border-transparent transition-all text-lg"
          />
        </div>

        <div>
          <label className="block text-lg font-semibold text-[#3D441A] mb-3">
            Duration (minutes) *
          </label>
          <input
            type="number"
            min="10"
            max="180"
            placeholder="e.g. 60"
            value={formData.duration}
            onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
            className="w-full bg-white border border-[#3D441A]/20 rounded-lg px-4 py-3 text-[#3D441A] placeholder-[#3D441A]/40 focus:outline-none focus:ring-2 focus:ring-[#3D441A] focus:border-transparent transition-all text-lg"
          />
        </div>

        <motion.button
          onClick={handleSubmit}
          disabled={!isFormValid || isCreating}
          className={`w-full py-4 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D441A] focus:ring-offset-2 focus:ring-offset-[#FFFDD0] transition-all duration-200 font-semibold text-lg ${
            !isFormValid || isCreating
              ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
              : 'bg-[#3D441A] text-[#FFFDD0] hover:bg-[#3D441A]/90 cursor-pointer'
          }`}
        >
          {isCreating ? (
            <span className="flex items-center justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="rounded-full h-5 w-5 border-b-2 border-[#FFFDD0] mr-2"
              />
              Creating Exam...
            </span>
          ) : (
            `Create Exam ${!courseId ? '(No Course Selected)' : ''}`
          )}
        </motion.button>

        {!courseId && (
          <div className="text-red-600 text-center font-semibold">
            Error: No course selected. Please close and reopen the drawer.
          </div>
        )}
      </div>
    </Drawer>
  )
}