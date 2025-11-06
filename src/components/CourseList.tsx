'use client'

import { useAccount } from 'wagmi'
import { useEnrollInCourse, useGetUser, UserRole, useGetAllCourses, useIsEnrolledInCourse } from '@/hooks/useContract'
import { useState, useEffect } from 'react'
import { CourseCreationForm } from './CourseCreationForm'
import { motion } from 'framer-motion'
import { CreateExamDrawer } from './CreateExamForm'
import toast from 'react-hot-toast'

interface CourseListProps {
  courses: readonly any[]
}

function TutorInfo({ tutorAddress }: { tutorAddress: `0x${string}` }) {
  const { data: tutorUser } = useGetUser(tutorAddress)

  return (
    <div className="space-y-1">
      <p className="text-[16px] text-[#3D441A]/80">
        Tutor: {tutorUser?.name || 'Unnamed Tutor'}
      </p>
      <p
        className="text-[15px] text-[#3D441A]/60 font-mono cursor-pointer hover:text-[#3D441A] transition-colors group"
        onClick={() => {
          navigator.clipboard.writeText(tutorAddress)
          toast.success('Address copied to clipboard!')
        }}
        title="Click to copy address"
      >
        Address: {tutorAddress.slice(0, 8)}...{tutorAddress.slice(-6)}
        <svg
          className="w-3 h-3 inline ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      </p>
    </div>
  )
}

