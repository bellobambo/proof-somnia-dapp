'use client'

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/lib/contract'

// Define UserRole enum locally
export enum UserRole {
  Student = 0,
  Tutor = 1
}

// Define TypeScript interfaces for contract return types
export interface Course {
  id: bigint
  title: string
  tutor: `0x${string}`
  isActive: boolean
}

export interface User {
  id: `0x${string}`
  name: string
  role: UserRole
  isActive: boolean
}

export interface Exam {
  id: bigint
  courseId: bigint
  title: string
  description: string
  questionCount: bigint
  durationMinutes: bigint
  scheduledDateTime: bigint
  isActive: boolean
}

export interface Question {
  questionText: string
  options: readonly string[]
  correctAnswer: bigint
}

// Read hooks with proper typing
export function useGetAllCourses() {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getAllCourses',
  })
}

export function useGetCourse(courseId: bigint) {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getCourse',
    args: [courseId],
  })
}

export function useGetUser(userAddress: `0x${string}`) {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getUser',
    args: [userAddress],
  })
}

export function useIsUserRegistered(userAddress: `0x${string}`) {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'isUserRegistered',
    args: [userAddress],
  })
}

export function useGetStudentEnrollments(studentAddress: `0x${string}`) {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getStudentEnrollments',
    args: [studentAddress],
  })
}

export function useGetExamsForCourse(courseId: bigint) {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getExamsForCourse',
    args: [courseId],
  })
}

export function useGetExam(examId: bigint) {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getExam',
    args: [examId],
  })
}

export function useGetExamQuestion(examId: bigint, questionIndex: bigint) {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getExamQuestion',
    args: [examId, questionIndex],
  })
}

export function useIsExamActive(examId: bigint) {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'isExamActive',
    args: [examId],
  })
}

// Write hooks (unchanged)
export function useRegisterUser() {
  const { writeContract, data: hash, error, isPending } = useWriteContract()
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = 
    useWaitForTransactionReceipt({ hash })

  const registerUser = (name: string, role: UserRole) => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'registerUser',
      args: [name, role],
    })
  }

  return {
    registerUser,
    hash,
    error,
    isPending,
    isConfirming,
    isConfirmed,
  }
}

export function useCreateCourse() {
  const { writeContract, data: hash, error, isPending } = useWriteContract()
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = 
    useWaitForTransactionReceipt({ hash })

  const createCourse = (title: string) => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'createCourse',
      args: [title],
    })
  }

  return {
    createCourse,
    hash,
    error,
    isPending,
    isConfirming,
    isConfirmed,
  }
}

export function useEnrollInCourse() {
  const { writeContract, data: hash, error, isPending } = useWriteContract()
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = 
    useWaitForTransactionReceipt({ hash })

  const enrollInCourse = (courseId: bigint) => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'enrollInCourse',
      args: [courseId],
    })
  }

  return {
    enrollInCourse,
    hash,
    error,
    isPending,
    isConfirming,
    isConfirmed,
  }
}

export function useStartExam() {
  const { writeContract, data: hash, error, isPending } = useWriteContract()
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = 
    useWaitForTransactionReceipt({ hash })

  const startExam = (examId: bigint) => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'startExam',
      args: [examId],
    })
  }

  return {
    startExam,
    hash,
    error,
    isPending,
    isConfirming,
    isConfirmed,
  }
}

export function useSubmitAnswer() {
  const { writeContract, data: hash, error, isPending } = useWriteContract()
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = 
    useWaitForTransactionReceipt({ hash })

  const submitAnswer = (examId: bigint, questionIndex: bigint, answerIndex: bigint) => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'submitAnswer',
      args: [examId, questionIndex, answerIndex],
    })
  }

  return {
    submitAnswer,
    hash,
    error,
    isPending,
    isConfirming,
    isConfirmed,
  }
}

export function useSubmitExam() {
  const { writeContract, data: hash, error, isPending } = useWriteContract()
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = 
    useWaitForTransactionReceipt({ hash })

  const submitExam = (examId: bigint) => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'submitExam',
      args: [examId],
    })
  }

  return {
    submitExam,
    hash,
    error,
    isPending,
    isConfirming,
    isConfirmed,
  }
}