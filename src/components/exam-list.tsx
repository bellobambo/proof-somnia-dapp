'use client'

import { useGetExam, useIsExamActive } from '@/hooks/useContract'
import Link from 'next/link'

interface ExamListProps {
  examIds: bigint[]
}

function ExamCard({ examId }: { examId: bigint }) {
  const { data: exam, isLoading } = useGetExam(examId)
  const { data: isActive } = useIsExamActive(examId)

  if (isLoading || !exam) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
      </div>
    )
  }

  const scheduledDate = new Date(Number(exam.scheduledDateTime) * 1000)
  const now = new Date()
  const isScheduled = scheduledDate > now

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{exam.title}</h3>
      <div className="space-y-2 mb-4">
        <p className="text-sm text-gray-600">
          Scheduled: {scheduledDate.toLocaleString()}
        </p>
        <p className="text-sm text-gray-600">
          Duration: {exam.durationMinutes.toString()} minutes
        </p>
        <p className="text-sm text-gray-600">
          Questions: {exam.questionCount.toString()}
        </p>
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {isActive ? 'Active' : 'Inactive'}
          </span>
          {isScheduled && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Scheduled
            </span>
          )}
        </div>
      </div>
      
      <Link
        href={`/exam/${examId}`}
        className={`inline-block px-4 py-2 rounded-md text-white transition-colors ${
          isActive && !isScheduled
            ? 'bg-blue-500 hover:bg-blue-600'
            : 'bg-gray-400 cursor-not-allowed'
        }`}
      >
        {isActive && !isScheduled ? 'Take Exam' : 'View Exam'}
      </Link>
    </div>
  )
}

export function ExamList({ examIds }: ExamListProps) {
  if (examIds.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No exams available for this course yet.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {examIds.map((examId) => (
        <ExamCard key={examId.toString()} examId={examId} />
      ))}
    </div>
  )
}