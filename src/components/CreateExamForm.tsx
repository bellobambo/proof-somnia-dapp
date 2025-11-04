'use client'

import { Drawer, message, Input, Button, Space, Form, Card, Select, Upload } from 'antd'
import { useCreateExamWithConversion, QuestionOptions, toQuestionOptions } from '@/hooks/useContract'
import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { PlusOutlined, DeleteOutlined, CloseOutlined, UploadOutlined, DownloadOutlined } from '@ant-design/icons'
import toast from 'react-hot-toast'
import { useAccount } from 'wagmi'

const { Option } = Select
const { Dragger } = Upload

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
  const { address } = useAccount()
  const { createExam, isPending, isConfirming, isConfirmed, error, hash } = useCreateExamWithConversion()
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()
  const [questions, setQuestions] = useState<QuestionForm[]>([
    {
      text: '',
      options: ['', '', '', ''],
      correctAnswer: 0
    }
  ])
  const [storedTitle, setStoredTitle] = useState('')
  const [fileUploadLoading, setFileUploadLoading] = useState(false)


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
      setQuestions([{
        text: '',
        options: ['', '', '', ''],
        correctAnswer: 0
      }])
      setLoading(false)
      setFileUploadLoading(false)
    }
  }, [open, form])

 
  useEffect(() => {
    console.log('🔄 CreateExamDrawer state:', {
      isPending,
      isConfirming,
      isConfirmed,
      error,
      hash,
      loading
    })
  }, [isPending, isConfirming, isConfirmed, error, hash, loading])

