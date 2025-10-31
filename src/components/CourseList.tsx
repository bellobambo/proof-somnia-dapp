'use client'

import { useAccount } from 'wagmi'
import { useEnrollInCourse, useGetStudentEnrollments, useGetUser, UserRole } from '@/hooks/useContract'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { CourseCreationForm } from './CourseCreationForm'
import { motion } from 'framer-motion'
import { CreateExamDrawer } from './CreateExamForm'
import { AddQuestionsDrawer } from './AddQuestionsDrawer'

interface CourseListProps {
  courses: readonly any[]
}

export function CourseList({ courses }: CourseListProps) {
  const { address } = useAccount()
  const { data: user } = useGetUser(address as `0x${string}`)
  const { data: enrollments } = useGetStudentEnrollments(address as `0x${string}`)
  const { enrollInCourse, isPending, isConfirming } = useEnrollInCourse()
  const [enrollingCourse, setEnrollingCourse] = useState<bigint | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)

  const [showCreateExam, setShowCreateExam] = useState(false)
  const [showAddQuestions, setShowAddQuestions] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<bigint | null>(null)
  const [selectedExam, setSelectedExam] = useState<any | null>(null)

  useEffect(() => {
    console.log('🎯 CourseList Debug:', {
      showCreateExam,
      selectedCourse: selectedCourse?.toString(),
      coursesCount: courses?.length,
      courses: courses.map(c => ({
        courseId: c.courseId?.toString(),
        title: c.title
      }))
    })
  }, [showCreateExam, selectedCourse, courses])

  const handleEnroll = async (courseId: bigint) => {
    setEnrollingCourse(courseId)
    enrollInCourse(courseId)
  }

  const isEnrolled = (courseId: bigint) => {
    return enrollments?.some(id => id === courseId) || false
  }

  const isTutor = user?.role === UserRole.TUTOR

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

          <motion.a
            href='/exams'
            className="cursor-pointer text-[#FFFDD0] py-2 px-6 underline transition-all font-semibold flex items-center gap-2 text-lg"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            Exams
          </motion.a>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 mt-20 lg:grid-cols-3 gap-6">
        {courses.map((course, index) => (
          <motion.div
            key={course.courseId.toString()}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-[#FFFDD0] rounded-xl shadow-lg p-6 border border-[#3D441A]/10"
          >
            <h3 className="text-xl font-semibold text-[#3D441A] mb-2">{course.title}</h3>
            <p className="text-sm text-[#3D441A]/80 mb-2">
              Tutor: {course.tutor.slice(0, 6)}...{course.tutor.slice(-4)}
            </p>
            <p className="text-sm text-[#3D441A]/60 mb-4">
              Created: {new Date(Number(course.creationTimestamp) * 1000).toLocaleDateString()}
            </p>

            <div className="flex flex-col gap-2">
              {isEnrolled(course.courseId) ? (
                <div className="space-y-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[#3D441A] text-[#FFFDD0]">
                    Enrolled
                  </span>
                  <Link
                    href={`/course/${course.courseId}`}
                    className="w-full bg-[#3D441A] text-[#FFFDD0] py-2 px-4 rounded-lg hover:bg-[#3D441A]/90 transition-colors text-center block font-medium"
                  >
                    View Course
                  </Link>
                </div>
              ) : (
                <>
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

                  {isTutor && address?.toLowerCase() === course.tutor.toLowerCase() && (
                    <div className="flex gap-2 mt-3">
                      <motion.button
                        onClick={() => {
                          console.log('🎯 Create Exam clicked for course:', {
                            courseId: course.courseId.toString(),
                            courseTitle: course.title,
                            selectedCourseBefore: selectedCourse?.toString()
                          })
                          setSelectedCourse(course.courseId)
                          setShowCreateExam(true)
                        }}
                        whileHover={{ scale: 1.05 }}
                        className="bg-[#3D441A] cursor-pointer text-[#FFFDD0] py-2 px-4 rounded-lg font-medium w-1/2"
                      >
                        Create Exam
                      </motion.button>

                      <motion.button
                        onClick={() => {
                          setSelectedExam(course.courseId)
                          setShowAddQuestions(true)
                        }}
                        whileHover={{ scale: 1.05 }}
                        className=" text-[#3D441A] cursor-not-allowed border-2 border-[#3D441A] py-2 px-4 rounded-lg font-medium w-1/2"
                      >
                        + Add Questions
                      </motion.button>
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        ))}
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
        onClose={() => {
          console.log('🔙 Closing CreateExamDrawer')
          setShowCreateExam(false)
          setSelectedCourse(null)
        }}
        courseId={selectedCourse}
        courses={courses}
      />

      {/* <AddQuestionsDrawer
        open={showAddQuestions}
        onClose={() => {
          setShowAddQuestions(false)
          setSelectedExam(null)
        }}
        examId={selectedExam}
        courses={courses}
      /> */}
    </div>
  )
}