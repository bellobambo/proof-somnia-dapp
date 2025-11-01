'use client'

import { useGetAvailableExamsForStudent, useGetAllCourses, useGetAllExams, useGetUser, UserRole, Exam } from '@/hooks/useContract'
import { useAccount } from 'wagmi'
import { motion } from 'framer-motion'
import { useState, useMemo } from 'react'
import Link from 'next/link'

export default function ExamsList() {
  const { address, isConnected } = useAccount()
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all')

  // Only fetch user data if address exists
  const { data: user } = useGetUser(address as `0x${string}`)
  
  const isTutor = user?.role === UserRole.TUTOR

  // For students: use the optimized function
  const { data: studentExams, isLoading: studentLoading, isError: studentError, error: studentErrorMsg } = 
    useGetAvailableExamsForStudent(address as `0x${string}`, {
      query: {
        enabled: !!address && !isTutor,
      }
    })

  // For tutors: fetch all exams and filter by creator
  const { data: allExams, isLoading: allExamsLoading } = useGetAllExams()

  // Get tutor's exams
  const tutorExams = useMemo(() => {
    if (!allExams || !address || !isTutor) return []
    return allExams.filter(exam => 
      exam.creator.toLowerCase() === address.toLowerCase()
    )
  }, [allExams, address, isTutor])

  // Use the appropriate data based on role
  const exams = isTutor ? tutorExams : studentExams
  const isLoading = isTutor ? allExamsLoading : studentLoading
  const isError = !isTutor && studentError
  const error = studentErrorMsg

  // Console logs for debugging
  console.log('🔍 ExamsList Debug:', {
    address,
    isConnected,
    user,
    isTutor,
    studentExams,
    tutorExams,
    allExams,
    isLoading,
    isError,
    error,
  })

  // Filter exams based on selected filter
  const filteredExams = useMemo(() => {
    if (!exams) return []
    
    const examsList = exams as readonly Exam[]

    switch (filter) {
      case 'active':
        return examsList.filter(exam => exam.isActive)
      case 'inactive':
        return examsList.filter(exam => !exam.isActive)
      default:
        return examsList
    }
  }, [exams, filter])

  // Handle not connected state
  if (!isConnected || !address) {
    return (
      <div className="min-h-screen bg-linear-to-br from-[#3D441A] via-[#4A5320] to-[#3D441A] flex items-center justify-center p-4">
        <div className="bg-[#FFFDD0] rounded-xl shadow-lg p-8 max-w-md text-center">
          <h3 className="text-2xl font-bold text-[#3D441A] mb-4">Wallet Not Connected</h3>
          <p className="text-[#3D441A]/80 mb-6">Please connect your wallet to view exams.</p>
          <Link
            href="/"
            className="inline-block bg-[#3D441A] text-[#FFFDD0] py-2 px-6 rounded-lg hover:bg-[#3D441A]/90 transition-colors font-medium"
          >
            Go Back Home
          </Link>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-[#3D441A] via-[#4A5320] to-[#3D441A] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="rounded-full h-16 w-16 border-b-4 border-[#FFFDD0]"
        />
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

  const examsList = filteredExams

  return (
    <div className="min-h-screen bg-linear-to-br from-[#3D441A] via-[#4A5320] to-[#3D441A] py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-[#FFFDD0]"
          >
            {isTutor ? 'My Exams' : 'Available Exams'}
          </motion.h1>
          
          <Link
            href="/"
            className="text-[#FFFDD0] hover:underline flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Courses
          </Link>
        </div>

        {/* Role Badge */}
        <div className="mb-6">
          <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-[#FFFDD0]/20 text-[#FFFDD0] border border-[#FFFDD0]/30">
            {isTutor ? '👨‍🏫 Tutor View' : '👨‍🎓 Student View'}
          </span>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-4 mb-8 flex-wrap">
          {['all', 'active', 'inactive'].map((filterType) => (
            <motion.button
              key={filterType}
              onClick={() => setFilter(filterType as typeof filter)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`py-2 px-6 rounded-lg font-semibold capitalize transition-all ${
                filter === filterType
                  ? 'bg-[#FFFDD0] text-[#3D441A]'
                  : 'bg-[#3D441A]/50 text-[#FFFDD0] border border-[#FFFDD0]/30'
              }`}
            >
              {filterType}
            </motion.button>
          ))}
        </div>

        {/* Exams Count */}
        <p className="text-[#FFFDD0]/80 mb-6">
          Showing {examsList.length} exam{examsList.length !== 1 ? 's' : ''}
          {isTutor && ' you created'}
          {!isTutor && ' from your enrolled courses'}
        </p>

        {/* Exams Grid */}
        {examsList.length === 0 ? (
          <div className="text-center py-12">
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
              <motion.div
                key={exam.examId.toString()}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-[#FFFDD0] rounded-xl shadow-lg p-6 border border-[#3D441A]/10"
              >
                {/* Status Badge */}
                <div className="flex justify-between items-start mb-3">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    exam.isActive
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-400 text-white'
                  }`}>
                    {exam.isActive ? 'Active' : 'Inactive'}
                  </span>
                  
                  {isTutor && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-500 text-white">
                      Your Exam
                    </span>
                  )}
                </div>

                {/* Exam Details */}
                <h3 className="text-xl font-semibold text-[#3D441A] mb-3">
                  {exam.title}
                </h3>

                <div className="space-y-2 text-sm text-[#3D441A]/80">
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

                {/* Action Buttons */}
                <div className="mt-4 flex gap-2">
                  <Link
                    href={`/exam/${exam.examId}`}
                    className="flex-1 bg-[#3D441A] text-[#FFFDD0] py-2 px-4 rounded-lg hover:bg-[#3D441A]/90 transition-colors text-center font-medium"
                  >
                    View Details
                  </Link>
                  
                  {!isTutor && exam.isActive && (
                    <Link
                      href={`/exam/${exam.examId}/take`}
                      className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors text-center font-medium"
                    >
                      Take Exam
                    </Link>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}