'use client'

import { WalletConnect } from "@/components/wallet-connect";
import { useAccount } from "wagmi";
import { useGetAllCourses, useIsUserRegistered } from "@/hooks/useContract";
import { CourseList } from "@/components/course-list";
import { UserRegistration } from "@/components/user-registration";

export default function Home() {
  const { address, isConnected } = useAccount();
  const { data: courses, isLoading: coursesLoading } = useGetAllCourses();
  const { data: isRegistered, isLoading: registrationLoading } = useIsUserRegistered(address as `0x${string}`);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Proof Education</h1>
              <p className="text-gray-600">Decentralized Learning Platform</p>
            </div>
            <WalletConnect />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!isConnected ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Welcome to Proof Education
            </h2>
            <p className="text-gray-600 mb-8">
              Connect your wallet to access courses and take exams on the blockchain
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {registrationLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-2 text-gray-600">Checking registration status...</p>
              </div>
            ) : !isRegistered ? (
              <UserRegistration />
            ) : (
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">Available Courses</h2>
                {coursesLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading courses...</p>
                  </div>
                ) : (
                  <CourseList courses={courses || []} />
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}