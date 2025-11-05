'use client'

import { useState, useEffect, useMemo } from 'react'
import { Drawer, Progress, Button, Card, Alert } from 'antd'
import {
    TrophyOutlined,
    EyeOutlined
} from '@ant-design/icons'
import {
    useGetExamQuestions,
    useGetExamCorrectAnswers,
    Exam,
    parseExamQuestions,
    useGetStudentExamScore,
    parseExamScore,
    calculatePercentageScore,
    getGradeLetter,
    useGetExamResults,
    parseExamResults,
    useGetExamAnswersComparison,
    parseExamAnswersComparison
} from '@/hooks/useContract'
import { useAccount } from 'wagmi'

interface PastQuestionsDrawerProps {
    exam: Exam | null
    isOpen: boolean
    onClose: () => void
}

export default function PastQuestionsDrawer({ exam, isOpen, onClose }: PastQuestionsDrawerProps) {
    const { address } = useAccount()
    const [currentQuestion, setCurrentQuestion] = useState(0)
    const [showAnswers, setShowAnswers] = useState(false)

    // Get questions and correct answers
    const { data: questionsData } = useGetExamQuestions(exam?.examId || BigInt(0))
    const { data: correctAnswersData } = useGetExamCorrectAnswers(exam?.examId || BigInt(0))

    // Get student's previous answers and score
    const { data: examScoreData } = useGetStudentExamScore(
        exam?.examId || BigInt(0),
        address as `0x${string}`
    )

    // Get student's actual answers from exam results
    const { data: examResultsData } = useGetExamResults(
        exam?.examId || BigInt(0),
        address
    )

    // Alternative: Get answers comparison
    const { data: answersComparisonData } = useGetExamAnswersComparison(
        exam?.examId || BigInt(0),
        address
    )

    const parsedQuestions = useMemo(() =>
        parseExamQuestions(questionsData, correctAnswersData),
        [questionsData, correctAnswersData]
    )

    const examScore = parseExamScore(examScoreData)
    const examResults = parseExamResults(examResultsData)
    const answersComparison = parseExamAnswersComparison(answersComparisonData)

    // Get student answers from either source
    const studentAnswers = useMemo(() => {
        // First try exam results
        if (examResults?.answers && examResults.answers.length > 0) {
            return examResults.answers.map(answer => Number(answer))
        }
        // Then try answers comparison
        if (answersComparison?.studentAnswers && answersComparison.studentAnswers.length > 0) {
            return answersComparison.studentAnswers.map(answer => Number(answer))
        }
        return null
    }, [examResults, answersComparison])

    // Reset state when exam changes
    useEffect(() => {
        if (exam && parsedQuestions) {
            setCurrentQuestion(0)
            setShowAnswers(false)
        }
    }, [exam, parsedQuestions])

    const totalQuestions = parsedQuestions?.length || 0
    const progress = totalQuestions > 0 ? ((currentQuestion + 1) / totalQuestions) * 100 : 0

    const handleNext = () => {
        if (currentQuestion < totalQuestions - 1) {
            setCurrentQuestion(currentQuestion + 1)
            setShowAnswers(false)
        }
    }

    const handlePrevious = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(currentQuestion - 1)
            setShowAnswers(false)
        }
    }

    const getOptionLetter = (index: number) => String.fromCharCode(65 + index)

    const scorePercentage = examScore && totalQuestions > 0
        ? calculatePercentageScore(examScore.rawScore, BigInt(totalQuestions))
        : 0

    const gradeLetter = examScore ? getGradeLetter(scorePercentage) : ''

    // Check if we have student answers data
    const hasStudentAnswers = studentAnswers !== null && studentAnswers.length === totalQuestions

    return (
        <Drawer
            title={
                <div className="flex justify-between items-center w-full">
                    <div className="flex items-center flex-1">
                        <span className="text-xl font-bold text-[#FFFDD0]">
                            {exam?.title || 'Past Questions'} - Review
                        </span>
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
                    </div>
                    <button
                        onClick={onClose}
                        className="ml-4 p-2 rounded-lg transition-all duration-200 hover:bg-[#FFFDD0]/20"
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
            <div className="max-w-2xl mx-auto">
                {/* Score Summary */}
                {examScore && (
                    <Card
                        className="mb-6 border-2 border-[#3D441A] shadow-sm"
                        styles={{
                            body: {
                                background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                                padding: '20px'
                            }
                        }}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-[#3D441A] mb-2">
                                    Your Previous Attempt
                                </h3>
                                <div className="flex items-baseline gap-4">
                                    <div className="text-3xl font-bold text-[#3D441A]">
                                        {Number(examScore.rawScore)} / {totalQuestions}
                                    </div>
                                    <div className="text-lg text-[#3D441A]/80">
                                        {scorePercentage}% • Grade: {gradeLetter}
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="inline-flex items-center px-3 py-1 rounded-full bg-[#3D441A] text-[#FFFDD0] text-sm font-medium">
                                    <TrophyOutlined className="mr-1" />
                                    Completed
                                </div>
                            </div>
                        </div>
                    </Card>
                )}

                <Alert
                    message="Review Mode"
                    description="You are viewing past questions. Submission is disabled for completed exams."
                    // type="info"
                    
                    className="mb-6"
                    style={{
                        backgroundColor: "transparent",
                        border: "3px solid #3D441A",
                    }}
                />

                <div
                    className='h-10'
                ></div>
                <div className="text-sm text-[#3D441A]/80 mb-4">
                    Question {currentQuestion + 1} of {totalQuestions}
                </div>

                {parsedQuestions && parsedQuestions[currentQuestion] && (
                    <div className="mb-6 p-6 border-2 border-[#3D441A] rounded-lg bg-[#FFFDD0] shadow-sm">
                        <h3 className="text-xl font-semibold text-[#3D441A] mb-6">
                            {parsedQuestions[currentQuestion].questionText}
                        </h3>

                        <div className="space-y-3 w-full">
                            {parsedQuestions[currentQuestion].options.map((option, optionIndex) => {
                                const isCorrect = parsedQuestions[currentQuestion].correctAnswer === optionIndex
                                const isSelected = hasStudentAnswers && studentAnswers[currentQuestion] === optionIndex

                                let optionStyle = 'bg-[#FFFDD0] border-[#3D441A] text-[#3D441A]'

                                if (showAnswers) {
                                    if (isCorrect) {
                                        optionStyle = 'bg-green-100 border-green-500 text-green-800'
                                    } else if (isSelected && !isCorrect) {
                                        optionStyle = 'bg-red-100 border-red-500 text-red-800'
                                    }
                                } else if (isSelected) {
                                    optionStyle = 'bg-blue-100 border-blue-500 text-blue-800'
                                }

                                return (
                                    <div
                                        key={optionIndex}
                                        className={`w-full text-left flex items-center border-2 rounded-lg transition-all duration-200 p-4 ${optionStyle}`}
                                    >
                                        <div className={`w-6 h-6 rounded-full border-2 mr-3 flex items-center justify-center ${isSelected ? 'bg-[#3D441A] border-[#3D441A]' : 'border-current'
                                            }`}>
                                            {isSelected && (
                                                <svg className="w-3 h-3 text-[#FFFDD0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                                            {showAnswers && isCorrect && (
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-green-500 text-white ml-2">
                                                    Correct
                                                </span>
                                            )}
                                            {showAnswers && isSelected && !isCorrect && (
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-red-500 text-white ml-2">
                                                    Your Answer
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>


                        {showAnswers && (
                            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                                <p className="text-green-700 font-medium">
                                    Correct Answer: Option {getOptionLetter(parsedQuestions[currentQuestion].correctAnswer)}
                                </p>
                                {hasStudentAnswers && studentAnswers[currentQuestion] !== undefined && (
                                    <p className="text-green-600 text-sm mt-1">
                                        Your Answer: Option {getOptionLetter(studentAnswers[currentQuestion])}
                                        {parsedQuestions[currentQuestion].correctAnswer === studentAnswers[currentQuestion]
                                            ? ' ✓ Correct'
                                            : ' ✗ Incorrect'
                                        }
                                    </p>
                                )}
                                {!hasStudentAnswers && (
                                    <p className="text-green-600 text-sm mt-1">
                                        Your previous answers are not available for this question.
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                )}

                <div className="flex justify-between pt-6 border-t border-[#3D441A]/30">
                    <Button
                        onClick={handlePrevious}
                        disabled={currentQuestion === 0}
                        className={`border-2 border-[#3D441A] ${currentQuestion === 0
                            ? 'bg-gray-300 border-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-[#FFFDD0] text-[#3D441A] hover:bg-[#3D441A] hover:text-[#FFFDD0]'
                            }`}
                    >
                        Previous
                    </Button>


                    <Button
                        onClick={handleNext}
                        disabled={currentQuestion === totalQuestions - 1}
                        className={`border-2 border-[#3D441A] ${currentQuestion === totalQuestions - 1
                            ? 'bg-gray-300 border-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-[#3D441A] text-[#FFFDD0] hover:bg-[#3D441A]/90'
                            }`}
                    >
                        Next
                    </Button>
                </div>

                <div className="mt-4 text-center text-sm text-[#3D441A]/80">
                    Use this review mode to learn from your previous attempt
                </div>
            </div>
        </Drawer>
    )
}