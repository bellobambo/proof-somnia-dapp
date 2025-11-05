'use client'

import {
  useGetAvailableExamsForStudent,
  useGetAllExams,
  useGetUser,
  useHasCompletedExam,
  useGetStudentExamScore,
  useGetExamsWithStatusForStudent,
  parseExamScore,
  parseExamsWithStatus,
  calculatePercentageScore,
  getGradeLetter,
  UserRole,
  Exam,
  ExamWithStatus
} from '@/hooks/useContract'
import { useAccount } from 'wagmi'
import { motion } from 'framer-motion'
import { useState, useMemo } from 'react'
import Link from 'next/link'
import ExamDrawer from './ExamDrawer'

export default function ExamsList() {
  const { address, isConnected } = useAccount()
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null)
  const [isExamDrawerOpen, setIsExamDrawerOpen] = useState(false)

  const { data: user } = useGetUser(address as `0x${string}`)
  const isTutor = user?.role === UserRole.TUTOR

  const { data: examsWithStatusData, isLoading: studentLoading, isError: studentError, error: studentErrorMsg } =
    useGetExamsWithStatusForStudent(address as `0x${string}`, {
      query: {
        enabled: !!address && !isTutor,
      }
    })

  const examsWithStatus = useMemo(() => {
    return parseExamsWithStatus(examsWithStatusData) || []
  }, [examsWithStatusData])

  const studentExams = useMemo(() => {
    return examsWithStatus.map(item => item.exam)
  }, [examsWithStatus])

  const { data: allExams, isLoading: allExamsLoading } = useGetAllExams()

  const tutorExams = useMemo(() => {
    if (!allExams || !address || !isTutor) return []
    return allExams.filter(exam =>
      exam.creator.toLowerCase() === address.toLowerCase()
    )
  }, [allExams, address, isTutor])

  const exams = isTutor ? tutorExams : studentExams
  const isLoading = isTutor ? allExamsLoading : studentLoading
  const isError = !isTutor && studentError
  const error = studentErrorMsg

  const handleExamCompleted = (score: number, totalQuestions: number) => {
    console.log(`Exam completed! Score: ${score}/${totalQuestions}`)
    window.location.reload()
  }

  const ExamCard = ({ exam, index }: { exam: Exam; index: number }) => {
    const examStatus = useMemo(() => {
      if (isTutor) return null
      return examsWithStatus.find(item => 
        item.exam.examId.toString() === exam.examId.toString()
      )
    }, [examsWithStatus, exam.examId, isTutor])

    const { data: examScoreData, isLoading: scoreLoading, error: scoreError } = useGetStudentExamScore(
      exam.examId,
      !isTutor ? (address as `0x${string}`) : undefined,
      {
        query: {
          enabled: !isTutor && !!address && !examStatus,
        }
      }
    )

    const examScore = parseExamScore(examScoreData)

    const isCompleted = examStatus?.completionStatus || examScore?.isCompleted || false
    const rawScore = examStatus?.score || examScore?.rawScore || BigInt(0)

    const totalQuestions = Number(exam.questionCount)

    const scorePercentage = totalQuestions > 0 
      ? calculatePercentageScore(rawScore, BigInt(totalQuestions))
      : 0

    const isLoadingResults = scoreLoading && !examStatus

    console.log('🎯 ExamCard Debug:', {
      examId: exam.examId.toString(),
      examStatus,
      examScoreData,
      examScore,
      rawScore: rawScore.toString(),
      scorePercentage,
      totalQuestions,
      isCompleted,
      isLoadingResults
    })

    const shouldShowScore = isCompleted && totalQuestions > 0

    const getPassStatus = (percentage: number) => {
      if (percentage >= 70) return { label: 'Pass', color: 'bg-green-600' }
      if (percentage >= 50) return { label: 'Average', color: 'bg-yellow-500' }
      return { label: 'Fail', color: 'bg-red-500' }
    }

    const passStatus = shouldShowScore
      ? getPassStatus(scorePercentage)
      : null

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className="bg-[#FFFDD0] rounded-xl shadow-lg p-6 border-2 border-[#3D441A]"
      >
        {/* Status Badges Row */}
        <div className="flex justify-between items-start mb-3 flex-wrap gap-2">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${exam.isActive
            ? 'border-2 border-[#3D441A] text-[#3D441A]'
            : 'bg-gray-400 text-white'
            }`}>
            {exam.isActive ? '✓ Active' : '✗ Inactive'}
          </span>

          {isTutor && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#3D441A] text-[#FFFDD0]">
              👨‍🏫 Your Exam
            </span>
          )}

          {!isTutor && isLoadingResults && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-300 text-gray-600">
              <svg className="animate-spin h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Loading...
            </span>
          )}

          {!isTutor && !isLoadingResults && isCompleted && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#3D441A] text-[#FFFDD0]">
              ✓ Completed
            </span>
          )}

          {!isTutor && !isLoadingResults && !isCompleted && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border-2 border-[#3D441A] text-[#3D441A]">
              📝 Pending
            </span>
          )}
        </div>

        <h3 className="text-xl font-semibold text-[#3D441A] mb-3">
          {exam.title}
        </h3>

        <div className="space-y-2 text-sm text-[#3D441A]/80 mb-4">
          <p>
            <strong>Exam ID:</strong> {exam.examId.toString()}
          </p>
          <p>
            <strong>Course ID:</strong> {exam.courseId.toString()}
          </p>
          <p>
            <strong>Questions:</strong> {exam.questionCount.toString()}
          </p>

          {isTutor && (
            <p className="text-xs break-all">
              <strong>Creator:</strong> {exam.creator.slice(0, 6)}...{exam.creator.slice(-4)}
            </p>
          )}
        </div>

        {!isTutor && shouldShowScore && !isLoadingResults && (
          <div className="bg-linear-to-br from-green-50 to-green-100 border-2 border-green-300 rounded-xl p-4 mt-4 mb-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-green-800 font-semibold text-sm flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Your Score
              </span>
              {passStatus && (
                <span className={`px-2 py-1 rounded-full text-xs font-bold text-white ${passStatus.color}`}>
                  {passStatus.label}
                </span>
              )}
            </div>

            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-4xl font-bold text-green-800">
                {Number(rawScore).toString()}
              </span>
              <span className="text-2xl text-green-600">
                / {totalQuestions}
              </span>
            </div>

            <div className="mt-3">
              <div className="flex items-center justify-between text-xs text-green-700 mb-1">
                <span>Percentage</span>
                <span className="font-semibold">{scorePercentage}%</span>
              </div>
              <div className="w-full bg-green-200 rounded-full h-2.5 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${scorePercentage}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="bg-green-600 h-full rounded-full"
                />
              </div>
              <div className="mt-1 text-xs text-green-600 text-center">
                Grade: {getGradeLetter(scorePercentage)}
              </div>
            </div>
          </div>
        )}

        {!isTutor && !isCompleted && !isLoadingResults && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
            <p className="text-orange-700 text-sm font-medium flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Exam not taken yet
            </p>
          </div>
        )}

        {!isTutor && scoreError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-red-700 text-xs flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Error loading results
            </p>
          </div>
        )}
        {!isTutor && isLoadingResults && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2 text-gray-600 text-sm">
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Loading results...
            </div>
          </div>
        )}

        <div className="space-y-2">
          {!isTutor && exam.isActive && !isCompleted && !isLoadingResults && (
            <motion.button
              onClick={() => {
                setSelectedExam(exam)
                setIsExamDrawerOpen(true)
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full border-2 cursor-pointer py-3 px-4 rounded-lg transition-all duration-200 border-[#3D441A] text-[#3D441A] hover:bg-[#3D441A] hover:text-[#FFFDD0] font-medium flex items-center justify-center gap-2 shadow-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Take Exam
            </motion.button>
          )}

   
          {!isTutor && exam.isActive && isCompleted && !isLoadingResults && (
            <div className="text-center text-xs text-gray-500 mt-2">
              ✓ You have completed this exam
            </div>
          )}
        </div>
      </motion.div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-[#3D441A] via-[#4A5320] to-[#3D441A] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#FFFDD0]/40 border-t-[#FFFDD0] mx-auto shadow-md mb-4"></div>
          <p className="text-[#FFFDD0] text-sm">Loading exams...</p>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-linear-to-br from-[#3D441A] via-[#4A5320] to-[#3D441A] flex items-center justify-center p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg max-w-md">
          <h3 className="font-bold mb-2">Error Loading Exams</h3>
          <p className="mb-4">{error?.message || 'Failed to fetch exams'}</p>
          <Link
            href="/"
            className="inline-block bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors text-center font-medium"
          >
            Go Back Home
          </Link>
        </div>
      </div>
    )
  }

  const examsList = exams || []

  return (
    <div className="min-h-screen bg-linear-to-br from-[#3D441A] via-[#4A5320] to-[#3D441A] py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <Link
            href="/"
            className="text-[#FFFDD0] hover:underline flex items-center gap-2 transition-all duration-200 hover:gap-3"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Courses
          </Link>

          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-[#FFFDD0]"
          >
            {isTutor ? 'My Exams' : 'Available Exams'}
          </motion.h1>
        </div>

        <div className="mb-6">
          <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-[#FFFDD0]/20 text-[#FFFDD0] border border-[#FFFDD0]/30">
            {isTutor ? '👨‍🏫 Tutor View' : '👨‍🎓 Student View'}
          </span>
        </div>

        <p className="text-[#FFFDD0]/80 mb-6">
          Showing {examsList.length} exam{examsList.length !== 1 ? 's' : ''}
          {isTutor && ' you created'}
          {!isTutor && ' from your enrolled courses'}
        </p>

        {examsList.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-[#FFFDD0]/10 rounded-full mb-4">
              <svg className="w-10 h-10 text-[#FFFDD0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-[#FFFDD0] text-lg mb-2">No exams found.</p>
            {!isTutor && (
              <p className="text-[#FFFDD0]/70 text-sm">
                Enroll in courses to see available exams
              </p>
            )}
            {isTutor && (
              <p className="text-[#FFFDD0]/70 text-sm">
                Create your first exam to get started
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {examsList.map((exam, index) => (
              <ExamCard key={exam.examId.toString()} exam={exam} index={index} />
            ))}
          </div>
        )}
      </div>

      <ExamDrawer
        exam={selectedExam}
        isOpen={isExamDrawerOpen}
        onClose={() => {
          setIsExamDrawerOpen(false)
          setSelectedExam(null)
        }}
        onExamCompleted={handleExamCompleted}
      />
    </div>
  )
}