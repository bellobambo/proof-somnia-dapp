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
    <div className="min-h-screen bg-[#3D441A]">
      {/* Reduced min-h from 80vh to 60vh and added pt-16 for top padding */}
      <main className="flex flex-col items-center justify-start min-h-[60vh] pt-16 px-4 sm:px-6 lg:px-8">
        {!isConnected ? (
          <div className="text-center space-y-6">
            <WalletConnect />
          </div>
        ) : (
          <div className="w-full max-w-7xl space-y-8">
            {registrationLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-2 text-gray-600">Checking registration status...</p>
              </div>
            ) : !isRegistered ? (
              <UserRegistration />
            ) : (
              <div>
                <h2 className="text-2xl font-semibold text-[#FFFDD0] mb-6">
                  Available Courses
                </h2>
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