export function CourseList({ courses }: CourseListProps) {
  const { address } = useAccount()
  const { data: user } = useGetUser(address as `0x${string}`)
  const { enrollInCourse, isPending, isConfirming, isConfirmed, error } = useEnrollInCourse()
  const [enrollingCourse, setEnrollingCourse] = useState<bigint | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showCreateExam, setShowCreateExam] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<bigint | null>(null)

  useEffect(() => {
    console.log('🎯 CourseList Debug:', {
      showCreateExam,
      selectedCourse: selectedCourse?.toString(),
      coursesCount: courses?.length,
    })
  }, [showCreateExam, selectedCourse, courses])

  const handleEnroll = async (courseId: bigint) => {
    try {
      setEnrollingCourse(courseId)
      await enrollInCourse(courseId)
    } catch (err) {
      console.error('Enrollment error:', err)
      toast.error('Failed to enroll in course')
      setEnrollingCourse(null)
    }
  }

  useEffect(() => {
    if (isConfirmed && enrollingCourse) {
      toast.success('🎉 You have successfully enrolled in this course!')
      setEnrollingCourse(null)
    }
  }, [isConfirmed, enrollingCourse])

  useEffect(() => {
    if (error && enrollingCourse) {
      console.error('Enrollment error:', error)
      toast.error(`Enrollment failed: ${error.message || 'Unknown error'}`)
      setEnrollingCourse(null)
    }
  }, [error, enrollingCourse])

  useEffect(() => {
    if (!isPending && !isConfirming && enrollingCourse) {

      if (!isConfirmed && !error) {
        toast.error('Enrollment transaction completed but not confirmed')
      }
      setTimeout(() => setEnrollingCourse(null), 1000)
    }
  }, [isPending, isConfirming, isConfirmed, error, enrollingCourse])

  const handleCreateExam = (courseId: bigint) => {
    console.log('🎯 Opening Create Exam for course:', {
      courseId: courseId.toString(),
      selectedCourseBefore: selectedCourse?.toString()
    })
    setSelectedCourse(courseId)
    setShowCreateExam(true)
  }

  const handleCloseExamDrawer = () => {
    console.log('🔙 Closing CreateExamDrawer')
    setShowCreateExam(false)
    setTimeout(() => setSelectedCourse(null), 300)
  }

  const isTutor = user?.role === UserRole.TUTOR
  const isStudent = user?.role === UserRole.STUDENT

  const isEnrollingCourse = (courseId: bigint) => {
    return enrollingCourse === courseId && (isPending || isConfirming)
  }

  if (courses.length === 0 && !showCreateForm) {
    return (
      <div className="text-center py-12">
        <p className="text-[#FFFDD0] mb-4">No courses available yet.</p>
        {isTutor && (
          <motion.button
            onClick={() => setShowCreateForm(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-[#FFFDD0] text-[#3D441A] py-2 px-6 rounded-lg hover:bg-[#FFFDD0]/90 transition-colors font-semibold"
          >
            Create First Course
          </motion.button>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {isTutor && (
        <div className="flex justify-between items-center">
          <motion.button
            onClick={() => setShowCreateForm(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-[#FFFDD0] cursor-pointer text-[#3D441A] py-2 px-6 rounded-lg hover:bg-[#FFFDD0]/90 transition-colors font-semibold flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Create New Course
          </motion.button>
        </div>
      )}

      <div className="flex justify-end">
        <motion.a
          href='/exams'
          className="cursor-pointer text-[#FFFDD0] py-2 px-6 underline transition-all font-semibold flex items-center gap-2 text-lg"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          Exams
        </motion.a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 mt-20 lg:grid-cols-3 gap-6">
        {courses.map((course, index) => {
          const { data: isEnrolled } = useIsEnrolledInCourse(
            course.courseId,
            address as `0x${string}`
          )

          return (
            <motion.div
              key={course.courseId.toString()}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-[#FFFDD0] rounded-xl shadow-lg p-6 border border-[#3D441A]/10 min-h-[250px] flex flex-col"
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-xl font-semibold text-[#3D441A] flex-1 pr-2">
                  {course.title}
                </h3>
                {isEnrolled && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[#3D441A] text-[#FFFDD0] whitespace-nowrap">
                    Enrolled
                  </span>
                )}
              </div>

              <div className="space-y-2 mb-4 flex-1">
                <TutorInfo tutorAddress={course.tutor} />

                {course.createdAt && (
                  <p className="text-xs text-[#3D441A]/60">
                    Created: {new Date(course.createdAt).toLocaleDateString()}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2 mt-auto">
                <div className="flex flex-col md:flex-row gap-3 mt-3">
                  <motion.button
                    onClick={() => handleEnroll(course.courseId)}
                    disabled={
                      !isStudent ||
                      isEnrollingCourse(course.courseId) ||
                      isEnrolled
                    }
                    whileHover={!(isEnrollingCourse(course.courseId) || isEnrolled || !isStudent) ? { scale: 1.02 } : {}}
                    whileTap={!(isEnrollingCourse(course.courseId) || isEnrolled || !isStudent) ? { scale: 0.98 } : {}}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-200 
                      ${!isStudent || isEnrolled
                        ? 'bg-gray-400 text-gray-200 cursor-not-allowed opacity-60'
                        : isEnrollingCourse(course.courseId)
                          ? 'bg-gray-500 text-gray-200 cursor-not-allowed'
                          : 'bg-[#3D441A] text-[#FFFDD0] border border-[#3D441A] hover:bg-[#3D441A]/90 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#3D441A] focus:ring-offset-2 focus:ring-offset-[#FFFDD0]'
                      }`}
                  >
                    {isEnrollingCourse(course.courseId) ? (
                      <span className="flex cursor-not-allowed items-center justify-center">
                        Enrolling...
                      </span>
                    ) : isEnrolled ? (
                      'Already Enrolled'
                    ) : (
                      'Enroll'
                    )}
                  </motion.button>

                  {isTutor && address?.toLowerCase() === course.tutor.toLowerCase() && (
                    <motion.button
                      onClick={() => handleCreateExam(course.courseId)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex-1 bg-[#3D441A] cursor-pointer text-[#FFFDD0] py-2 px-4 rounded-lg font-medium transition-all duration-200 hover:bg-[#3D441A]/80"
                    >
                      Create Exam
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {showCreateForm && (
        <div className="fixed inset-0 bg-black/65 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full mx-auto">
            <CourseCreationForm onClose={() => setShowCreateForm(false)} />
          </div>
        </div>
      )}

      <CreateExamDrawer
        open={showCreateExam}
        onClose={handleCloseExamDrawer}
        courseId={selectedCourse}
        courses={courses}
      />
    </div>
  )
}