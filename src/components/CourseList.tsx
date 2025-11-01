'use client'

import { useAccount } from 'wagmi'
import { useEnrollInCourse, useGetUser, UserRole, useGetAllCourses, useIsEnrolledInCourse } from '@/hooks/useContract'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { CourseCreationForm } from './CourseCreationForm'
import { motion } from 'framer-motion'
import { CreateExamDrawer } from './CreateExamForm'

interface CourseListProps {
  courses: readonly any[]
}

export function CourseList({ courses }: CourseListProps) {
  const { address } = useAccount()
  const { data: user } = useGetUser(address as `0x${string}`)
  const { enrollInCourse, isPending, isConfirming } = useEnrollInCourse()
  const [enrollingCourse, setEnrollingCourse] = useState<bigint | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showCreateExam, setShowCreateExam] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<bigint | null>(null)

  // Remove the incorrect enrollments hook
  // const { data: enrollments } = useGetAllCourses()

  useEffect(() => {
    console.log('🎯 CourseList Debug:', {
      showCreateExam,
      selectedCourse: selectedCourse?.toString(),
      coursesCount: courses?.length,
    })
    // console.log('📚 Courses:', courses)
  }, [showCreateExam, selectedCourse, courses])

  const handleEnroll = async (courseId: bigint) => {
    setEnrollingCourse(courseId)
    enrollInCourse(courseId)
  }

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
          className="bg-[#FFFDD0] rounded-xl shadow-lg p-6 border border-[#3D441A]/10 min-h-[230px] flex flex-col" // Increased height
        >
          {/* Course header with title and enrolled tag */}
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

          {/* Course details */}
          <div className="space-y-2 mb-4 flex-1">
            <p className="text-sm text-[#3D441A]/80">
              Tutor: {course.tutor.slice(0, 6)}...{course.tutor.slice(-4)}
            </p>
            
            {/* Display course creation date if available */}
            {course.createdAt && (
              <p className="text-xs text-[#3D441A]/60">
                Created: {new Date(course.createdAt).toLocaleDateString()}
              </p>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-2 mt-auto">
            {isEnrolled ? (
              <div className="space-y-2">
                {/* Show Create Exam button for enrolled tutors who own the course */}
                {isTutor && address?.toLowerCase() === course.tutor.toLowerCase() && (
                  <motion.button
                    onClick={() => handleCreateExam(course.courseId)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full bg-[#3D441A] cursor-pointer text-[#FFFDD0] py-2 px-4 rounded-lg hover:bg-[#3D441A]/90 transition-colors text-center font-medium"
                  >
                    Create Exam
                  </motion.button>
                )}

                {/* Show View Course button for enrolled students */}
                {isStudent && (
                  <Link
                    href={`/course/${course.courseId}`}
                    className="w-full bg-[#3D441A] text-[#FFFDD0] py-2 px-4 rounded-lg hover:bg-[#3D441A]/90 transition-colors text-center block font-medium"
                  >
                    View Course
                  </Link>
                )}
              </div>
            ) : (
              <>
                {/* Show Enroll button for unenrolled students */}
                {isStudent && (
                  <motion.button
                    onClick={() => handleEnroll(course.courseId)}
                    disabled={isPending || isConfirming || enrollingCourse === course.courseId}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-[#3D441A] cursor-pointer text-[#FFFDD0] py-2 px-4 rounded-lg hover:bg-[#3D441A]/90 focus:outline-none focus:ring-2 focus:ring-[#3D441A] focus:ring-offset-2 focus:ring-offset-[#FFFDD0] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
                  >
                    {isPending && enrollingCourse === course.courseId ? (
                      <span className="flex items-center justify-center">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="rounded-full h-4 w-4 border-b-2 border-[#FFFDD0] mr-2"
                        />
                        Enrolling...
                      </span>
                    ) : (
                      'Enroll'
                    )}
                  </motion.button>
                )}

                {/* Show Create Exam button for tutors who own the course */}
                {isTutor && address?.toLowerCase() === course.tutor.toLowerCase() && (
                  <div className="flex gap-2 mt-3">
                    <motion.button
                      onClick={() => handleCreateExam(course.courseId)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-[#3D441A] cursor-pointer text-[#FFFDD0] py-2 px-4 rounded-lg font-medium w-full transition-all duration-200 hover:bg-[#3D441A]/80"
                    >
                      Create Exam
                    </motion.button>
                  </div>
                )}
              </>
            )}
          </div>
        </motion.div>
      )
    })}
  </div>

  {/* Course Creation Modal */}
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