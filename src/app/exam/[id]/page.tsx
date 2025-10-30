'use client'

import { useParams } from 'next/navigation'
import { useAccount } from 'wagmi'
import { useGetExam, useGetExamQuestion, useStartExam, useSubmitAnswer, useSubmitExam, Exam, Question } from '@/hooks/useContract'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function ExamPage() {
  const params = useParams()
  const { address } = useAccount()
  const examId = BigInt(params.id as string)
  
  const { data: exam, isLoading: examLoading } = useGetExam(examId)
  const { startExam, isPending: startPending } = useStartExam()
  const { submitAnswer, isPending: answerPending } = useSubmitAnswer()
  const { submitExam, isPending: submitPending } = useSubmitExam()
  
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<{ [key: number]: number }>({})
  const [examStarted, setExamStarted] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)

  const { data: questionData } = useGetExamQuestion(examId, BigInt(currentQuestion))

  // Type guards to handle the tuple response
  const typedExam = exam as unknown as Exam
  const typedQuestionData = questionData as unknown as Question

  // Timer effect
  useEffect(() => {
    if (examStarted && typedExam && timeRemaining === null) {
      setTimeRemaining(Number(typedExam.durationMinutes) * 60) // Convert to seconds
    }
  }, [examStarted, typedExam, timeRemaining])

  useEffect(() => {
    if (timeRemaining !== null && timeRemaining > 0) {
      const timer = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (timeRemaining === 0) {
      handleSubmitExam()
    }
  }, [timeRemaining])

  const handleStartExam = () => {
    startExam(examId)
    setExamStarted(true)
  }

  const handleAnswerSelect = (answerIndex: number) => {
    setAnswers(prev => ({ ...prev, [currentQuestion]: answerIndex }))
    submitAnswer(examId, BigInt(currentQuestion), BigInt(answerIndex))
  }

  const handleSubmitExam = () => {
    submitExam(examId)
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  if (examLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading exam...</p>
        </div>
      </div>
    )
  }

  if (!typedExam) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Exam Not Found</h2>
          <Link href="/" className="text-blue-500 hover:text-blue-600">
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  if (!examStarted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">{typedExam.title}</h2>
          <div className="space-y-3 mb-6">
            <p className="text-gray-600">
              <span className="font-medium">Duration:</span> {typedExam.durationMinutes.toString()} minutes
            </p>
            <p className="text-gray-600">
              <span className="font-medium">Questions:</span> {typedExam.questionCount.toString()}
            </p>
            <p className="text-gray-600">
              <span className="font-medium">Scheduled:</span> {new Date(Number(typedExam.scheduledDateTime) * 1000).toLocaleString()}
            </p>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
            <p className="text-sm text-yellow-800">
              Once you start the exam, the timer will begin and you cannot pause it. Make sure you have a stable internet connection.
            </p>
          </div>
          <button
            onClick={handleStartExam}
            disabled={startPending}
            className="w-full bg-blue-500 text-white py-3 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {startPending ? 'Starting...' : 'Start Exam'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">{typedExam.title}</h1>
            {timeRemaining !== null && (
              <div className={`text-lg font-mono ${timeRemaining < 300 ? 'text-red-600' : 'text-gray-900'}`}>
                Time: {formatTime(timeRemaining)}
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Question {currentQuestion + 1} of {typedExam.questionCount.toString()}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                disabled={currentQuestion === 0}
                className="px-3 py-1 bg-gray-200 text-gray-700 rounded disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentQuestion(Math.min(Number(typedExam.questionCount) - 1, currentQuestion + 1))}
                disabled={currentQuestion >= Number(typedExam.questionCount) - 1}
                className="px-3 py-1 bg-gray-200 text-gray-700 rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>

          {typedQuestionData && (
            <div className="space-y-4">
              <h3 className="text-xl font-medium text-gray-900 mb-4">
                {typedQuestionData.questionText}
              </h3>
              <div className="space-y-2">
                {typedQuestionData.options.map((option, index) => (
                  <label
                    key={index}
                    className={`flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                      answers[currentQuestion] === index ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question-${currentQuestion}`}
                      value={index}
                      checked={answers[currentQuestion] === index}
                      onChange={() => handleAnswerSelect(index)}
                      className="mr-3"
                    />
                    <span className="text-gray-900">{option}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Answered: {Object.keys(answers).length} / {typedExam.questionCount.toString()}
            </div>
            <button
              onClick={handleSubmitExam}
              disabled={submitPending}
              className="bg-green-500 text-white py-2 px-6 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {submitPending ? 'Submitting...' : 'Submit Exam'}
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}