'use client'

import { useState, useEffect } from 'react'
import { Drawer, Progress, Button, Space, Card, Alert } from 'antd'
import {
    TrophyOutlined
} from '@ant-design/icons'
import { 
  useTakeExam, 
  useGetExamQuestions, 
  useGetExamResults, 
  Exam, 
  parseExamResults, 
  useIsEnrolledInCourse,
  calculatePercentageScore,
  getGradeLetter
} from '@/hooks/useContract'
import { useAccount } from 'wagmi'

interface ExamDrawerProps {
    exam: Exam | null
    isOpen: boolean
    onClose: () => void
    onExamCompleted: (score: number, totalQuestions: number) => void
}

export default function ExamDrawer({ exam, isOpen, onClose, onExamCompleted }: ExamDrawerProps) {
    const { address } = useAccount()
    const [currentQuestion, setCurrentQuestion] = useState(0)
    const [answers, setAnswers] = useState<boolean[]>([])
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [showResults, setShowResults] = useState(false)
    const [score, setScore] = useState<number | null>(null)
    const [submitError, setSubmitError] = useState<string | null>(null)

    // Get exam questions
    const { data: questions } = useGetExamQuestions(exam?.examId || BigInt(0))

    // Check if student is enrolled
    const { data: isEnrolled } = useIsEnrolledInCourse(
        exam?.courseId || BigInt(0),
        address
    )

    // Get exam results after submission
    const { data: examResultsData, refetch: refetchResults } = useGetExamResults(
        exam?.examId || BigInt(0),
        address
    )

    // Hook for taking exam
    const { takeExam, isPending, isConfirming, isConfirmed, error } = useTakeExam()

    // Reset state when exam changes
    useEffect(() => {
        if (exam && questions) {
            setCurrentQuestion(0)
            // Initialize with undefined instead of false
            setAnswers(new Array(questions.length).fill(undefined))
            setShowResults(false)
            setScore(null)
            setIsSubmitting(false)
            setSubmitError(null)
        }
    }, [exam, questions])

    // Handle exam submission success
    const examResults = parseExamResults(examResultsData)

    useEffect(() => {
        if (isConfirmed && exam) {
            // Set submitting to false immediately when confirmed
            setIsSubmitting(false)

            refetchResults().then(() => {
                if (examResults) {
                    const finalScore = Number(examResults.rawScore)
                    const totalQuestions = Number(exam.questionCount)
                    setScore(finalScore)
                    setShowResults(true)
                    onExamCompleted(finalScore, totalQuestions)
                }
            })
        }
    }, [isConfirmed, examResults, exam, refetchResults, onExamCompleted])

    // Handle submission errors
    useEffect(() => {
        if (error) {
            console.error('Submission error:', error)
            setSubmitError(error.message || 'Failed to submit exam')
            setIsSubmitting(false)
        }
    }, [error])

    const handleAnswerSelect = (answer: boolean) => {
        const newAnswers = [...answers]
        newAnswers[currentQuestion] = answer
        setAnswers(newAnswers)
        setSubmitError(null) // Clear error when user interacts
    }

    const handleNext = () => {
        if (currentQuestion < (questions?.length || 0) - 1) {
            setCurrentQuestion(currentQuestion + 1)
        }
    }

    const handlePrevious = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(currentQuestion - 1)
        }
    }

    const handleSubmit = async () => {
        if (!exam || !questions) return

        // Validate all questions are answered
        const unansweredQuestions = answers.filter(answer => answer === undefined || answer === null)
        if (unansweredQuestions.length > 0) {
            setSubmitError('Please answer all questions before submitting')
            return
        }

        // Validate array length matches
        if (answers.length !== questions.length) {
            setSubmitError(`Answer count mismatch. Expected ${questions.length}, got ${answers.length}`)
            return
        }

        // Check enrollment
        if (!isEnrolled) {
            setSubmitError('You are not enrolled in this course')
            return
        }

        setIsSubmitting(true)
        setSubmitError(null)

        try {
            console.log('Submitting exam:', {
                examId: exam.examId.toString(),
                answers,
                answersLength: answers.length,
                questionCount: questions.length
            })

            takeExam(exam.examId, answers)
        } catch (err) {
            console.error('Error submitting exam:', err)
            setSubmitError('Failed to submit exam. Please try again.')
            setIsSubmitting(false)
        }
    }

    const totalQuestions = questions?.length || 0
    const progress = totalQuestions > 0 ? ((currentQuestion + 1) / totalQuestions) * 100 : 0

    // Don't include wagmi states in isSubmittingExam calculation when results are shown
    const isSubmittingExam = showResults ? false : (isSubmitting || isPending || isConfirming)

    // Check if all questions are answered
    const allQuestionsAnswered = answers.length === totalQuestions &&
        answers.every(answer => answer !== undefined && answer !== null)

    // Check if current question is answered
    const isCurrentQuestionAnswered = answers[currentQuestion] !== undefined

    // Calculate score display for results
    const scorePercentage = score !== null && totalQuestions > 0 
        ? calculatePercentageScore(BigInt(score), BigInt(totalQuestions))
        : 0
    const gradeLetter = score !== null ? getGradeLetter(scorePercentage) : ''

    return (
        <Drawer
            title={
                <div className="flex justify-between items-center w-full">
                    <div className="flex items-center flex-1">
                        <span className="text-xl font-bold text-[#FFFDD0]">{exam?.title || 'Exam'}</span>
                        {!showResults && (
                            <div className="flex-1 max-w-xs ml-4">
                                <Progress
                                    percent={Math.round(progress)}
                                    size="small"
                                    strokeColor="#FFFDD0"
                                    format={(percent) => (
                                        <span className="text-[#FFFDD0] text-sm font-medium">
                                            {percent}%
                                        </span>
                                    )}
                                />
                            </div>
                        )}
                    </div>
                    {/* Custom Close Button */}
                    <button
                        onClick={onClose}
                        disabled={isSubmittingExam}
                        className={`ml-4 p-2 rounded-lg transition-all duration-200 ${isSubmittingExam
                                ? 'opacity-50 cursor-not-allowed'
                                : 'hover:bg-[#FFFDD0]/20'
                            }`}
                        aria-label="Close drawer"
                    >
                        <svg
                            className="w-5 h-5 text-[#FFFDD0]"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>
            }
            placement="right"
            onClose={onClose}
            open={isOpen}
            width={700}
            closable={false}
            maskClosable={!isSubmittingExam}
            styles={{
                body: {
                    padding: '24px',
                    background: '#FFFDD0'
                },
                header: {
                    background: '#3D441A',
                    color: '#FFFDD0'
                }
            }}
        >
            {showResults && score !== null ? (
                /* Results View */
                <div className="text-center py-8">
                    <div className="inline-flex items-center justify-center w-24 h-24 bg-[#3D441A] rounded-full mb-6">
                        <TrophyOutlined className="text-4xl text-[#FFFDD0]" />
                    </div>

                    <h3 className="text-3xl font-bold text-[#3D441A] mb-4">Exam Submitted!</h3>

                    <Card
                        className="max-w-md mx-auto mb-6 shadow-lg border-2 border-[#3D441A]"
                        styles={{
                            body: {
                                background: '#FFFDD0',
                                padding: '24px'
                            }
                        }}
                    >
                        <div className="text-4xl font-bold text-[#3D441A] mb-2">
                            {score} / {totalQuestions}
                        </div>
                        <div className="text-lg text-[#3D441A]/80 mb-2">
                            {scorePercentage}% Correct
                        </div>
                        <div className="text-md font-semibold text-[#3D441A]">
                            Grade: {gradeLetter}
                        </div>
                        <div className="mt-4">
                            <Progress
                                percent={scorePercentage}
                                strokeColor={{
                                    '0%': '#ff4d4f',
                                    '50%': '#faad14',
                                    '100%': '#52c41a'
                                }}
                                format={() => `${scorePercentage}%`}
                            />
                        </div>
                    </Card>

                    <Button
                        type="primary"
                        size="large"
                        onClick={onClose}
                        className="bg-[#3D441A] text-[#FFFDD0] hover:bg-[#3D441A]/90 h-12 px-8 border-2 border-[#3D441A]"
                    >
                        Close
                    </Button>
                </div>
            ) : (

                /* Exam Questions View */
                <div className="max-w-2xl mx-auto">
                    {/* Validation Warnings */}
                    {!isEnrolled && (
                        <Alert
                            message="Not Enrolled"
                            description="You are not enrolled in this course. Please enroll before taking the exam."
                            type="warning"
                            showIcon
                            className="mb-4"
                        />
                    )}

                    {/* Question Counter */}
                    <div className="text-sm text-[#3D441A]/80 mb-4">
                        Question {currentQuestion + 1} of {totalQuestions}
                    </div>

                    {/* Current Question */}
                    {questions && questions[currentQuestion] && (
                        <div className="mb-6 p-6 border-2 border-[#3D441A] rounded-lg bg-[#FFFDD0] shadow-sm">
                            <h3 className="text-xl font-semibold text-[#3D441A] mb-6">
                                {questions[currentQuestion]}
                            </h3>

                            {/* Answer Options */}
                            <div className="space-y-4 w-full">
                                {/* True Button */}
                                <button
                                    onClick={() => handleAnswerSelect(true)}
                                    className={`w-full h-16 text-left flex items-center border-2 rounded-lg transition-all duration-200 ${answers[currentQuestion] === true
                                            ? 'bg-[#3D441A] border-[#3D441A] text-[#FFFDD0]'
                                            : 'bg-[#FFFDD0] border-[#3D441A] text-[#3D441A] hover:bg-[#3D441A] hover:text-[#FFFDD0]'
                                        }`}
                                    style={{ padding: '16px' }}
                                >
                                    <div className={`w-6 h-6 rounded-full border-2 mr-3 flex items-center justify-center ${answers[currentQuestion] === true
                                            ? 'bg-[#FFFDD0] border-[#FFFDD0]'
                                            : 'border-[#3D441A]'
                                        }`}>
                                        {answers[currentQuestion] === true && (
                                            <svg className="w-3 h-3 text-[#3D441A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                            </svg>
                                        )}
                                    </div>
                                    <span className="font-medium text-base">True</span>
                                </button>

                                {/* False Button */}
                                <button
                                    onClick={() => handleAnswerSelect(false)}
                                    className={`w-full h-16 text-left flex items-center border-2 rounded-lg transition-all duration-200 ${answers[currentQuestion] === false
                                            ? 'bg-[#3D441A] border-[#3D441A] text-[#FFFDD0]'
                                            : 'bg-[#FFFDD0] border-[#3D441A] text-[#3D441A] hover:bg-[#3D441A] hover:text-[#FFFDD0]'
                                        }`}
                                    style={{ padding: '16px' }}
                                >
                                    <div className={`w-6 h-6 rounded-full border-2 mr-3 flex items-center justify-center ${answers[currentQuestion] === false
                                            ? 'bg-[#FFFDD0] border-[#FFFDD0]'
                                            : 'border-[#3D441A]'
                                        }`}>
                                        {answers[currentQuestion] === false && (
                                            <svg className="w-3 h-3 text-[#3D441A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        )}
                                    </div>
                                    <span className="font-medium text-base">False</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex justify-between pt-6 border-t border-[#3D441A]/30">
                        <button
                            onClick={handlePrevious}
                            disabled={currentQuestion === 0}
                            className={`flex items-center cursor-pointer gap-2 px-6 py-2 border-2 border-[#3D441A] rounded-lg font-medium transition-all duration-200 ${currentQuestion === 0
                                    ? 'bg-gray-300 border-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-[#FFFDD0] text-[#3D441A] hover:bg-[#3D441A] hover:text-[#FFFDD0]'
                                }`}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                            </svg>
                            Previous
                        </button>

                        {currentQuestion === totalQuestions - 1 ? (
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmittingExam || !allQuestionsAnswered || !isEnrolled}
                                className={`px-8 py-2 border-2 border-[#3D441A] cursor-pointer rounded-lg font-medium transition-all duration-200 ${isSubmittingExam || !allQuestionsAnswered || !isEnrolled
                                        ? 'bg-gray-300 border-gray-300 text-gray-500 cursor-not-allowed'
                                        : 'bg-[#3D441A] text-[#FFFDD0] hover:bg-[#3D441A]/90'
                                    }`}
                            >
                                {isSubmittingExam ? (
                                    <span className="flex items-center gap-2">
                                        <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 2a10 10 0 100 20 10 10 0 000-20z" />
                                        </svg>
                                        Submitting...
                                    </span>
                                ) : (
                                    'Submit Exam'
                                )}
                            </button>
                        ) : (
                            <button
                                onClick={handleNext}
                                disabled={!isCurrentQuestionAnswered}
                                className={`flex items-center cursor-pointer gap-2 px-8 py-2 border-2 border-[#3D441A] rounded-lg font-medium transition-all duration-200 ${!isCurrentQuestionAnswered
                                        ? 'bg-gray-300 border-gray-300 text-gray-500 cursor-not-allowed'
                                        : 'bg-[#3D441A] text-[#FFFDD0] hover:bg-[#3D441A]/90'
                                    }`}
                            >
                                Next
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        )}
                    </div>

                    {/* Error Display */}
                    {(submitError || error) && (
                        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex items-center gap-2 text-red-800">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="font-medium">Error submitting exam</span>
                            </div>
                            <p className="text-red-700 text-sm mt-1">{submitError || error?.message}</p>
                        </div>
                    )}
                </div>
            )}
        </Drawer>
    )
}