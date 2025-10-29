export const CONTRACT_ADDRESS = "0xbf16c7cA893c075758bc18f66d5A993372A6914d" as `0x${string}`;

export const CONTRACT_ABI = [

    {
      "inputs": [],
      "name": "CourseNotFound",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "ExamAlreadyCompleted",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "ExamDurationExpired",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "ExamNotActive",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "ExamNotFound",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "InvalidAnswerIndex",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "InvalidExamTime",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "message",
          "type": "string"
        }
      ],
      "name": "InvalidInput",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "NotEnrolledInCourse",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "UnauthorizedAccess",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "UserAlreadyRegistered",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "UserNotRegistered",
      "type": "error"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "courseId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "title",
          "type": "string"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "tutor",
          "type": "address"
        }
      ],
      "name": "CourseCreated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "student",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "courseId",
          "type": "uint256"
        }
      ],
      "name": "EnrollmentCreated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "examId",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "student",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "score",
          "type": "uint256"
        }
      ],
      "name": "ExamCompleted",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "examId",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "courseId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "title",
          "type": "string"
        }
      ],
      "name": "ExamCreated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "examId",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "student",
          "type": "address"
        }
      ],
      "name": "ExamStarted",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "user",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "name",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "enum ProofSmartContract.Role",
          "name": "role",
          "type": "uint8"
        }
      ],
      "name": "UserRegistered",
      "type": "event"
    },
    {
      "inputs": [],
      "name": "courseCounter",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "courseEnrollments",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "courseExams",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "courses",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "courseId",
          "type": "uint256"
        },
        {
          "internalType": "string",
          "name": "title",
          "type": "string"
        },
        {
          "internalType": "address",
          "name": "tutor",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "creationTimestamp",
          "type": "uint256"
        },
        {
          "internalType": "bool",
          "name": "isActive",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "title",
          "type": "string"
        }
      ],
      "name": "createCourse",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "courseId",
          "type": "uint256"
        },
        {
          "internalType": "string",
          "name": "title",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "scheduledDateTime",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "durationMinutes",
          "type": "uint256"
        },
        {
          "internalType": "string[]",
          "name": "questionTexts",
          "type": "string[]"
        },
        {
          "internalType": "string[][]",
          "name": "optionsArray",
          "type": "string[][]"
        },
        {
          "internalType": "uint256[]",
          "name": "correctAnswerIndices",
          "type": "uint256[]"
        }
      ],
      "name": "createExam",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "courseId",
          "type": "uint256"
        }
      ],
      "name": "enrollInCourse",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "examCorrectAnswers",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "examCounter",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "examQuestionOptions",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "examQuestions",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "examSessions",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "examId",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "student",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "startTime",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "score",
          "type": "uint256"
        },
        {
          "internalType": "bool",
          "name": "isCompleted",
          "type": "bool"
        },
        {
          "internalType": "bool",
          "name": "isSubmitted",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "exams",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "examId",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "courseId",
          "type": "uint256"
        },
        {
          "internalType": "string",
          "name": "title",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "scheduledDateTime",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "durationMinutes",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "questionCount",
          "type": "uint256"
        },
        {
          "internalType": "bool",
          "name": "isActive",
          "type": "bool"
        },
        {
          "internalType": "address",
          "name": "creator",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getAllCourses",
      "outputs": [
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "courseId",
              "type": "uint256"
            },
            {
              "internalType": "string",
              "name": "title",
              "type": "string"
            },
            {
              "internalType": "address",
              "name": "tutor",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "creationTimestamp",
              "type": "uint256"
            },
            {
              "internalType": "bool",
              "name": "isActive",
              "type": "bool"
            }
          ],
          "internalType": "struct ProofSmartContract.Course[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "courseId",
          "type": "uint256"
        }
      ],
      "name": "getCourse",
      "outputs": [
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "courseId",
              "type": "uint256"
            },
            {
              "internalType": "string",
              "name": "title",
              "type": "string"
            },
            {
              "internalType": "address",
              "name": "tutor",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "creationTimestamp",
              "type": "uint256"
            },
            {
              "internalType": "bool",
              "name": "isActive",
              "type": "bool"
            }
          ],
          "internalType": "struct ProofSmartContract.Course",
          "name": "",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "examId",
          "type": "uint256"
        }
      ],
      "name": "getExam",
      "outputs": [
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "examId",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "courseId",
              "type": "uint256"
            },
            {
              "internalType": "string",
              "name": "title",
              "type": "string"
            },
            {
              "internalType": "uint256",
              "name": "scheduledDateTime",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "durationMinutes",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "questionCount",
              "type": "uint256"
            },
            {
              "internalType": "bool",
              "name": "isActive",
              "type": "bool"
            },
            {
              "internalType": "address",
              "name": "creator",
              "type": "address"
            }
          ],
          "internalType": "struct ProofSmartContract.Exam",
          "name": "",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "examId",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "questionIndex",
          "type": "uint256"
        }
      ],
      "name": "getExamQuestion",
      "outputs": [
        {
          "internalType": "string",
          "name": "questionText",
          "type": "string"
        },
        {
          "internalType": "string[]",
          "name": "options",
          "type": "string[]"
        },
        {
          "internalType": "uint256",
          "name": "correctAnswerIndex",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "examId",
          "type": "uint256"
        }
      ],
      "name": "getExamQuestionCount",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "examId",
          "type": "uint256"
        }
      ],
      "name": "getExamQuestions",
      "outputs": [
        {
          "internalType": "string[]",
          "name": "questionTexts",
          "type": "string[]"
        },
        {
          "internalType": "string[][]",
          "name": "optionsArray",
          "type": "string[][]"
        },
        {
          "internalType": "uint256[]",
          "name": "correctAnswerIndices",
          "type": "uint256[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "examId",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "student",
          "type": "address"
        }
      ],
      "name": "getExamResults",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "score",
          "type": "uint256"
        },
        {
          "internalType": "uint256[]",
          "name": "selectedAnswers",
          "type": "uint256[]"
        },
        {
          "internalType": "bool",
          "name": "isCompleted",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "courseId",
          "type": "uint256"
        }
      ],
      "name": "getExamsForCourse",
      "outputs": [
        {
          "internalType": "uint256[]",
          "name": "",
          "type": "uint256[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "student",
          "type": "address"
        }
      ],
      "name": "getStudentEnrollments",
      "outputs": [
        {
          "internalType": "uint256[]",
          "name": "",
          "type": "uint256[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "userAddress",
          "type": "address"
        }
      ],
      "name": "getUser",
      "outputs": [
        {
          "components": [
            {
              "internalType": "string",
              "name": "name",
              "type": "string"
            },
            {
              "internalType": "enum ProofSmartContract.Role",
              "name": "role",
              "type": "uint8"
            },
            {
              "internalType": "bool",
              "name": "isRegistered",
              "type": "bool"
            },
            {
              "internalType": "uint256",
              "name": "registrationTimestamp",
              "type": "uint256"
            }
          ],
          "internalType": "struct ProofSmartContract.User",
          "name": "",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "examId",
          "type": "uint256"
        }
      ],
      "name": "isExamActive",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "userAddress",
          "type": "address"
        }
      ],
      "name": "isUserRegistered",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "name",
          "type": "string"
        },
        {
          "internalType": "enum ProofSmartContract.Role",
          "name": "role",
          "type": "uint8"
        }
      ],
      "name": "registerUser",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "registeredUsers",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "examId",
          "type": "uint256"
        }
      ],
      "name": "startExam",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "studentEnrollments",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "studentScores",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "examId",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "questionIndex",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "answerIndex",
          "type": "uint256"
        }
      ],
      "name": "submitAnswer",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "examId",
          "type": "uint256"
        }
      ],
      "name": "submitExam",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "tutorCourses",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "users",
      "outputs": [
        {
          "internalType": "string",
          "name": "name",
          "type": "string"
        },
        {
          "internalType": "enum ProofSmartContract.Role",
          "name": "role",
          "type": "uint8"
        },
        {
          "internalType": "bool",
          "name": "isRegistered",
          "type": "bool"
        },
        {
          "internalType": "uint256",
          "name": "registrationTimestamp",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ] as const;