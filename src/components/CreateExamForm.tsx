'use client'

import { Drawer, message, Input, Button, Space, Form, Card } from 'antd'
import { useCreateExam } from '@/hooks/useContract'
import { useState, useEffect } from 'react'
import dayjs from 'dayjs'
import { motion } from 'framer-motion'
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons'

interface CreateExamDrawerProps {
  open: boolean
  onClose: () => void
  courseId: bigint | null
  courses: readonly any[]
}

interface QuestionForm {
  text: string
  options: string[]
  correctAnswer: number
}

export function CreateExamDrawer({ open, onClose, courseId, courses }: CreateExamDrawerProps) {
  const { createExam, isPending, isConfirming, isConfirmed, error } = useCreateExam()
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()
  const [questions, setQuestions] = useState<QuestionForm[]>([
    { text: '', options: ['', ''], correctAnswer: 0 }
  ])
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
      form.resetFields()
      setQuestions([{ text: '', options: ['', ''], correctAnswer: 0 }])
    }
  }, [open, form])

  const handleSubmit = async () => {
    try {
      setLoading(true)

      const values = await form.validateFields()
      console.log('🎯 Submitting exam form:', {
        courseId: courseId?.toString(),
        values,
        questionsCount: questions.length
      })

      if (!courseId) {
        message.error('No course selected')
        return
      }

      // Validate questions
      const validationErrors: string[] = []

      questions.forEach((question, index) => {
        if (!question.text.trim()) {
          validationErrors.push(`Question ${index + 1} text is required`)
        }

        question.options.forEach((option, optIndex) => {
          if (!option.trim()) {
            validationErrors.push(`Question ${index + 1}, Option ${optIndex + 1} is required`)
          }
        })

        if (question.options.length < 2) {
          validationErrors.push(`Question ${index + 1} must have at least 2 options`)
        }

        const filledOptions = question.options.filter(opt => opt.trim())
        if (filledOptions.length < 2) {
          validationErrors.push(`Question ${index + 1} must have at least 2 filled options`)
        }

        if (question.correctAnswer >= filledOptions.length) {
          validationErrors.push(`Question ${index + 1} correct answer is out of bounds`)
        }
      })

      if (validationErrors.length > 0) {
        message.error(`Please fix the following errors: ${validationErrors.join(', ')}`)
        setLoading(false)
        return
      }

      // Prepare data for smart contract
      const scheduledDateTime = BigInt(dayjs(values.date).unix())
      const durationMinutes = BigInt(parseInt(values.duration))

      // Transform questions data for smart contract
      const questionTexts = questions.map(q => q.text.trim())
      const optionsArray = questions.map(q =>
        q.options.filter(opt => opt.trim()) // Remove empty options
      )

      // FIX: Convert correctAnswerIndices to bigint[]
      const correctAnswerIndices = questions.map(q => BigInt(q.correctAnswer))

      console.log('📤 Creating exam with data:', {
        courseId: courseId.toString(),
        title: values.title,
        scheduledDateTime: scheduledDateTime.toString(),
        durationMinutes: durationMinutes.toString(),
        questionCount: questionTexts.length,
        optionsArray,
        correctAnswerIndices: correctAnswerIndices.map(bi => bi.toString())
      })

      // Call smart contract
      createExam(
        courseId,
        values.title,
        scheduledDateTime,
        durationMinutes,
        questionTexts,
        optionsArray,
        correctAnswerIndices
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
      form.resetFields()
      setQuestions([{ text: '', options: ['', ''], correctAnswer: 0 }])
      setLoading(false)
      onClose()
    }
  }, [isConfirmed, onClose, form])

  useEffect(() => {
    if (error) {
      console.error('❌ Error creating exam:', error)
      message.error(`Error creating exam: ${error.message}`)
      setLoading(false)
    }
  }, [error])

  // Question management functions
  const addQuestion = () => {
    setQuestions([...questions, { text: '', options: ['', ''], correctAnswer: 0 }])
  }

  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      const newQuestions = questions.filter((_, i) => i !== index)
      setQuestions(newQuestions)
    }
  }

  const updateQuestion = (index: number, field: keyof QuestionForm, value: any) => {
    const newQuestions = [...questions]
    newQuestions[index] = { ...newQuestions[index], [field]: value }
    setQuestions(newQuestions)
  }

  const addOption = (questionIndex: number) => {
    const newQuestions = [...questions]
    newQuestions[questionIndex].options.push('')
    setQuestions(newQuestions)
  }

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const newQuestions = [...questions]
    const question = newQuestions[questionIndex]

    if (question.options.length > 2) {
      question.options = question.options.filter((_, i) => i !== optionIndex)

      // Adjust correct answer if needed
      if (question.correctAnswer >= question.options.length) {
        question.correctAnswer = question.options.length - 1
      }

      setQuestions(newQuestions)
    }
  }

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    const newQuestions = [...questions]
    newQuestions[questionIndex].options[optionIndex] = value
    setQuestions(newQuestions)
  }

  const isCreating = loading || isPending || isConfirming

  console.log('🔧 Form State:', {
    questions,
    courseId: courseId?.toString(),
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
      width={800}
      onClose={onClose}
      open={open}
      styles={{
        body: { paddingBottom: 80, backgroundColor: '#FFFDD0' },
        header: { backgroundColor: '#FFFDD0', borderBottom: '1px solid rgba(61, 68, 26, 0.2)' },
        content: { backgroundColor: '#FFFDD0' },
      }}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        className="space-y-6"
        initialValues={{
          title: '',
          date: '',
          duration: '60'
        }}
      >
        {/* Debug info */}
        <div className="p-3 bg-yellow-100 rounded-lg text-sm">
          <strong>Debug Info:</strong>
          <div>Course ID: {courseId?.toString() || 'null'}</div>
          <div>Questions: {questions.length}</div>
          <div>Creating: {isCreating ? 'Yes' : 'No'}</div>
        </div>

        <Form.Item
          name="title"
          label="Exam Title"
          rules={[{ required: true, message: 'Please enter exam title' }]}
        >
          <Input
            placeholder="e.g. Midterm Assessment"
            className="w-full bg-white border border-[#3D441A]/20 rounded-lg px-4 py-3 text-[#3D441A] placeholder-[#3D441A]/40 focus:outline-none focus:ring-2 focus:ring-[#3D441A] focus:border-transparent transition-all text-lg"
          />
        </Form.Item>

        <Form.Item
          name="date"
          label="Scheduled Date & Time"
          rules={[{ required: true, message: 'Please select date and time' }]}
        >
          <Input
            type="datetime-local"
            min={new Date().toISOString().slice(0, 16)}
            className="w-full bg-white border border-[#3D441A]/20 rounded-lg px-4 py-3 text-[#3D441A] focus:outline-none focus:ring-2 focus:ring-[#3D441A] focus:border-transparent transition-all text-lg"
          />
        </Form.Item>

        <Form.Item
          name="duration"
          label="Duration (minutes)"
          rules={[
            { required: true, message: 'Please enter duration' },
            { pattern: /^[1-9]\d*$/, message: 'Duration must be a positive number' }
          ]}
        >
          <Input
            type="number"
            min="10"
            max="180"
            placeholder="e.g. 60"
            className="w-full bg-white border border-[#3D441A]/20 rounded-lg px-4 py-3 text-[#3D441A] placeholder-[#3D441A]/40 focus:outline-none focus:ring-2 focus:ring-[#3D441A] focus:border-transparent transition-all text-lg"
          />
        </Form.Item>

        {/* Questions Section */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-[#3D441A]">Exam Questions</h3>
            <Button
              type="dashed"
              onClick={addQuestion}
              icon={<PlusOutlined />}
              className="border-[#3D441A] text-[#3D441A]"
            >
              Add Question
            </Button>
          </div>

          <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
            {questions.map((question, questionIndex) => (
              <Card
                key={questionIndex}
                title={`Question ${questionIndex + 1}`}
                size="small"
                extra={
                  questions.length > 1 && (
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => removeQuestion(questionIndex)}
                    />
                  )
                }
                className="border-[#3D441A]/20"
              >
                <div className="space-y-3">
                  {/* Question Text */}
                  <Input.TextArea
                    placeholder="Enter question text"
                    value={question.text}
                    onChange={(e) => updateQuestion(questionIndex, 'text', e.target.value)}
                    rows={2}
                    className="w-full bg-white border border-[#3D441A]/20 rounded-lg px-4 py-2 text-[#3D441A] placeholder-[#3D441A]/40"
                  />

                  {/* Options */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-[#3D441A]">
                      Options (Select correct answer):
                    </label>
                    {question.options.map((option, optionIndex) => (
                      <div key={optionIndex} className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name={`correct-${questionIndex}`}
                          checked={question.correctAnswer === optionIndex}
                          onChange={() => updateQuestion(questionIndex, 'correctAnswer', optionIndex)}
                          className="text-[#3D441A] focus:ring-[#3D441A]"
                        />
                        <Input
                          placeholder={`Option ${optionIndex + 1}`}
                          value={option}
                          onChange={(e) => updateOption(questionIndex, optionIndex, e.target.value)}
                          className="flex-1 bg-white border border-[#3D441A]/20 rounded-lg px-4 py-2 text-[#3D441A] placeholder-[#3D441A]/40"
                        />
                        {question.options.length > 2 && (
                          <Button
                            type="text"
                            danger
                            size="small"
                            icon={<DeleteOutlined />}
                            onClick={() => removeOption(questionIndex, optionIndex)}
                          />
                        )}
                      </div>
                    ))}
                    <Button
                      type="dashed"
                      size="small"
                      onClick={() => addOption(questionIndex)}
                      icon={<PlusOutlined />}
                      className="border-[#3D441A] text-[#3D441A] text-xs"
                    >
                      Add Option
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <motion.button
          type="button"
          onClick={handleSubmit}
          disabled={!courseId || isCreating || questions.length === 0}
          className={`w-full py-4 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D441A] focus:ring-offset-2 focus:ring-offset-[#FFFDD0] transition-all duration-200 font-semibold text-lg ${!courseId || isCreating || questions.length === 0
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
            `Create Exam with ${questions.length} Question${questions.length !== 1 ? 's' : ''}`
          )}
        </motion.button>

        {!courseId && (
          <div className="text-red-600 text-center font-semibold">
            Error: No course selected. Please close and reopen the drawer.
          </div>
        )}
      </Form>
    </Drawer>
  )
}