'use client'

import { useState } from 'react'
import { useAccount } from 'wagmi'
import { Button, Drawer, Input, message } from 'antd'
import { PlusOutlined, EditOutlined, PlayCircleOutlined } from '@ant-design/icons'
import {
  useGetAllCourses,
  useGetUser,
  useGetExamsForCourse,
  useGetExam,
  useCreateExam,
  useStartExam,
  useSubmitAnswer,
  UserRole,
  Exam,
} from '@/hooks/useContract'

export default function ExamsPage() {
  const { address } = useAccount()
  const { data: userData } = useGetUser(address as `0x${string}`)
  const { data: courses } = useGetAllCourses()

  const [selectedExam, setSelectedExam] = useState<Exam | null>(null)
  const [drawerVisible, setDrawerVisible] = useState(false)

  const [questionText, setQuestionText] = useState('')
  const [options, setOptions] = useState(['', '', '', ''])
  const [correctAnswer, setCorrectAnswer] = useState(0)

  const { submitAnswer } = useSubmitAnswer()
  const { startExam } = useStartExam()

  const handleOpenDrawer = (exam: Exam) => {
    setSelectedExam(exam)
    setDrawerVisible(true)
  }

  const handleCloseDrawer = () => {
    setDrawerVisible(false)
    setQuestionText('')
    setOptions(['', '', '', ''])
    setCorrectAnswer(0)
  }

  const handleAddQuestion = () => {
    if (!selectedExam) return
    if (!questionText.trim()) {
      message.error('Please enter a question.')
      return
    }
    if (options.some(opt => !opt.trim())) {
      message.error('Please fill all options.')
      return
    }
    message.success(`Question added to exam ${selectedExam.title}!`)
    handleCloseDrawer()
  }

  if (!courses) return <p className="text-center text-gray-500 mt-10">Loading exams...</p>

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6">
      <h1 className="text-3xl font-bold text-center mb-8">All Exams</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course: any) => {
          const { data: examIds } = useGetExamsForCourse(course.id)

          if (!examIds || examIds.length === 0) return null

          // For each exam ID, fetch the actual exam data
          return examIds.map((examId: bigint) => {
            const { data: exam } = useGetExam(examId)
            
            if (!exam) return null

            return (
              <div
                key={exam.examId.toString()} 
                className="bg-white shadow-md rounded-2xl p-5 border border-gray-200"
              >
                <h2 className="text-xl font-semibold mb-2">{exam.title}</h2>
                <p className="text-gray-600 text-sm mb-1">
                  Duration: {Number(exam.durationMinutes)} mins
                </p>
                <p className="text-gray-600 text-sm mb-3">
                  Questions: {Number(exam.questionCount)}
                </p>

                {/* Role-based actions */}
                {userData?.role === UserRole.TUTOR ? (
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => handleOpenDrawer(exam)}
                    block
                  >
                    Add Question
                  </Button>
                ) : (
                  <Button
                    type="default"
                    icon={<PlayCircleOutlined />}
                    onClick={() => startExam(exam.examId)}
                    block
                  >
                    Take Exam
                  </Button>
                )}
              </div>
            )
          })
        })}
      </div>

      {/* Drawer for Adding Question */}
      <Drawer
        title={`Add Question to ${selectedExam?.title || ''}`}
        placement="right"
        onClose={handleCloseDrawer}
        open={drawerVisible}
        width={420}
      >
        <div className="flex flex-col gap-4">
          <Input.TextArea
            placeholder="Enter question text"
            value={questionText}
            onChange={e => setQuestionText(e.target.value)}
            rows={3}
          />

          {options.map((opt, i) => (
            <Input
              key={i}
              placeholder={`Option ${i + 1}`}
              value={opt}
              onChange={e => {
                const newOpts = [...options]
                newOpts[i] = e.target.value
                setOptions(newOpts)
              }}
            />
          ))}

          <Input
            type="number"
            min={1}
            max={options.length}
            placeholder="Correct Answer (1-4)"
            value={correctAnswer}
            onChange={e => setCorrectAnswer(Number(e.target.value))}
          />

          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={handleAddQuestion}
            block
          >
            Save Question
          </Button>
        </div>
      </Drawer>
    </div>
  )
}