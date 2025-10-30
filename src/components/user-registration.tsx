'use client'

import { useState } from 'react'
import { useRegisterUser, UserRole } from '@/hooks/useContract'
// import { UserRole } from '@/lib/contract



export function UserRegistration() {
  const [name, setName] = useState('')
  const [role, setRole] = useState<UserRole>(UserRole.Student)
  const { registerUser, isPending, isConfirming, isConfirmed, error } = useRegisterUser()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim()) {
      registerUser(name.trim(), role)
    }
  }

  if (isConfirmed) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <h3 className="text-lg font-semibold text-green-800 mb-2">Registration Successful!</h3>
        <p className="text-green-600">You are now registered as a {role === UserRole.Student ? 'Student' : 'Tutor'}.</p>
        <p className="text-sm text-green-500 mt-2">Please refresh the page to continue.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">Register Your Account</h3>
      <p className="text-gray-600 mb-6">
        You need to register before accessing courses and exams.
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Full Namee
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your full name"
            required
          />
        </div>

        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
            Role
          </label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(Number(e.target.value) as UserRole)}
            className="w-full px-3 py-2 border border-gray-300 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value={UserRole.Student}>Student</option>
            <option value={UserRole.Tutor}>Tutor</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={isPending || isConfirming || !name.trim()}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending || isConfirming ? (
            <span className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              {isPending ? 'Registering...' : 'Confirming...'}
            </span>
          ) : (
            'Register'
          )}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">
            Error: {error.message}
          </p>
        </div>
      )}
    </div>
  )
}