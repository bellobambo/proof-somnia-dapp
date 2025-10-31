'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCreateCourse } from '@/hooks/useContract'
import { useAccount, useReadContract } from 'wagmi'
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/lib/contract'

export function CourseCreationForm() {
  const [title, setTitle] = useState('')
  const { address } = useAccount()
  const { createCourse, isPending, isConfirming, isConfirmed, error } = useCreateCourse()

  // Check if user is registered
  const { data: userData, isLoading: isLoadingUser } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getUser',
    args: address ? [address] : undefined,
  })

  const { data: isRegistered } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'isUserRegistered',
    args: address ? [address] : undefined,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (title.trim()) {
      if (userData?.role === 0 && userData?.isRegistered) {
        createCourse(title)
      }
    }
  }

  // Show loading state
  if (isLoadingUser) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#FFFDD0] rounded-xl shadow-lg p-6 max-w-md mx-auto border border-[#3D441A]/10 text-center"
      >
        <div className="flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="rounded-full h-8 w-8 border-b-2 border-[#3D441A]"
          />
        </div>
        <p className="text-[#3D441A] mt-4">Checking user registration...</p>
      </motion.div>
    )
  }

  // Show registration requirement if not registered
  if (!isLoadingUser && (!isRegistered || !userData?.isRegistered)) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center max-w-md mx-auto"
      >
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
          <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Registration Required</h3>
        <p className="text-gray-700 mb-4">You need to register as a TUTOR before creating courses.</p>
      </motion.div>
    )
  }


  if (userData && userData.role !== 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center max-w-md mx-auto"
      >
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
          <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">TUTOR Access Required</h3>
        <p className="text-gray-700">Only TUTORs can create courses. Your current role: STUDENT</p>
      </motion.div>
    )
  }

  if (isConfirmed) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#FFFDD0] border border-[#3D441A]/20 rounded-xl p-6 text-center"
      >
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
          <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-[#3D441A] mb-2">Course Created Successfully!</h3>
        <p className="text-[#3D441A]">Your course has been created and is now available to STUDENTs.</p>
      </motion.div>
    )
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: -10 }}
        transition={{ 
          type: "spring",
          stiffness: 400,
          damping: 25
        }}
        className="bg-[#FFFDD0] rounded-xl shadow-lg p-6 max-w-md mx-auto border border-[#3D441A]/10"
      >
        <motion.h2 
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-2xl font-bold text-[#3D441A] mb-4 text-center"
        >
          Create Your First Course
        </motion.h2>


        
        <form onSubmit={handleSubmit} className="space-y-4">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <label htmlFor="title" className="block text-sm font-semibold text-[#3D441A] mb-2">
              Course Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Introduction to Blockchain"
              className="w-full px-3 py-3 border border-[#3D441A]/30 bg-white text-[#3D441A] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D441A]/30 focus:border-[#3D441A] placeholder-[#3D441A]/50"
              required
              disabled={isPending || isConfirming}
            />
          </motion.div>

          {/* Error Display */}
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-3 bg-red-100 border border-red-300 rounded-lg"
            >
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 text-red-600 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-red-800 mb-1">Failed to Create Course</h4>
                  <p className="text-sm text-red-700">
                    {error.message || 'An unexpected error occurred'}
                  </p>
                  {error.message?.includes('UserNotRegistered') && (
                    <p className="text-xs text-red-600 mt-1">Please register before creating a course.</p>
                  )}
                  {error.message?.includes('UnauthorizedAccess') && (
                    <p className="text-xs text-red-600 mt-1">Only TUTORs can create courses.</p>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          <motion.button
            type="submit"
            disabled={isPending || isConfirming || !title.trim()}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ 
              scale: 1.02,
              backgroundColor: "#3D441A",
              color: "#FFFDD0",
              transition: { duration: 0.2 }
            }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-[#3D441A] text-[#FFFDD0] py-3 px-4 rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-[#3D441A]/40 focus:ring-offset-2 focus:ring-offset-[#FFFDD0] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 border border-[#3D441A] shadow-md"
          >
            {isPending || isConfirming ? (
              <span className="flex items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="rounded-full h-4 w-4 border-b-2 border-[#FFFDD0] mr-2"
                />
                {isPending ? 'Creating...' : 'Confirming...'}
              </span>
            ) : (
              'Create Course'
            )}
          </motion.button>
        </form>
      </motion.div>
    </AnimatePresence>
  )
}