'use client'

import { useAccount } from "wagmi";
import { useGetAllCourses, useIsUserRegistered, useGetUser, useGetExamsForCourse, useGetExam, useStartExam, UserRole } from "@/hooks/useContract";
import { WalletConnect } from "@/components/WalletConnect";
import { UserRegistration } from "@/components/UserRegistration";
import { Button, Card, Skeleton, message } from 'antd'
import { PlayCircleOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import { useRouter } from 'next/navigation'
import { useMemo, useState, useEffect } from 'react'

// Component to render individual exam card
function ExamCard({ examId, userRole }: { examId: bigint; userRole: UserRole }) {
  const { data: exam } = useGetExam(examId)
  const { startExam } = useStartExam()

  const handleStartExam = () => {
    if (userRole === UserRole.STUDENT) {
      startExam(examId)
    } else {
      message.info('Only students can take exams')
    }
  }

  // Format date and time
  const formatDateTime = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) * 1000)
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString()
    }
  }

  if (!exam) {
    return (
      <Card className="bg-[#FFFDD0] shadow-md rounded-2xl p-5 border border-gray-200">
        <Skeleton active />
      </Card>
    )
  }

  const { date, time } = formatDateTime(exam.scheduledDateTime)

  return (
    <div className="bg-[#FFFDD0] shadow-md rounded-2xl p-5 border border-gray-200">
      <h2 className="text-xl font-semibold mb-2 text-gray-800">{exam.title}</h2>
      <div className="space-y-1 text-sm text-gray-600 mb-3">
        <p className="text-gray-700">Date: {date}</p>
        <p className="text-gray-700">Time: {time}</p>
        <p className="text-gray-700">Duration: {Number(exam.durationMinutes)} minutes</p>
        <p className="text-gray-700">Questions: {Number(exam.questionCount)}</p>
      </div>

      {/* Only show take exam button for students */}
      {userRole === UserRole.STUDENT && (
        <Button
          type="primary"
          icon={<PlayCircleOutlined />}
          onClick={handleStartExam}
          block
          className="bg-[#3D441A] border-[#3D441A] hover:bg-[#2D3315] hover:border-[#2D3315] text-white font-semibold"
        >
          Take Exam
        </Button>
      )}
    </div>
  )
}

export default function ExamsPage() {
  const router = useRouter()
  const { address, isConnected } = useAccount();
  const { data: courses, isLoading: coursesLoading } = useGetAllCourses();
  const { data: isRegistered, isLoading: registrationLoading } = useIsUserRegistered(address as `0x${string}`);
  const { data: userData } = useGetUser(address as `0x${string}`)

  // State to store all exam IDs from all courses
  const [allExamIds, setAllExamIds] = useState<bigint[]>([])
  const [examsLoading, setExamsLoading] = useState(true)

  // Fetch all exams from all courses
  useEffect(() => {
    const fetchAllExams = async () => {
      if (!courses || courses.length === 0) {
        setExamsLoading(false)
        return
      }

      setExamsLoading(true)
      const examIds: bigint[] = []

      // We'll need to fetch exams for each course
      // This is a simplified approach - in a real app, you might want to use Promise.all
      // or implement a more efficient batch fetching strategy
      try {
        for (const course of courses) {
          // This would need to be implemented to actually fetch exams for each course
          // For now, we'll simulate the data structure
          const courseExamIds = await Promise.resolve([]) // Replace with actual fetch
          examIds.push(...courseExamIds)
        }
        
        setAllExamIds(examIds)
      } catch (error) {
        console.error('Error fetching exams:', error)
      } finally {
        setExamsLoading(false)
      }
    }

    fetchAllExams()
  }, [courses])

  const handleBack = () => {
    router.back()
  }

  return (
    <div className="min-h-screen bg-[#3D441A]">
      <main className="flex flex-col items-center justify-start min-h-[60vh] pt-16 px-4 sm:px-6 lg:px-8">
        {!isConnected ? (
          <div className="text-center space-y-6">
            <WalletConnect />
          </div>
        ) : (
          <div className="w-full max-w-7xl space-y-8">
            {registrationLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#FFFDD0]/40 border-t-[#FFFDD0] mx-auto shadow-md"></div>
                <p className="mt-2 text-[#FFFDD0]">Checking registration status...</p>
              </div>
            ) : !isRegistered ? (
              <UserRegistration />
            ) : (
              <div className="w-full">
                {/* Back button and header */}
                <div className="flex items-center mb-8">
                  <Button
                    type="text"
                    icon={<ArrowLeftOutlined />}
                    onClick={handleBack}
                    className="text-[#FFFDD0] hover:text-[#FFFDD0]/80 hover:bg-[#FFFDD0]/10 mr-4 flex items-center"
                  >
                    Back
                  </Button>
                  <h2 className="text-2xl font-semibold text-[#FFFDD0]">
                    All Available Exams
                  </h2>
                </div>

                {coursesLoading || examsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#FFFDD0]/40 border-t-[#FFFDD0] mx-auto shadow-md"></div>
                    <p className="mt-2 text-[#FFFDD0]">Loading exams...</p>
                  </div>
                ) : (
                  <div>
                    {allExamIds.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {allExamIds.map((examId: bigint) => (
                          <ExamCard 
                            key={examId.toString()} 
                            examId={examId} 
                            userRole={userData?.role || UserRole.STUDENT} 
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <p className="text-[#FFFDD0] text-lg">No exams available at the moment.</p>
                        <p className="text-[#FFFDD0]/80 mt-2">Check back later for new exams.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}