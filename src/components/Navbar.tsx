'use client'

import { useAccount, useDisconnect, useBalance } from 'wagmi'
import { motion } from 'framer-motion'
import { useGetUser, UserRole } from '@/hooks/useContract'
import toast from 'react-hot-toast'

export function UserStatus() {
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const { data: user, isLoading, error } = useGetUser(address as `0x${string}`)
  const { data: balance } = useBalance({
    address: address,
  })

  const copyToClipboard = () => {
    if (address) {
      navigator.clipboard.writeText(address)
      toast.success('Wallet address copied to clipboard!')
    }
  }

  const handleDisconnect = () => {
    disconnect()
    toast.success('Wallet disconnected')
  }

  // Format balance to show 4 decimal places
  const formattedBalance = balance ? parseFloat(balance.formatted).toFixed(4) : '0.0000'

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
            <p className="text-xs text-[#3D441A]/70">Please connect your wallet to Continue</p>
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
          <button
            onClick={handleDisconnect}
            className="ml-auto px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors"
          >
            Disconnect
          </button>
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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <div>
              <p className="text-sm font-medium text-[#3D441A]">Not Registered</p>
              <p className="text-xs text-[#3D441A]/70">You need to register to access courses</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-[#3D441A] font-mono">
                {formattedBalance} STT
              </p>
            </div>
            <button
              onClick={copyToClipboard}
              className="group flex cursor-pointer items-center gap-1 text-xs text-[#3D441A]/60 font-mono hover:text-[#3D441A] transition-colors"
              title="Click to copy wallet address"
            >
              {address?.slice(0, 4)}...{address?.slice(-2)}
            </button>
            <button
              onClick={handleDisconnect}
              className="px-3 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600 transition-colors"
            >
              Disconnect
            </button>
          </div>
        </div>
      </motion.div>
    )
  }

  const isTutor = user.role === UserRole.TUTOR // TUTOR = 0
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
            </div>
          </div>
        </div>

        <div className="text-right flex flex-col items-end gap-2">
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-[#3D441A] font-mono">
                {formattedBalance} STT
              </p>
              <p className="text-xs text-[#3D441A]/60">Balance</p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <button
                onClick={copyToClipboard}
                className="group flex items-center gap-1 text-xs text-[#3D441A]/60 font-mono hover:text-[#3D441A] transition-colors"
                title="Click to copy wallet address"
              >
                {address?.slice(0, 6)}...{address?.slice(-4)}
                <svg
                  className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#3D441A]/40">Connected</span>
                <button
                  onClick={handleDisconnect}
                  className="px-2 py-1.5 bg-[#3D441A] text-[#FFFDD0] text-[14px] rounded-lg cursor-pointer transition-colors"
                >
                  Disconnect
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// Compact version for headers/navbars
export function UserStatusCompact() {
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const { data: user, isLoading } = useGetUser(address as `0x${string}`)
  const { data: balance } = useBalance({
    address: address,
  })

  const copyToClipboard = () => {
    if (address) {
      navigator.clipboard.writeText(address)
      toast.success('Wallet address copied to clipboard!')
    }
  }

  const handleDisconnect = () => {
    disconnect()
    toast.success('Wallet disconnected')
  }

  // Format balance to show 2 decimal places for compact version
  const formattedBalance = balance ? parseFloat(balance.formatted).toFixed(2) : '0.00'

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
      <div className="flex items-center justify-between gap-2 px-3 py-2 bg-[#FFFDD0] rounded-lg border border-[#3D441A]/20">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <span className="text-sm text-[#3D441A]">Not Registered</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-[#3D441A] bg-[#3D441A]/10 px-2 py-1 rounded">
            {formattedBalance} STT
          </span>
          <button
            onClick={copyToClipboard}
            className="group flex cursor-pointer items-center gap-1 text-xs text-[#3D441A]/60 font-mono hover:text-[#3D441A] transition-colors"
            title="Click to copy wallet address"
          >
            {address?.slice(0, 4)}...{address?.slice(-2)}
          </button>
          <button
            onClick={handleDisconnect}
            className="px-2 py-1.5 bg-[#3D441A] text-[#FFFDD0] text-[14px] rounded-lg cursor-pointer transition-colors"
          >
            Disconnect
          </button>
        </div>
      </div>
    )
  }

  const isTutor = user.role === UserRole.TUTOR // TUTOR = 0
  const roleIcon = isTutor ? '👨‍🏫' : '👨‍🎓'

  return (
    <div className="sticky top-0 z-50 flex items-center justify-between gap-2 px-3 py-2 bg-[#FFFDD0] rounded-lg border border-[#3D441A]/20 backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 ${isTutor ? 'bg-purple-500' : 'bg-green-500'} rounded-full`}></div>
        <span className="text-sm font-medium text-[#3D441A]">{user.name}</span>
        <span className="text-xs bg-[#3D441A] text-[#FFFDD0] px-2 py-1 rounded-full">
          {roleIcon} {isTutor ? 'TUTOR' : 'STUDENT'}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-xs font-mono text-[#3D441A] bg-[#3D441A]/10 px-2 py-1 rounded">
          {formattedBalance} STT
        </span>
        <button
          onClick={copyToClipboard}
          className="group flex cursor-pointer items-center gap-1 text-xs text-[#3D441A]/60 font-mono hover:text-[#3D441A] transition-colors"
          title="Click to copy wallet address"
        >
          {address?.slice(0, 4)}...{address?.slice(-2)}
        </button>
        <button
          onClick={handleDisconnect}
          className="px-2 py-1.5 bg-[#3D441A] text-[#FFFDD0] text-[14px] rounded-lg cursor-pointer transition-colors"
        >
          Disconnect
        </button>
      </div>
    </div>
  )

}
