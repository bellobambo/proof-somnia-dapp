'use client'

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/lib/contract'
import { useEffect } from 'react'

// Define UserRole enum locally
export enum UserRole {
  TUTOR = 0,
  STUDENT = 1
}

// Define TypeScript interfaces for contract return types
export interface Course {
  courseId: bigint
  title: string
  tutor: `0x${string}`
  isActive: boolean
}

export interface User {
  name: string
  role: UserRole
  isRegistered: boolean
}

export interface Exam {
  examId: bigint
  courseId: bigint
  title: string
  questionCount: bigint
  isActive: boolean
  creator: `0x${string}`
}

export interface ExamSession {
  examId: bigint
  student: `0x${string}`
  score: bigint
  isCompleted: boolean
}

// Read hooks with proper typing
export function useGetAllCourses() {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getAllCourses',
  })
}

// Hook to get available exams for student - with enabled option
export function useGetAvailableExamsForStudent(
  studentAddress: `0x${string}` | undefined,
  options?: { query?: { enabled?: boolean } }
) {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getAvailableExamsForStudent',
    args: studentAddress ? [studentAddress] : undefined,
    query: {
      enabled: options?.query?.enabled ?? !!studentAddress,
    },
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

export function useGetUser(userAddress: `0x${string}` | undefined) {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getUser',
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!userAddress,
    },
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

export function useGetExamQuestions(examId: bigint) {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getExamQuestions',
    args: [examId],
  })
}

export function useGetExamResults(examId: bigint, student: `0x${string}` | undefined) {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getExamResults',
    args: student ? [examId, student] : undefined,
    query: {
      enabled: !!student,
    },
  })
}

export function useIsEnrolledInCourse(courseId: bigint, student: `0x${string}` | undefined) {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'isEnrolledInCourse',
    args: student ? [courseId, student] : undefined,
    query: {
      enabled: !!student,
    },
  })
}

export function useGetAllExams() {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getAllExams',
  })
}

// Write hooks
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

export function useTakeExam() {
  const { writeContract, data: hash, error, isPending } = useWriteContract()
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = 
    useWaitForTransactionReceipt({ hash })

  const takeExam = (examId: bigint, answers: boolean[]) => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'takeExam',
      args: [examId, answers],
    })
  }

  return {
    takeExam,
    hash,
    error,
    isPending,
    isConfirming,
    isConfirmed,
  }
}

export function useCreateExam() {
  const { writeContract, data: hash, error, isPending } = useWriteContract()
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash })

  const createExam = (
    courseId: bigint,
    title: string,
    questionTexts: string[],
    correctAnswers: boolean[]
  ) => {
    console.log('📊 useCreateExam - Before writeContract:', {
      courseId: courseId.toString(),
      title,
      questionCount: questionTexts.length,
      correctAnswers
    })

    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'createExam',
      args: [
        courseId,
        title,
        questionTexts,
        correctAnswers,
      ],
    })
  }

  // Log state changes
  useEffect(() => {
    console.log('📊 useCreateExam state changed:', {
      isPending,
      isConfirming, 
      isConfirmed,
      error,
      hash
    })
  }, [isPending, isConfirming, isConfirmed, error, hash])

  return {
    createExam,
    hash,
    error,
    isPending,
    isConfirming,
    isConfirmed,
  }
}

