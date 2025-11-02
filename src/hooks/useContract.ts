"use client";

import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/lib/contract";
import { useEffect } from "react";

// Define UserRole enum locally
export enum UserRole {
  TUTOR = 0,
  STUDENT = 1,
}

// Define TypeScript interfaces for contract return types
export interface Course {
  courseId: bigint;
  title: string;
  tutor: `0x${string}`;
  tutorName: string;
  isActive: boolean;
}

export interface User {
  name: string;
  role: UserRole;
  isRegistered: boolean;
}

export interface Exam {
  examId: bigint;
  courseId: bigint;
  title: string;
  questionCount: bigint;
  isActive: boolean;
  creator: `0x${string}`;
}

export interface ExamSession {
  examId: bigint;
  student: `0x${string}`;
  score: bigint;
  isCompleted: boolean;
}

export interface ExamResults {
  rawScore: bigint;
  answers: readonly boolean[];
  isCompleted: boolean;
}

export interface ExamScore {
  rawScore: bigint;
  isCompleted: boolean;
}

export interface ExamWithStatus {
  exam: Exam;
  completionStatus: boolean;
  score: bigint;
}

// Read hooks with proper typing
export function useGetAllCourses() {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "getAllCourses",
  });
}

export function useGetAvailableExamsForStudent(
  studentAddress: `0x${string}` | undefined,
  options?: { query?: { enabled?: boolean } }
) {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "getAvailableExamsForStudent",
    args: studentAddress ? [studentAddress] : undefined,
    query: {
      enabled: options?.query?.enabled ?? !!studentAddress,
    },
  });
}

export function useGetCourse(courseId: bigint) {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "getCourse",
    args: [courseId],
  });
}

export function useGetUser(userAddress: `0x${string}` | undefined) {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "getUser",
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!userAddress,
    },
  });
}

export function useIsUserRegistered(userAddress: `0x${string}`) {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "isUserRegistered",
    args: [userAddress],
  });
}

export function useGetExamsForCourse(courseId: bigint) {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "getExamsForCourse",
    args: [courseId],
  });
}

export function useGetExam(examId: bigint) {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "getExam",
    args: [examId],
  });
}

export function useGetExamQuestions(examId: bigint) {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "getExamQuestions",
    args: [examId],
  });
}

export function useGetExamResults(
  examId: bigint,
  student: `0x${string}` | undefined,
  options?: { query?: { enabled?: boolean } }
) {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "getExamResults",
    args: student ? [examId, student] : undefined,
    query: {
      enabled: options?.query?.enabled ?? !!student,
    },
  });
}

export function useIsEnrolledInCourse(
  courseId: bigint,
  student: `0x${string}` | undefined
) {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "isEnrolledInCourse",
    args: student ? [courseId, student] : undefined,
    query: {
      enabled: !!student,
    },
  });
}

export function useGetAllExams() {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "getAllExams",
  });
}

// GRADING SYSTEM HOOKS

/**
 * Check if a student has completed an exam
 * @param examId - The exam ID to check
 * @param student - The student address
 */
export function useHasCompletedExam(
  examId: bigint,
  student: `0x${string}` | undefined,
  options?: { query?: { enabled?: boolean } }
) {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "hasCompletedExam",
    args: student ? [examId, student] : undefined,
    query: {
      enabled: options?.query?.enabled ?? !!student,
    },
  });
}

/**
 * Get a specific student's exam score (raw score - number of correct answers)
 * @param examId - The exam ID
 * @param student - The student address
 */
export function useGetStudentExamScore(
  examId: bigint,
  student: `0x${string}` | undefined,
  options?: { query?: { enabled?: boolean } }
) {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "getStudentExamScore",
    args: student ? [examId, student] : undefined,
    query: {
      enabled: options?.query?.enabled ?? !!student,
    },
  });
}

/**
 * Get exams with completion status and scores for a student
 * @param student - The student address
 */
export function useGetExamsWithStatusForStudent(
  student: `0x${string}` | undefined,
  options?: { query?: { enabled?: boolean } }
) {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "getExamsWithStatusForStudent",
    args: student ? [student] : undefined,
    query: {
      enabled: options?.query?.enabled ?? !!student,
    },
  });
}

// UTILITY FUNCTIONS FOR GRADING SYSTEM

/**
 * Calculate percentage score from raw score and total questions
 * @param rawScore - Number of correct answers
 * @param totalQuestions - Total number of questions
 * @returns Percentage score (0-100)
 */
export function calculatePercentageScore(rawScore: bigint, totalQuestions: bigint): number {
  if (totalQuestions === BigInt(0)) return 0;
  return Number((rawScore * BigInt(100)) / totalQuestions);
}

/**
 * Get grade letter based on percentage score
 * @param percentage - Percentage score (0-100)
 * @returns Grade letter (A, B, C, D, F)
 */
