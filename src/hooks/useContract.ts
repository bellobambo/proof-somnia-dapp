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
  answers: readonly bigint[];
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

export interface ExamReview {
  questionTexts: readonly string[];
  questionOptions: readonly [string, string, string, string][];
  correctAnswers: readonly bigint[];
  studentAnswers: readonly bigint[];
  isCorrect: readonly boolean[];
  totalScore: bigint;
  maxScore: bigint;
}

export interface ExamQuestion {
  questionText: string;
  options: [string, string, string, string]; 
  correctAnswer: number;
}

export interface ExamAnswersComparison {
  correctAnswers: readonly bigint[];
  studentAnswers: readonly bigint[];
  isCorrect: readonly boolean[];
  isCompleted: boolean;
}

export type QuestionOptions = [string, string, string, string];

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

export function useGetExamCorrectAnswers(examId: bigint) {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "getExamCorrectAnswers",
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

// NEW HOOKS FOR ENHANCED EXAM FUNCTIONALITY

/**
 * Get complete exam data including questions, options, and correct answers
 * @param examId - The exam ID
 */
export function useGetCompleteExamData(examId: bigint) {
  const { data: examData, ...examQuery } = useGetExam(examId);
  const { data: questionsData, ...questionsQuery } =
    useGetExamQuestions(examId);
  const { data: correctAnswersData, ...answersQuery } =
    useGetExamCorrectAnswers(examId);

  const isLoading =
    examQuery.isLoading || questionsQuery.isLoading || answersQuery.isLoading;
  const isError =
    examQuery.isError || questionsQuery.isError || answersQuery.isError;
  const error = examQuery.error || questionsQuery.error || answersQuery.error;

  // Combine all data
  const completeData =
    examData && questionsData && correctAnswersData
      ? {
          exam: examData,
          questions: parseExamQuestions(questionsData, correctAnswersData),
          rawQuestions: questionsData,
          correctAnswers: correctAnswersData,
        }
      : null;

  return {
    data: completeData,
    isLoading,
    isError,
    error,
    refetch: () => {
      examQuery.refetch();
      questionsQuery.refetch();
      answersQuery.refetch();
    },
  };
}

// UTILITY FUNCTIONS FOR GRADING SYSTEM

/**
 * Calculate percentage score from raw score and total questions
 * @param rawScore - Number of correct answers
 * @param totalQuestions - Total number of questions
 * @returns Percentage score (0-100)
 */
export function calculatePercentageScore(
  rawScore: bigint,
  totalQuestions: bigint
): number {
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

export function parseExamResults(
  data: any
): { rawScore: bigint; answers: bigint[]; isCompleted: boolean } | null {
  if (!data || !Array.isArray(data) || data.length < 3) {
    return null;
  }

  try {
    return {
      rawScore: BigInt(data[0]?.toString() || "0"),
      answers: (data[1] || []).map((answer: any) =>
        BigInt(answer?.toString() || "0")
      ),
      isCompleted: Boolean(data[2]),
    };
  } catch (error) {
    console.error("Error parsing exam results:", error);
    return null;
  }
}

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

export function parseExamsWithStatus(data: any): ExamWithStatus[] | null {
  if (!data || !Array.isArray(data) || data.length < 3) {
    return null;
  }

  try {
    const [availableExams, completionStatus, scores] = data;

    if (
      !Array.isArray(availableExams) ||
      !Array.isArray(completionStatus) ||
      !Array.isArray(scores)
    ) {
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

export function parseExamQuestions(
  questionsData: any,
  correctAnswersData: any
): ExamQuestion[] | null {
  if (
    !questionsData ||
    !Array.isArray(questionsData) ||
    questionsData.length < 2
  ) {
    return null;
  }

  try {
    const [questionTexts, questionOptions] = questionsData;
    const correctAnswers = Array.isArray(correctAnswersData)
      ? correctAnswersData
      : [];

    if (!Array.isArray(questionTexts) || !Array.isArray(questionOptions)) {
      return null;
    }

    return questionTexts.map((questionText: string, index: number) => ({
      questionText: questionText || "",
      options: questionOptions[index] || ["", "", "", ""],
      correctAnswer: Number(correctAnswers[index]?.toString() || "0"),
    }));
  } catch (error) {
    console.error("Error parsing exam questions:", error);
    return null;
  }
}

export function validateExamAnswers(
  answers: number[],
  totalQuestions: number
): { isValid: boolean; error?: string } {
  if (!Array.isArray(answers)) {
    return { isValid: false, error: "Answers must be an array" };
  }

  if (answers.length !== totalQuestions) {
    return {
      isValid: false,
      error: `Number of answers (${answers.length}) must match number of questions (${totalQuestions})`,
    };
  }

  for (let i = 0; i < answers.length; i++) {
    const answer = answers[i];
    if (typeof answer !== "number" || answer < 0 || answer > 3) {
      return {
        isValid: false,
        error: `Answer at position ${i} must be a number between 0 and 3`,
      };
    }
  }

  return { isValid: true };
}

export function toQuestionOptions(options: string[]): QuestionOptions {
  if (options.length !== 4) {
    throw new Error("Question options must have exactly 4 elements");
  }
  return [options[0], options[1], options[2], options[3]];
}

export function validateAndConvertQuestionOptions(
  questionOptions: string[][]
): QuestionOptions[] {
  return questionOptions.map((options) => {
    if (options.length !== 4) {
      throw new Error("Each question must have exactly 4 options");
    }
    return toQuestionOptions(options);
  });
}

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

  const takeExam = (examId: bigint, answers: number[]) => {
    console.log("📝 takeExam - Before writeContract:", {
      examId: examId.toString(),
      answers,
      answersLength: answers.length,
    });

    const bigintAnswers = answers.map((answer) => BigInt(answer));

    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: "takeExam",
      args: [examId, bigintAnswers],
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
    questionOptions: QuestionOptions[], // Use the fixed tuple type
    correctAnswers: number[]
  ) => {
    console.log("📊 useCreateExam - Before writeContract:", {
      courseId: courseId.toString(),
      title,
      questionCount: questionTexts.length,
      questionOptions,
      correctAnswers,
    });

    // Validate inputs
    if (
      questionTexts.length !== questionOptions.length ||
      questionTexts.length !== correctAnswers.length
    ) {
      throw new Error(
        "Number of questions, options, and correct answers must match"
      );
    }

    // Convert correctAnswers to bigint array for contract
    const bigintCorrectAnswers = correctAnswers.map((answer) => BigInt(answer));

    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: "createExam",
      args: [
        courseId,
        title,
        questionTexts,
        questionOptions,
        bigintCorrectAnswers,
      ],
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

export function useCreateExamWithValidation() {
  const { createExam, ...createExamState } = useCreateExam();

  const createValidatedExam = (
    courseId: bigint,
    title: string,
    questions: ExamQuestion[]
  ) => {
    const questionTexts = questions.map((q) => q.questionText);
    const questionOptions = questions.map((q) => {
      if (q.options.length !== 4) {
        throw new Error(
          `Question "${q.questionText}" must have exactly 4 options`
        );
      }
      return q.options;
    });
    const correctAnswers = questions.map((q) => q.correctAnswer);

    // Validate correct answers are within range
    correctAnswers.forEach((answer, index) => {
      if (answer < 0 || answer > 3) {
        throw new Error(
          `Correct answer for question ${index + 1} must be between 0 and 3`
        );
      }
    });

    return createExam(
      courseId,
      title,
      questionTexts,
      questionOptions,
      correctAnswers
    );
  };

  return {
    createExam: createValidatedExam,
    ...createExamState,
  };
}

export function useCreateExamWithConversion() {
  const { createExam, ...createExamState } = useCreateExam();

  const createExamWithConversion = (
    courseId: bigint,
    title: string,
    questionTexts: string[],
    questionOptions: string[][],
    correctAnswers: number[]
  ) => {
    const formattedOptions = validateAndConvertQuestionOptions(questionOptions);

    return createExam(
      courseId,
      title,
      questionTexts,
      formattedOptions,
      correctAnswers
    );
  };

  return {
    createExam: createExamWithConversion,
    ...createExamState,
  };
}

export function useGetExamAnswersComparison(
  examId: bigint,
  student: `0x${string}` | undefined,
  options?: { query?: { enabled?: boolean } }
) {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "getExamAnswersComparison",
    args: student ? [examId, student] : undefined,
    query: {
      enabled: options?.query?.enabled ?? !!student,
    },
  });
}

export function parseExamAnswersComparison(
  data: any
): ExamAnswersComparison | null {
  // if (!data || !Array.isArray(data) || data.length < 4) {
  //   return null;
  // }

  try {
    const [correctAnswers, studentAnswers, isCorrect, isCompleted] = data;
    console.log(
      "from parseExamAnswersComparison",
      correctAnswers,
      studentAnswers
    );

    return {
      correctAnswers: Array.isArray(correctAnswers)
        ? correctAnswers.map((answer: any) => BigInt(answer?.toString() || "0"))
        : [],
      studentAnswers: Array.isArray(studentAnswers)
        ? studentAnswers.map((answer: any) => BigInt(answer?.toString() || "0"))
        : [],
      isCorrect: Array.isArray(isCorrect)
        ? isCorrect.map((correct: any) => Boolean(correct))
        : [],
      isCompleted: Boolean(isCompleted),
    };
  } catch (error) {
    console.error("Error parsing exam answers comparison:", error);
    return null;
  }
}

/**
 * Get correct answers for an exam (for students who have completed the exam)
 * @param examId - The exam ID
 * @param options - Query options including enabled flag
 */
export function useGetCorrectAnswersForStudent(examId: bigint) {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "getCorrectAnswersForStudent",
    args: [examId],
  });
}
