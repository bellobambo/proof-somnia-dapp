'use client'

import { useAccount } from 'wagmi'
import { motion } from 'framer-motion'
import { useGetUser, UserRole } from '@/hooks/useContract'

export function UserStatus() {
  const { address, isConnected } = useAccount()
  const { data: user, isLoading, error } = useGetUser(address as `0x${string}`)

  if (!isConnected) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#FFFDD0] border border-[#3D441A]/20 rounded-lg p-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <div>
            <p className="text-sm font-medium text-[#3D441A]">Wallet Not Connected</p>
            <p className="text-xs text-[#3D441A]/70">Please connect your wallet to view your status</p>
          </div>
        </div>
      </motion.div>
    )
  }

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#FFFDD0] border border-[#3D441A]/20 rounded-lg p-4"
      >
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-4 h-4 border-2 border-[#3D441A] border-t-transparent rounded-full"
          ></motion.div>
          <div>
            <p className="text-sm font-medium text-[#3D441A]">Loading User Data...</p>
            <p className="text-xs text-[#3D441A]/70">Checking registration status</p>
          </div>
        </div>
      </motion.div>
    )
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-red-100 border border-red-300 rounded-lg p-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <div>
            <p className="text-sm font-medium text-red-800">Error Loading User</p>
            <p className="text-xs text-red-600">Failed to fetch user data</p>
          </div>
        </div>
      </motion.div>
    )
  }

  if (!user?.isRegistered) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#FFFDD0] border border-[#3D441A]/20 rounded-lg p-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <div>
            <p className="text-sm font-medium text-[#3D441A]">Not Registered</p>
            <p className="text-xs text-[#3D441A]/70">You need to register to access courses</p>
          </div>
        </div>
      </motion.div>
    )
  }

  const isTutor = user.role === UserRole.TUTOR // TUTOR = 0
  console.log("User role:", user.role)
  const roleColor = isTutor ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
  const roleIcon = isTutor ? '👨‍🏫' : '👨‍🎓'

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#FFFDD0] border border-[#3D441A]/20 rounded-lg p-4"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className={`w-3 h-3 mt-1 ${isTutor ? 'bg-purple-500' : 'bg-green-500'} rounded-full`}></div>
          <div>
            <p className="text-sm font-medium text-[#3D441A]">{user.name}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${roleColor}`}>
                <span>{roleIcon}</span>
                {isTutor ? 'TUTOR' : 'STUDENT'}
              </span>
              {/* <span className="text-xs text-[#3D441A]/70">
                Registered {new Date(Number(user.registrationTimestamp) * 1000).toLocaleDateString()}
              </span> */}
            </div>
          </div>
        </div>

        <div className="text-right">
          <p className="text-xs text-[#3D441A]/60 font-mono">
            {address?.slice(0, 6)}...{address?.slice(-4)}
          </p>
          <p className="text-xs text-[#3D441A]/40">Connected</p>
        </div>
      </div>
    </motion.div>
  )
}

// Compact version for headers/navbars
export function UserStatusCompact() {
  const { address, isConnected } = useAccount()
  const { data: user, isLoading } = useGetUser(address as `0x${string}`)

  if (!isConnected) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-[#FFFDD0] rounded-lg border border-[#3D441A]/20">
        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
        <span className="text-sm text-[#3D441A]">Not Connected</span>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-start gap-2 px-3 py-2 bg-[#FFFDD0] rounded-lg border border-[#3D441A]/20">
        <span className="text-sm text-[#3D441A]">Loading...</span>
      </div>
    )
  }

  if (!user?.isRegistered) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-[#FFFDD0] rounded-lg border border-[#3D441A]/20">
        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
        <span className="text-sm text-[#3D441A]">Not Registered</span>
      </div>
    )
  }

  const isTutor = user.role === UserRole.TUTOR // TUTOR = 0
  console.log("User role:", user.role)
  const roleIcon = isTutor ? '👨‍🏫' : '👨‍🎓'

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-[#FFFDD0] rounded-lg border border-[#3D441A]/20">
      <div className={`w-2 h-2 ${isTutor ? 'bg-purple-500' : 'bg-green-500'} rounded-full`}></div>
      <span className="text-sm font-medium text-[#3D441A]">{user.name}</span>
      <span className="text-xs bg-[#3D441A] text-[#FFFDD0] px-2 py-1 rounded-full">
        {roleIcon} {isTutor ? 'TUTOR' : 'STUDENT'}
      </span>
    </div>
  )
}