export function getGradeLetter(percentage: number): string {
  if (percentage >= 90) return "A";
  if (percentage >= 80) return "B";
  if (percentage >= 70) return "C";
  if (percentage >= 60) return "D";
  return "F";
}

/**
 * Parse exam results data from contract
 */
export function parseExamResults(
  data: any
): { rawScore: bigint; answers: boolean[]; isCompleted: boolean } | null {
  if (!data || !Array.isArray(data) || data.length < 3) {
    return null;
  }

  try {
    return {
      rawScore: BigInt(data[0]?.toString() || "0"),
      answers: data[1] || [],
      isCompleted: Boolean(data[2]),
    };
  } catch (error) {
    console.error("Error parsing exam results:", error);
    return null;
  }
}

/**
 * Parse exam score data from contract
 */
export function parseExamScore(
  data: any
): { rawScore: bigint; isCompleted: boolean } | null {
  if (!data || !Array.isArray(data) || data.length < 2) {
    return null;
  }

  try {
    return {
      rawScore: BigInt(data[0]?.toString() || "0"),
      isCompleted: Boolean(data[1]),
    };
  } catch (error) {
    console.error("Error parsing exam score:", error);
    return null;
  }
}

/**
 * Parse exams with status data from contract
 */
export function parseExamsWithStatus(
  data: any
): ExamWithStatus[] | null {
  if (!data || !Array.isArray(data) || data.length < 3) {
    return null;
  }

  try {
    const [availableExams, completionStatus, scores] = data;
    
    if (!Array.isArray(availableExams) || !Array.isArray(completionStatus) || !Array.isArray(scores)) {
      return null;
    }

    return availableExams.map((exam: any, index: number) => ({
      exam: {
        examId: BigInt(exam.examId?.toString() || "0"),
        courseId: BigInt(exam.courseId?.toString() || "0"),
        title: exam.title || "",
        questionCount: BigInt(exam.questionCount?.toString() || "0"),
        isActive: Boolean(exam.isActive),
        creator: exam.creator || "0x",
      },
      completionStatus: Boolean(completionStatus[index]),
      score: BigInt(scores[index]?.toString() || "0"),
    }));
  } catch (error) {
    console.error("Error parsing exams with status:", error);
    return null;
  }
}

// Write hooks
export function useRegisterUser() {
  const { writeContract, data: hash, error, isPending } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash });

  const registerUser = (name: string, role: UserRole) => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: "registerUser",
      args: [name, role],
    });
  };

  return {
    registerUser,
    hash,
    error,
    isPending,
    isConfirming,
    isConfirmed,
  };
}

export function useCreateCourse() {
  const { writeContract, data: hash, error, isPending } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash });

  const createCourse = (title: string) => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: "createCourse",
      args: [title],
    });
  };

  return {
    createCourse,
    hash,
    error,
    isPending,
    isConfirming,
    isConfirmed,
  };
}

export function useEnrollInCourse() {
  const { writeContract, data: hash, error, isPending } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash });

  const enrollInCourse = (courseId: bigint) => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: "enrollInCourse",
      args: [courseId],
    });
  };

  return {
    enrollInCourse,
    hash,
    error,
    isPending,
    isConfirming,
    isConfirmed,
  };
}

export function useTakeExam() {
  const { writeContract, data: hash, error, isPending } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash });

  const takeExam = (examId: bigint, answers: boolean[]) => {
    console.log("📝 takeExam - Before writeContract:", {
      examId: examId.toString(),
      answers,
      answersLength: answers.length,
    });

    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: "takeExam",
      args: [examId, answers],
    });
  };

  useEffect(() => {
    console.log("📝 takeExam state changed:", {
      isPending,
      isConfirming,
      isConfirmed,
      error,
      hash,
    });
  }, [isPending, isConfirming, isConfirmed, error, hash]);

  return {
    takeExam,
    hash,
    error,
    isPending,
    isConfirming,
    isConfirmed,
  };
}

export function useCreateExam() {
  const { writeContract, data: hash, error, isPending } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash });

  const createExam = (
    courseId: bigint,
    title: string,
    questionTexts: string[],
    correctAnswers: boolean[]
  ) => {
    console.log("📊 useCreateExam - Before writeContract:", {
      courseId: courseId.toString(),
      title,
      questionCount: questionTexts.length,
      correctAnswers,
    });

    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: "createExam",
      args: [courseId, title, questionTexts, correctAnswers],
    });
  };

  // Log state changes
  useEffect(() => {
    console.log("📊 useCreateExam state changed:", {
      isPending,
      isConfirming,
      isConfirmed,
      error,
      hash,
    });
  }, [isPending, isConfirming, isConfirmed, error, hash]);

  return {
    createExam,
    hash,
    error,
    isPending,
    isConfirming,
    isConfirmed,
  };
}