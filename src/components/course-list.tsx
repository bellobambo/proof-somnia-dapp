'use client'

import { useAccount } from 'wagmi'
import { useEnrollInCourse, useGetStudentEnrollments } from '@/hooks/useContract'
import { useState } from 'react'
import Link from 'next/link'

interface CourseListProps {
  courses: readonly any[] // Change this to readonly
}

export function CourseList({ courses }: CourseListProps) {
  const { address } = useAccount()
  const { data: enrollments } = useGetStudentEnrollments(address as `0x${string}`)
  const { enrollInCourse, isPending, isConfirming } = useEnrollInCourse()
  const [enrollingCourse, setEnrollingCourse] = useState<bigint | null>(null)

  const handleEnroll = async (courseId: bigint) => {
    setEnrollingCourse(courseId)
    enrollInCourse(courseId)
  }

  const isEnrolled = (courseId: bigint) => {
    return enrollments?.some(id => id === courseId) || false
  }

  if (courses.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No courses available yet.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((course) => (
        <div key={course.courseId.toString()} className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{course.title}</h3>
          <p className="text-sm text-gray-600 mb-2">
            Tutor: {course.tutor.slice(0, 6)}...{course.tutor.slice(-4)}
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Created: {new Date(Number(course.creationTimestamp) * 1000).toLocaleDateString()}
          </p>
          
          <div className="flex flex-col gap-2">
            {isEnrolled(course.courseId) ? (
              <div className="space-y-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  Enrolled
                </span>
                <Link
                  href={`/course/${course.courseId}`}
                  className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors text-center block"
                >
                  View Course
                </Link>
              </div>
            ) : (
              <button
                onClick={() => handleEnroll(course.courseId)}
                disabled={isPending || isConfirming || enrollingCourse === course.courseId}
                className="w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isPending && enrollingCourse === course.courseId ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Enrolling...
                  </span>
                ) : (
                  'Enroll'
                )}
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}