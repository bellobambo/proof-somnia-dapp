
import ExamsList from "@/components/ExamList"





const page = () => {
  return (
    <div className="min-h-screen bg-linear-to-br from-[#3D441A] via-[#4A5320] to-[#3D441A] p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#FFFDD0] mb-2">
            Exams Dashboard
          </h1>
          <p className="text-[#FFFDD0]/80">
            View and manage all available exams
          </p>
        </div>

        <ExamsList />
        
      </div>
    </div>
  )
}

export default page