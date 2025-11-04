'use client'

import { useState, useEffect, useMemo } from 'react'
import { Drawer, Progress, Button, Space, Card, Alert, Radio } from 'antd'
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
    getGradeLetter,
    parseExamQuestions,
    useGetExamCorrectAnswers
} from '@/hooks/useContract'
import { useAccount } from 'wagmi'
import toast from 'react-hot-toast'

interface ExamDrawerProps {
    exam: Exam | null
    isOpen: boolean
    onClose: () => void
    onExamCompleted: (score: number, totalQuestions: number) => void
}

export default function ExamDrawer({ exam, isOpen, onClose, onExamCompleted }: ExamDrawerProps) {
    const { address } = useAccount()
    const [currentQuestion, setCurrentQuestion] = useState(0)
    const [answers, setAnswers] = useState<number[]>([]) 
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [showResults, setShowResults] = useState(false)
    const [score, setScore] = useState<number | null>(null)
    const [submitError, setSubmitError] = useState<string | null>(null)

  
    const { data: questionsData } = useGetExamQuestions(exam?.examId || BigInt(0))
    const { data: correctAnswersData } = useGetExamCorrectAnswers(exam?.examId || BigInt(0))

 
    const parsedQuestions = useMemo(() =>
        parseExamQuestions(questionsData, correctAnswersData),
        [questionsData, correctAnswersData]
    )
    const { data: isEnrolled } = useIsEnrolledInCourse(
        exam?.courseId || BigInt(0),
        address
    )

    const { data: examResultsData, refetch: refetchResults } = useGetExamResults(
        exam?.examId || BigInt(0),
        address
    )

    const { takeExam, isPending, isConfirming, isConfirmed, error } = useTakeExam()

 
    useEffect(() => {
        if (exam && parsedQuestions) {
            setCurrentQuestion(0)

            setAnswers(new Array(parsedQuestions.length).fill(-1))
            setShowResults(false)
            setScore(null)
            setIsSubmitting(false)
            setSubmitError(null)
        }
    }, [exam, parsedQuestions])

    const examResults = parseExamResults(examResultsData)

    useEffect(() => {
        if (isConfirmed && exam) {
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
            toast.success('Exam submitted successfully!')
            setTimeout(() => {
                window.location.reload()
            }, 1500);
        }
    }, [isConfirmed, examResults, exam, refetchResults, onExamCompleted])


    useEffect(() => {
        if (error) {
            console.error('Submission error:', error)
            setSubmitError(error.message || 'Failed to submit exam')
            setIsSubmitting(false)
        }
    }, [error])

    const handleAnswerSelect = (answerIndex: number) => {
        console.log('Selecting answer:', {
            questionIndex: currentQuestion,
            answerIndex,
            currentAnswers: answers
        })

        const newAnswers = [...answers]
        newAnswers[currentQuestion] = answerIndex
        setAnswers(newAnswers)
        setSubmitError(null)
    }

    const handleNext = () => {
        if (currentQuestion < (parsedQuestions?.length || 0) - 1) {
            setCurrentQuestion(currentQuestion + 1)
        }
    }

    const handlePrevious = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(currentQuestion - 1)
        }
    }

    const handleSubmit = async () => {
        if (!exam || !parsedQuestions) return

     
        const unansweredQuestions = answers.filter(answer => answer === -1)
        if (unansweredQuestions.length > 0) {
            setSubmitError('Please answer all questions before submitting')
            return
        }

      
        if (answers.length !== parsedQuestions.length) {
            setSubmitError(`Answer count mismatch. Expected ${parsedQuestions.length}, got ${answers.length}`)
            return
        }

       
        const invalidAnswers = answers.filter(answer => answer < 0 || answer > 3)
        if (invalidAnswers.length > 0) {
            setSubmitError('Some answers are invalid. Please select valid options (A, B, C, or D)')
            return
        }

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
                questionCount: parsedQuestions.length
            })

            takeExam(exam.examId, answers)
        } catch (err) {
            console.error('Error submitting exam:', err)
            setSubmitError('Failed to submit exam. Please try again.')
            setIsSubmitting(false)
        }
    }

    const totalQuestions = parsedQuestions?.length || 0
    const progress = totalQuestions > 0 ? ((currentQuestion + 1) / totalQuestions) * 100 : 0

    const isSubmittingExam = showResults ? false : (isSubmitting || isPending || isConfirming)

    const allQuestionsAnswered = answers.length === totalQuestions &&
        answers.every(answer => answer !== -1 && answer >= 0 && answer <= 3)

    const isCurrentQuestionAnswered = answers[currentQuestion] !== -1

    const scorePercentage = score !== null && totalQuestions > 0
        ? calculatePercentageScore(BigInt(score), BigInt(totalQuestions))
        : 0
    const gradeLetter = score !== null ? getGradeLetter(scorePercentage) : ''

   
    const getOptionLetter = (index: number) => String.fromCharCode(65 + index)

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
            width={1500}
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
                <div className="max-w-2xl mx-auto">
                    {!isEnrolled && (
                        <Alert
                            message="Not Enrolled"
                            description="You are not enrolled in this course. Please enroll before taking the exam."
                            type="warning"
                            showIcon
                            className="mb-4"
                        />
                    )}

                    <div className="text-sm text-[#3D441A]/80 mb-4">
                        Question {currentQuestion + 1} of {totalQuestions}
                    </div>
                    {parsedQuestions && parsedQuestions[currentQuestion] && (
                        <div className="mb-6 p-6 border-2 border-[#3D441A] rounded-lg bg-[#FFFDD0] shadow-sm">
                            <h3 className="text-xl font-semibold text-[#3D441A] mb-6">
                                {parsedQuestions[currentQuestion].questionText}
                            </h3>

                            <div className="space-y-3 w-full">
                                {parsedQuestions[currentQuestion].options.map((option, optionIndex) => (
                                    <div
                                        key={optionIndex}
                                        className={`w-full text-left flex items-center border-2 rounded-lg transition-all duration-200 p-4 cursor-pointer ${answers[currentQuestion] === optionIndex
                                                ? 'bg-[#3D441A] border-[#3D441A] text-[#FFFDD0]'
                                                : 'bg-[#FFFDD0] border-[#3D441A] text-[#3D441A] hover:bg-[#3D441A] hover:text-[#FFFDD0]'
                                            }`}
                                        onClick={() => handleAnswerSelect(optionIndex)}
                                    >
                                        <div className={`w-6 h-6 rounded-full border-2 mr-3 flex items-center justify-center ${answers[currentQuestion] === optionIndex
                                                ? 'bg-[#FFFDD0] border-[#FFFDD0]'
                                                : 'border-[#3D441A]'
                                            }`}>
                                            {answers[currentQuestion] === optionIndex && (
                                                <svg className="w-3 h-3 text-[#3D441A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                                </svg>
                                            )}
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <span className="font-semibold min-w-6">
                                                {getOptionLetter(optionIndex)}.
                                            </span>
                                            <span className="font-medium text-base text-left flex-1">
                                                {option}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {isCurrentQuestionAnswered && (
                                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                                    <p className="text-green-700 text-sm">
                                        <strong>Selected:</strong> Option {getOptionLetter(answers[currentQuestion])}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

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
                                    <span className="flex items-center cursor-not-allowed gap-2">
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

                    <div className="mt-4 text-center">
                        <div className="text-sm text-[#3D441A]/80">
                            Answered: {answers.filter(a => a !== -1).length} / {totalQuestions}
                        </div>
                    </div>

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