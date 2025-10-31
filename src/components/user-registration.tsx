'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRegisterUser, UserRole } from '@/hooks/useContract'

export function UserRegistration() {
  const [name, setName] = useState('')
  const [role, setRole] = useState<UserRole>(UserRole.STUDENT)
  const { registerUser, isPending, isConfirming, isConfirmed, error } = useRegisterUser()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim()) {
      registerUser(name.trim(), role)
    }
  }

  if (isConfirmed) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#FFFDD0] border border-[#3D441A]/20 rounded-xl p-6 text-center"
      >
        <h3 className="text-xl font-bold text-[#3D441A] mb-2">Registration Successful!</h3>
        <p className="text-[#3D441A]">You are now registered as a {role === UserRole.STUDENT ? 'STUDENT' : 'TUTOR'}.</p>
        <p className="text-sm text-[#3D441A]/80 mt-2">Please refresh the page to continue.</p>
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
        <motion.h3 
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-2xl font-bold text-[#3D441A] mb-4 text-start"
        >
          Register Your Account
        </motion.h3>
        
        <motion.p 
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-[#3D441A]/80 mb-6 text-start"
        >
          You need to register before accessing courses and exams.
        </motion.p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <label htmlFor="name" className="block text-sm font-semibold text-[#3D441A] mb-2">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-3 border border-[#3D441A]/30 bg-white text-[#3D441A] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D441A]/30 focus:border-[#3D441A] placeholder-[#3D441A]/50"
              placeholder="Enter your full name"
              required
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <label htmlFor="role" className="block text-sm font-semibold text-[#3D441A] mb-2">
              Role
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(Number(e.target.value) as UserRole)}
              className="w-full px-3 py-3 border border-[#3D441A]/30 bg-white text-[#3D441A] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D441A]/30 focus:border-[#3D441A]"
            >
              <option value={UserRole.STUDENT} className="bg-white text-[#3D441A]">STUDENT</option>
              <option value={UserRole.TUTOR} className="bg-white text-[#3D441A]">TUTOR</option>
            </select>
          </motion.div>

          <motion.button
            type="submit"
            disabled={isPending || isConfirming || !name.trim()}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
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
                {isPending ? 'Registering...' : 'Confirming...'}
              </span>
            ) : (
              'Register Now'
            )}
          </motion.button>
        </form>

        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 p-3 bg-red-100 border border-red-300 rounded-lg"
          >
            <p className="text-sm text-red-700">
              Error: {error.message}
            </p>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}