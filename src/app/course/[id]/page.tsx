'use client'

import { useParams } from 'next/navigation'
import { useGetCourse, useGetExamsForCourse } from '@/hooks/useContract'
import { ExamList } from '@/components/exam-list'
import Link from 'next/link'

export default function CoursePage() {
  const params = useParams()
  const courseId = BigInt(params.id as string)

  const { data: course, isLoading: courseLoading } = useGetCourse(courseId)
  const { data: examIds, isLoading: examsLoading } = useGetExamsForCourse(courseId)

  if (courseLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading course...</p>
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Course Not Found</h2>
          <Link href="/" className="text-blue-500 hover:text-blue-600">
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-6">
            <Link href="/" className="text-blue-500 hover:text-blue-600 mr-4">
              ← Back to Courses
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>
              <p className="text-gray-600">
                Tutor: {course.tutor.slice(0, 6)}...{course.tutor.slice(-4)}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Course Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Course ID</p>
              <p className="font-medium">{course.courseId.toString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Created</p>
              <p className="font-medium">
                {new Date(Number(course.creationTimestamp) * 1000).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${course.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                {course.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Exams</h2>
          {examsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading exams...</p>
            </div>
          ) : (
            <ExamList examIds={examIds ? [...examIds] : []} />
          )}
        </div>
      </main>
    </div>
  )
}