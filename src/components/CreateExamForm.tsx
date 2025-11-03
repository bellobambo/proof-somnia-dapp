'use client'

import { Drawer, message, Input, Button, Space, Form, Card } from 'antd'
import { useCreateExam } from '@/hooks/useContract'
import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons'
import toast from 'react-hot-toast'

interface CreateExamDrawerProps {
  open: boolean
  onClose: () => void
  courseId: bigint | null
  courses: readonly any[]
}

interface QuestionForm {
  text: string
  correctAnswer: boolean
}

export function CreateExamDrawer({ open, onClose, courseId, courses }: CreateExamDrawerProps) {
  const { createExam, isPending, isConfirming, isConfirmed, error } = useCreateExam()
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()
  const [questions, setQuestions] = useState<QuestionForm[]>([{ text: '', correctAnswer: true }])
  const [storedTitle, setStoredTitle] = useState('')

  // ✅ Use explicit null check for courseId (handles 0n properly)
  const currentCourse = useCallback(() => {
    return courseId !== null
      ? courses?.find(c => c.courseId?.toString() === courseId.toString())
      : null
  }, [courseId, courses])

  useEffect(() => {
    if (courseId !== null && open) {
      const course = currentCourse()
      setStoredTitle(course?.title || '')
    }
  }, [open, courseId, currentCourse])

  useEffect(() => {
    if (!open) {
      form.resetFields()
      setQuestions([{ text: '', correctAnswer: true }])
    }
  }, [open, form])

  useEffect(() => {
    if (isConfirmed) {
      toast.success('Exam created successfully!')
      form.resetFields()
      setQuestions([{ text: '', correctAnswer: true }])
      setLoading(false)
      onClose()
    }
  }, [isConfirmed, onClose, form])

  useEffect(() => {
    if (error) {
      console.error('❌ Contract error details:', error)
      message.error(`Error creating exam: ${error.message}`)
      setLoading(false)
    }
  }, [error])

  const handleSubmit = async () => {
    try {
      setLoading(true)
      const values = await form.validateFields()

      console.log('🎯 Submitting exam form:', {
        courseId: courseId?.toString(),
        values,
        questionsCount: questions.length
      })

      // ✅ Handle 0n correctly (explicit null/undefined check)
      if (courseId === null || courseId === undefined) {
        message.error('No course selected')
        setLoading(false)
        return
      }

      // Validate questions
      const validQuestions = questions.filter(q => q.text.trim())
      if (validQuestions.length === 0) {
        message.error('Please add at least one valid question')
        setLoading(false)
        return
      }

      // Check for empty questions
      const emptyQuestions = questions.filter(q => !q.text.trim())
      if (emptyQuestions.length > 0) {
        message.error('Please fill all question texts')
        setLoading(false)
        return
      }

      // Prepare data for smart contract
      const questionTexts = questions.map(q => q.text.trim())
      const correctAnswers = questions.map(q => q.correctAnswer)

      console.log('📤 Creating exam with data:', {
        courseId: courseId.toString(),
        title: values.title,
        questionTexts,
        correctAnswers,
        questionCount: questionTexts.length
      })

      createExam(courseId, values.title, questionTexts, correctAnswers)
    } catch (err) {
      console.error('Form validation error:', err)
      message.error('Please fill all required fields correctly')
      setLoading(false)
    }
  }

  const addQuestion = () => {
    setQuestions([...questions, { text: '', correctAnswer: true }])
  }

  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index))
    }
  }

  const updateQuestion = (index: number, field: 'text' | 'correctAnswer', value: any) => {
    const newQuestions = [...questions]
    newQuestions[index] = { ...newQuestions[index], [field]: value }
    setQuestions(newQuestions)
  }

  const isCreating = loading || isPending || isConfirming

  return (
    <Drawer
      title={
        <div>
          <h2 className="text-2xl font-bold text-[#3D441A]">
            Create Exam for {storedTitle || 'Selected Course'}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Course ID:{' '}
            {courseId !== null && courseId !== undefined
              ? courseId.toString()
              : 'Not selected'}
          </p>
        </div>
      }
      placement="right"
      width={600}
      onClose={onClose}
      open={open}
      styles={{
        body: { paddingBottom: 80, backgroundColor: '#FFFDD0' },
        header: {
          backgroundColor: '#FFFDD0',
          borderBottom: '1px solid rgba(61, 68, 26, 0.2)'
        },
        content: { backgroundColor: '#FFFDD0' }
      }}
      destroyOnClose
    >
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-[#3D441A] mb-2">
            Exam Title
          </label>
          <Form
            form={form}
            layout="vertical"
            className="space-y-6"
            initialValues={{ title: '' }}
          >
            <Form.Item
              name="title"
              rules={[{ required: true, message: 'Please enter exam title' }]}
            >
              <input
                placeholder="e.g. Midterm Assessment"
                className="w-full bg-white border border-[#3D441A]/20 rounded-lg px-4 py-3 text-[#3D441A] placeholder-[#3D441A]/40 focus:outline-none focus:ring-2 focus:ring-[#3D441A] focus:border-transparent transition-all text-lg"
              />
            </Form.Item>
          </Form>
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-[#3D441A]">Exam Questions</h3>
            <button
              onClick={addQuestion}
              className="border-[#3D441A] cursor-pointer items-center border-2 rounded-lg p-2 text-[#3D441A] hover:border-[#3D441A]/80 hover:text-[#3D441A]/80"
            >
              <PlusOutlined />

              <span className='ml-2'>

                Add Question
              </span>
            </button>
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
                      className="hover:bg-red-50"
                    />
                  )
                }
                className="border-[#3D441A]/20 hover:shadow-md transition-shadow"
              >
                <div className="space-y-3">
                  {/* Question Text */}
                  <div>
                    <label className="block text-sm font-medium text-[#3D441A] mb-2">
                      Question Text
                    </label>
                    <Input.TextArea
                      placeholder="Enter question text (e.g., 'Blockchain is decentralized?')"
                      value={question.text}
                      onChange={e =>
                        updateQuestion(questionIndex, 'text', e.target.value)
                      }
                      rows={3}
                      className="w-full bg-white border border-[#3D441A]/20 rounded-lg px-4 py-2 text-[#3D441A] placeholder-[#3D441A]/40 focus:border-[#3D441A] focus:ring-1 focus:ring-[#3D441A]"
                    />
                    {!question.text.trim() && (
                      <p className="text-red-500 text-xs mt-1">
                        Question text is required
                      </p>
                    )}
                  </div>

                  {/* Correct Answer Toggle */}
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-[#3D441A]">
                      Correct Answer:
                    </label>
                    <div className="flex gap-2">
                      <Button
                        type={question.correctAnswer ? 'primary' : 'default'}
                        onClick={() =>
                          updateQuestion(questionIndex, 'correctAnswer', true)
                        }
                        className={
                          question.correctAnswer
                            ? 'bg-green-600 border-green-600 hover:bg-green-700'
                            : 'hover:border-green-600 hover:text-green-600'
                        }
                      >
                        True
                      </Button>
                      <Button
                        type={!question.correctAnswer ? 'primary' : 'default'}
                        onClick={() =>
                          updateQuestion(questionIndex, 'correctAnswer', false)
                        }
                        className={
                          !question.correctAnswer
                            ? 'bg-red-600 border-red-600 hover:bg-red-700'
                            : 'hover:border-red-600 hover:text-red-600'
                        }
                      >
                        False
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <motion.button
          type="button"
          onClick={handleSubmit}
          disabled={
            courseId === null ||
            courseId === undefined ||
            isCreating ||
            questions.some(q => !q.text.trim())
          }
          className={`w-full py-4 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D441A] focus:ring-offset-2 focus:ring-offset-[#FFFDD0] transition-all duration-200 font-semibold text-lg ${courseId === null ||
              courseId === undefined ||
              isCreating ||
              questions.some(q => !q.text.trim())
              ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
              : 'bg-[#3D441A] text-[#FFFDD0] hover:bg-[#3D441A]/90 cursor-pointer'
            }`}
          whileHover={
            !isCreating &&
              courseId !== null &&
              courseId !== undefined &&
              !questions.some(q => !q.text.trim())
              ? { scale: 1.02 }
              : {}
          }
          whileTap={
            !isCreating &&
              courseId !== null &&
              courseId !== undefined &&
              !questions.some(q => !q.text.trim())
              ? { scale: 0.98 }
              : {}
          }
        >
          {isCreating ? (
            <span className="flex items-center justify-center">
          
              Creating Exam...
            </span>
          ) : (
            `Create Exam with ${questions.length} Question${questions.length !== 1 ? 's' : ''
            }`
          )}
        </motion.button>

        {courseId === null && (
          <div className="text-red-600 text-center font-semibold">
            Error: No course selected. Please close and reopen the drawer.
          </div>
        )}
      </div>
    </Drawer>
  )
}
