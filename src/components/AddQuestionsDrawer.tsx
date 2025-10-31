'use client'

import { Drawer, message } from 'antd'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface AddQuestionsDrawerProps {
  open: boolean
  onClose: () => void
  examId: bigint | null
  courses: readonly any[] // Add courses prop to get course name
}

export function AddQuestionsDrawer({ open, onClose, examId, courses }: AddQuestionsDrawerProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0
  })

  // Reset form when drawer opens/closes
  useEffect(() => {
    if (!open) {
      setFormData({
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0
      })
    }
  }, [open])

  // Function to get course name
  const getCourseName = (examId: bigint | null) => {
    if (!examId) return ""
    // Since examId is actually courseId in your current implementation
    const course = courses.find(c => c.courseId === examId)
    return course ? course.title : "Course"
  }

  const handleSubmit = async () => {
    if (!examId) {
      message.error('No course selected')
      return
    }

    if (!formData.question || formData.options.some(opt => !opt)) {
      message.error('Please fill all required fields correctly')
      return
    }

    try {
      setLoading(true)
      // Your add questions logic here
      console.log('Adding questions for exam:', {
        examId,
        question: formData.question,
        options: formData.options,
        correctAnswer: formData.correctAnswer
      })

      message.loading('Adding questions...', 3)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      message.success('Questions added successfully!')
      onClose()
      
    } catch (err) {
      console.error('Error adding questions:', err)
      message.error('Error adding questions')
    } finally {
      setLoading(false)
    }
  }

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...formData.options]
    newOptions[index] = value
    setFormData({ ...formData, options: newOptions })
  }

  return (
    <Drawer
      title={
        <div>
          <h2 className="text-xl font-semibold text-[#3D441A]">
            Add Questions {examId && `for ${getCourseName(examId)}`}
          </h2>
          {examId && (
            <p className="text-sm text-[#3D441A]/60 mt-1">
              Course ID: {examId.toString()}
            </p>
          )}
        </div>
      }
      placement="right"
      width={600}
      onClose={onClose}
      open={open}
      styles={{
        body: { 
          paddingBottom: 80,
          backgroundColor: '#FFFDD0'
        },
        header: {
          backgroundColor: '#FFFDD0',
          borderBottom: '1px solid rgba(61, 68, 26, 0.2)'
        },
        content: {
          backgroundColor: '#FFFDD0'
        }
      }}
      destroyOnClose
    >
      <div className="space-y-6">
        {/* Question */}
        <div>
          <label className="block text-sm font-medium text-[#3D441A] mb-2">
            Question *
          </label>
          <textarea
            placeholder="Enter your question here..."
            value={formData.question}
            onChange={(e) => setFormData({ ...formData, question: e.target.value })}
            rows={3}
            className="w-full bg-white border border-[#3D441A]/20 rounded-lg px-4 py-3 text-[#3D441A] placeholder-[#3D441A]/40 focus:outline-none focus:ring-2 focus:ring-[#3D441A] focus:border-transparent transition-all resize-none"
          />
          {!formData.question && (
            <p className="text-red-500 text-sm mt-1">Please input the question!</p>
          )}
        </div>

        {/* Options */}
        <div>
          <label className="block text-sm font-medium text-[#3D441A] mb-3">
            Options *
          </label>
          <div className="space-y-3">
            {formData.options.map((option, index) => (
              <div key={index} className="flex items-center gap-3">
                <input
                  type="radio"
                  name="correctAnswer"
                  checked={formData.correctAnswer === index}
                  onChange={() => setFormData({ ...formData, correctAnswer: index })}
                  className="w-4 h-4 text-[#3D441A] focus:ring-[#3D441A] border-[#3D441A]/20"
                />
                <input
                  type="text"
                  placeholder={`Option ${index + 1}`}
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  className="flex-1 bg-white border border-[#3D441A]/20 rounded-lg px-4 py-2 text-[#3D441A] placeholder-[#3D441A]/40 focus:outline-none focus:ring-2 focus:ring-[#3D441A] focus:border-transparent transition-all"
                />
              </div>
            ))}
          </div>
          {formData.options.some(opt => !opt) && (
            <p className="text-red-500 text-sm mt-2">Please fill all options!</p>
          )}
        </div>

        {/* Selected Correct Answer */}
        <div className="bg-white border border-[#3D441A]/20 rounded-lg p-4">
          <label className="block text-sm font-medium text-[#3D441A] mb-2">
            Correct Answer Selected
          </label>
          <p className="text-[#3D441A] font-medium">
            {formData.options[formData.correctAnswer] || 'No option selected'}
          </p>
        </div>

        {/* Add Question Button */}
        <motion.button
          onClick={handleSubmit}
          disabled={!examId || loading || !formData.question || formData.options.some(opt => !opt)}
          whileHover={{ scale: !examId || loading ? 1 : 1.02 }}
          whileTap={{ scale: !examId || loading ? 1 : 0.98 }}
          className="w-full bg-[#3D441A] text-[#FFFDD0] py-3 px-6 rounded-lg hover:bg-[#3D441A]/90 focus:outline-none focus:ring-2 focus:ring-[#3D441A] focus:ring-offset-2 focus:ring-offset-[#FFFDD0] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="rounded-full h-5 w-5 border-b-2 border-[#FFFDD0] mr-2"
              />
              Adding Questions...
            </span>
          ) : (
            'Add Questions'
          )}
        </motion.button>
      </div>
    </Drawer>
  )
}