useEffect(() => {
  if (isConfirmed) {
    console.log('✅ Exam creation confirmed!')
    toast.success('Exam created successfully!')
    
    onClose()
    
    form.resetFields()
    setQuestions([{
      text: '',
      options: ['', '', '', ''],
      correctAnswer: 0
    }])
    setLoading(false)
    setTimeout(() => {
      window.location.reload()
    }, 1500)
  }
}, [isConfirmed, onClose, form])

  useEffect(() => {
    if (error) {
      console.error('❌ Contract error details:', {
        message: error.message,
        name: error.name,
        stack: error.stack
      })
      message.error(`Error creating exam: ${error.message}`)
      setLoading(false)
    }
  }, [error])

  
  const parseQuestionsFromFile = (content: string): QuestionForm[] => {
    const lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 0)
    const parsedQuestions: QuestionForm[] = []
    let currentQuestion: Partial<QuestionForm> = {}
    let options: string[] = []

    for (const line of lines) {
    
      if (line.startsWith('#')) continue

      if (line.startsWith('Q:') || line.match(/^\d+\./)) {
      
        if (currentQuestion.text && options.length === 4) {
          parsedQuestions.push({
            text: currentQuestion.text,
            options: [...options],
            correctAnswer: currentQuestion.correctAnswer || 0
          })
        }

        let questionText = line
        if (line.startsWith('Q:')) {
          questionText = line.substring(2).trim()
        } else if (line.match(/^\d+\./)) {
          questionText = line.replace(/^\d+\.\s*/, '').trim()
        }

        currentQuestion = { text: questionText }
        options = []
        continue
      }


      if (line.match(/^[A-D]\)/)) {
        const optionText = line.substring(2).trim()
        options.push(optionText)
        continue
      }

     
      if (line.startsWith('Correct:')) {
        const correctAnswerLetter = line.substring(8).trim().toUpperCase()
        const correctAnswerIndex = ['A', 'B', 'C', 'D'].indexOf(correctAnswerLetter)
        if (correctAnswerIndex !== -1) {
          currentQuestion.correctAnswer = correctAnswerIndex
        }
        continue
      }

      if (line === '' && currentQuestion.text && options.length === 4) {
        parsedQuestions.push({
          text: currentQuestion.text,
          options: [...options],
          correctAnswer: currentQuestion.correctAnswer || 0
        })
        currentQuestion = {}
        options = []
      }
    }


    if (currentQuestion.text && options.length === 4) {
      parsedQuestions.push({
        text: currentQuestion.text,
        options: [...options],
        correctAnswer: currentQuestion.correctAnswer || 0
      })
    }

    return parsedQuestions
  }

  const handleFileUpload = async (file: File): Promise<boolean> => {
    setFileUploadLoading(true)
    try {
      const content = await readFileContent(file)
      const parsedQuestions = parseQuestionsFromFile(content)

      if (parsedQuestions.length === 0) {
        message.error('No valid questions found in the file. Please check the format.')
        setFileUploadLoading(false)
        return false
      }

      const validQuestions = parsedQuestions.filter(q =>
        q.text.trim() &&
        q.options.every(opt => opt.trim()) &&
        q.correctAnswer >= 0 &&
        q.correctAnswer <= 3
      )

      if (validQuestions.length === 0) {
        message.error('No valid questions found after validation. Please check the file format.')
        setFileUploadLoading(false)
        return false
      }

      setQuestions(validQuestions)
      message.success(`Successfully loaded ${validQuestions.length} questions from file!`)
      setFileUploadLoading(false)
      return true
    } catch (error) {
      console.error('Error parsing file:', error)
      message.error('Error reading file. Please check the format and try again.')
      setFileUploadLoading(false)
      return false
    }
  }

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        resolve(content)
      }
      reader.onerror = (e) => reject(new Error('Failed to read file'))
      reader.readAsText(file)
    })
  }

 
  const downloadTemplate = () => {
    const templateContent = `# Exam Questions Template
# Copy and modify this template to create your questions
# Each question block should follow this format:

# =============================================
# QUESTION 1
# =============================================
1. What is the main feature of Blockchain technology?
A) Centralized control
B) Fast transaction speeds
C) Immutable ledger
D) Free transactions
Correct: C

# =============================================
# QUESTION 2  
# =============================================
2. Which consensus algorithm does Bitcoin use?
A) Proof of Stake
B) Proof of Work
C) Delegated Proof of Stake
D) Practical Byzantine Fault Tolerance
Correct: B

# =============================================
# QUESTION 3
# =============================================
3. What is a smart contract?
A) A legal document
B) A type of cryptocurrency
C) A blockchain protocol
D) A self-executing contract with terms in code
Correct: D

# =============================================
# QUESTION 4
# =============================================
4. What does NFT stand for?
A) New Financial Technology
B) Network File Transfer
C) National Fund Transfer
D) Non-Fungible Token
Correct: D

# =============================================
# QUESTION 5
# =============================================
5. Which cryptocurrency is known as the "silver to Bitcoin's gold"?
A) Ethereum
B) Litecoin
C) Ripple
D) Cardano
Correct: B

# =============================================
# INSTRUCTIONS:
# =============================================
# 1. You can use either format:
#    - Numbered: "1. Your question here"
#    - Simple: "Q: Your question here"
#
# 2. Add exactly 4 options with A), B), C), D)
#
# 3. Mark the correct answer with "Correct: A" 
#    where X is A, B, C, or D
#
# 4. Separate questions with blank lines
#
# 5. Comments (lines starting with #) are ignored
#
# 6. Save as .txt file and upload
#
# 7. You can add section dividers with ==== for organization
#
# TIP: Use numbering to easily reference and organize your questions!`

    const blob = new Blob([templateContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'exam-questions-template.txt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    message.success('Template downloaded successfully!')
  }

  const uploadProps = {
    name: 'file',
    multiple: false,
    accept: '.txt',
    showUploadList: false,
    beforeUpload: (file: File) => {
      handleFileUpload(file)
      return false
    },
    customRequest: () => { }
  }

  const handleSubmit = async () => {
    try {
      console.log('🎯 Starting exam submission process...')
      setLoading(true)

    
      const values = await form.validateFields()
      console.log('📝 Form values validated:', values)

      console.log('🎯 Submitting exam form:', {
        courseId: courseId?.toString(),
        values,
        questionsCount: questions.length,
        userAddress: address
      })

  
      if (courseId === null || courseId === undefined) {
        console.error('❌ No course selected')
        message.error('No course selected')
        setLoading(false)
        return
      }

    
      const validQuestions = questions.filter(q => q.text.trim() && q.options.every(opt => opt.trim()))
      if (validQuestions.length === 0) {
        console.error('❌ No valid questions')
        message.error('Please add at least one valid question with all options filled')
        setLoading(false)
        return
      }

  
      const hasEmptyQuestions = questions.some(q => !q.text.trim())
      const hasEmptyOptions = questions.some(q => q.options.some(opt => !opt.trim()))

      if (hasEmptyQuestions || hasEmptyOptions) {
        console.error('❌ Empty questions or options')
        message.error('Please fill all question texts and option fields')
        setLoading(false)
        return
      }

      const hasDuplicateOptions = questions.some(q => {
        const filledOptions = q.options.filter(opt => opt.trim())
        return new Set(filledOptions).size !== filledOptions.length
      })

      if (hasDuplicateOptions) {
        console.error('❌ Duplicate options found')
        message.error('Each question must have unique options')
        setLoading(false)
        return
      }


      const questionTexts = questions.map(q => q.text.trim())
      const questionOptions = questions.map(q => q.options.map(opt => opt.trim()))
      const correctAnswers = questions.map(q => q.correctAnswer)

      console.log('📤 Creating exam with data:', {
        courseId: courseId.toString(),
        title: values.title,
        questionTexts,
        questionOptions,
        correctAnswers,
        questionCount: questionTexts.length,
        userAddress: address
      })

  
      console.log('🚀 Calling createExam function...')
      createExam(courseId, values.title, questionTexts, questionOptions, correctAnswers)

      console.log('📞 createExam function called, waiting for response...')

    } catch (err) {
      console.error('❌ Form validation error:', err)
      toast.error('Please fill all required fields correctly')
      setLoading(false)
    }
  }

  const addQuestion = () => {
    setQuestions([...questions, {
      text: '',
      options: ['', '', '', ''],
      correctAnswer: 0
    }])
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

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    const newQuestions = [...questions]
    newQuestions[questionIndex].options[optionIndex] = value
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
          <p className="text-sm text-gray-600">
            User: {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Not connected'}
          </p>
        </div>
      }
      placement="right"
      width={800}
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
        {(isPending || isConfirming || error) && (
          <Card size="small" className="bg-yellow-50 border-yellow-200">
            <div className="text-sm">
              <p><strong>Status:</strong> {isPending ? 'Pending...' : isConfirming ? 'Confirming...' : error ? 'Error' : 'Ready'}</p>
              {hash && <p><strong>Tx Hash:</strong> {hash.slice(0, 10)}...{hash.slice(-8)}</p>}
              {error && <p><strong>Error:</strong> {error.message}</p>}
            </div>
          </Card>
        )}

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
              <Input
                placeholder="e.g. Midterm Assessment - Blockchain Fundamentals"
                className="w-full bg-white border border-[#3D441A]/20 rounded-lg px-4 py-3 text-[#3D441A] placeholder-[#3D441A]/40 focus:outline-none focus:ring-2 focus:ring-[#3D441A] focus:border-transparent transition-all text-lg"
                size="large"
              />
            </Form.Item>
          </Form>
        </div>

        <Card
          title="Bulk Upload Questions"
          size="small"
          className="border-[#3D441A]/20"
        >
          <div className="space-y-4">
            <div className="flex gap-2 mb-4">
              <Button
                onClick={downloadTemplate}
                icon={<DownloadOutlined />}
                className="border-[#3D441A] text-[#3D441A] hover:border-[#3D441A]/80 hover:text-[#3D441A]/80 flex items-center"
              >
                Download Template
              </Button>
            </div>

            <Dragger {...uploadProps}>
              <div className="p-4 text-center">
                <p className="text-4xl mb-2">
                  <UploadOutlined />
                </p>
                <p className="text-[#3D441A] font-medium">
                  Click or drag file to upload
                </p>
                <p className="text-gray-500 text-sm mt-1">
                  Upload a .txt file with questions in the specified format
                </p>
              </div>
            </Dragger>

            <div className=" border border-[#3D441A] rounded-lg p-3">
              <h4 className="font-semibold text-[#3D441A] mb-2">File Format Example:</h4>
              <pre className="text-xs text-[#3D441A]  p-2 rounded overflow-x-auto">
                {`1. What is Blockchain?
A) Centralized database
B) Distributed ledger
C) Cloud storage
D) Web server
Correct: B

2. What is Bitcoin?
A) A programming language
B) A cryptocurrency
C) A web browser
D) An operating system
Correct: B`}
              </pre>
              <p className="text-xs text-[#3D441A] mt-2">
                • Use numbered questions: "1. Your question"<br />
               
                • Options with A), B), C), D)<br />
                • Mark correct answer with "Correct: A"<br />
                • Separate questions with blank lines
              </p>
            </div>
          </div>
        </Card>

        <div>
          <div className="flex justify-between items-center mb-4 mt-2">
            <h3 className="text-lg font-semibold text-[#3D441A]">
              Multiple Choice Questions ({questions.length})
            </h3>
            <div className="flex gap-2">
              <Button
                onClick={addQuestion}
                icon={<PlusOutlined />}
                className="border-[#3D441A] text-[#3D441A] hover:border-[#3D441A]/80 hover:text-[#3D441A]/80 flex items-center"
              >
                Add Question
              </Button>
            </div>
          </div>

          {fileUploadLoading && (
            <div className="text-center py-4">
              <p className="text-[#3D441A]">Processing uploaded file...</p>
            </div>
          )}

          <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2">
            {questions.map((question, questionIndex) => (
              <Card
                key={questionIndex}
                title={
                  <div className="flex justify-between items-center">
                    <span>Question {questionIndex + 1}</span>
                    {questions.length > 1 && (
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => removeQuestion(questionIndex)}
                        className="hover:bg-red-50"
                        size="small"
                      />
                    )}
                  </div>
                }
                size="small"
                className="border-[#3D441A]/20 hover:shadow-md transition-shadow"
              >
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#3D441A] mb-2">
                      Question Text
                    </label>
                    <Input.TextArea
                      placeholder="Enter your multiple choice question (e.g., 'What is the main feature of Blockchain?')"
                      value={question.text}
                      onChange={e =>
                        updateQuestion(questionIndex, 'text', e.target.value)
                      }
                      rows={2}
                      className="w-full bg-white border border-[#3D441A]/20 rounded-lg px-4 py-2 text-[#3D441A] placeholder-[#3D441A]/40 focus:border-[#3D441A] focus:ring-1 focus:ring-[#3D441A]"
                    />
                    {!question.text.trim() && (
                      <p className="text-red-500 text-xs mt-1">
                        Question text is required
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#3D441A] mb-3">
                      Options (Select one as correct answer)
                    </label>
                    <div className="space-y-2">
                      {question.options.map((option, optionIndex) => (
                        <div key={optionIndex} className="flex items-center gap-2">
                          <div className={`w-6 h-6 flex items-center justify-center rounded-full border-2 ${question.correctAnswer === optionIndex
                              ? 'bg-[#3D441A] border-[#3D441A] text-white'
                              : 'border-gray-300'
                            }`}>
                            {String.fromCharCode(65 + optionIndex)}
                          </div>
                          <Input
                            placeholder={`Option ${String.fromCharCode(65 + optionIndex)}`}
                            value={option}
                            onChange={e => updateOption(questionIndex, optionIndex, e.target.value)}
                            className="flex-1 bg-white border border-[#3D441A]/20 rounded-lg px-3 py-2 text-[#3D441A] placeholder-[#3D441A]/40 focus:border-[#3D441A] focus:ring-1 focus:ring-[#3D441A]"
                          />
                          <Button
                            type={question.correctAnswer === optionIndex ? 'primary' : 'default'}
                            onClick={() => updateQuestion(questionIndex, 'correctAnswer', optionIndex)}
                            className={`min-w-20 ${question.correctAnswer === optionIndex
                                ? 'bg-[#3D441A] border-[#3D441A] hover:bg-[#3D441A]/90'
                                : 'border-gray-300 hover:border-[#3D441A] hover:text-[#3D441A]'
                              }`}
                          >
                            {question.correctAnswer === optionIndex ? 'Correct' : 'Select'}
                          </Button>
                        </div>
                      ))}
                    </div>

                    {question.options.some(opt => !opt.trim()) && (
                      <p className="text-red-500 text-xs mt-2">
                        All options must be filled
                      </p>
                    )}

                    <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded">
                      <p className="text-green-700 text-sm">
                        <strong>Correct Answer:</strong> Option {String.fromCharCode(65 + question.correctAnswer)} - {question.options[question.correctAnswer] || 'Not set'}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <Card size="small" className="bg-[#3D441A]/5 border-[#3D441A]/20">
          <div className="text-[#3D441A]">
            <h4 className="font-semibold mb-2">Exam Summary</h4>
            <p>• {questions.length} question{questions.length !== 1 ? 's' : ''}</p>
            <p>• Multiple choice format (A, B, C, D)</p>
            <p>• Course: {storedTitle || 'Not selected'}</p>
            <p>• User: {address ? 'Connected' : 'Not connected'}</p>
            <p className="text-sm text-green-600 mt-2">
              💡 Tip: Use numbered questions in the template for better organization!
            </p>
          </div>
        </Card>

        <motion.div
          className="sticky h-40  bg-[#FFFDD0] pt-8 pb-2 border-t border-[#3D441A]/10"
        >
          <Button
            type="primary"
            onClick={handleSubmit}
            disabled={
              courseId === null ||
              courseId === undefined ||
              isCreating ||
              questions.some(q => !q.text.trim() || q.options.some(opt => !opt.trim())) ||
              !address
            }
            loading={isCreating}
            style={{
              height : "50px"
            }}
            className={`w-full h-16 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D441A] focus:ring-offset-2 focus:ring-offset-[#FFFDD0] transition-all duration-200 font-semibold text-lg ${courseId === null ||
                courseId === undefined ||
                isCreating ||
                questions.some(q => !q.text.trim() || q.options.some(opt => !opt.trim())) ||
                !address
                ? '  cursor-not-allowed border-2 border-[#3D441A]'
                : 'bg-[#3D441A] text-[#FFFDD0] hover:bg-[#3D441A]/90 cursor-pointer'
              }`}
          >
            {isCreating ? (
              <span className="flex text-[#3D441A] items-center justify-center">
                {isPending ? 'Pending...' : isConfirming ? 'Confirming...' : 'Creating Exam...'}
              </span>
            ) : (
              `Create Exam with ${questions.length} Question${questions.length !== 1 ? 's' : ''}`
            )}
          </Button>

          {!address && (
            <div className="text-red-600 text-center font-semibold mt-2">
              Error: Wallet not connected. Please connect your wallet.
            </div>
          )}

          {courseId === null && (
            <div className="text-red-600 text-center font-semibold mt-2">
              Error: No course selected. Please close and reopen the drawer.
            </div>
          )}
        </motion.div>
      </div>
    </Drawer>
  )
}