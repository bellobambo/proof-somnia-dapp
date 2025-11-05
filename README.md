# Proof Education DApp

A decentralized education platform built with Next.js and integrated with the ProofSmartContract on Somnia. This application allows users to register as students or tutors, enroll in courses, and take blockchain-verified exams.

## Features

- **User Registration**: Register as a Student or Tutor with blockchain verification
- **Course Management**: View and enroll in available courses
- **Exam System**: Take timed exams with automatic submission
- **Wallet Integration**: Connect with MetaMask, WalletConnect, and other Web3 wallets
- **Real-time Updates**: Live exam timer and progress tracking

## Smart Contract

- **Contract Address**: `0xbf16c7cA893c075758bc18f66d5A993372A6914d`
- **Network**: Somnia Testnet

## Tech Stack

- **Frontend**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS
- **Web3**: Wagmi + Viem
- **State Management**: TanStack Query
- **Wallet Connection**: WalletConnect, MetaMask

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Web3 wallet (MetaMask recommended)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd proof-education-dapp
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your WalletConnect Project ID:
```
NEXT_PUBLIC_WC_PROJECT_ID=your-project-id-here
```

Get your Project ID from [WalletConnect Cloud](https://cloud.walletconnect.com/)

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### For Students

1. **Connect Wallet**: Click "Connect" and select your preferred wallet
2. **Register**: Enter your name and select "Student" role
3. **Browse Courses**: View available courses on the homepage
4. **Enroll**: Click "Enroll" on courses you want to join
5. **Take Exams**: Navigate to course pages and start available exams

### For Tutors

1. **Connect Wallet**: Click "Connect" and select your preferred wallet
2. **Register**: Enter your name and select "Tutor" role
3. **Create Courses**: Use the smart contract directly to create courses
4. **Create Exams**: Add exams to your courses with questions and schedules

## Smart Contract Functions

### Read Functions
- `getAllCourses()`: Get all available courses
- `getCourse(courseId)`: Get specific course details
- `getUser(address)`: Get user information
- `getExam(examId)`: Get exam details
- `getExamQuestion(examId, questionIndex)`: Get specific exam question

### Write Functions
- `registerUser(name, role)`: Register as student or tutor
- `createCourse(title)`: Create a new course (tutors only)
- `enrollInCourse(courseId)`: Enroll in a course
- `startExam(examId)`: Start taking an exam
- `submitAnswer(examId, questionIndex, answerIndex)`: Submit answer
- `submitExam(examId)`: Submit completed exam

## Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── course/[id]/       # Course detail pages
│   ├── exam/[id]/         # Exam pages
│   └── page.tsx           # Homepage
├── components/            # React components
│   ├── course-list.tsx    # Course listing
│   ├── exam-list.tsx      # Exam listing
│   ├── providers.tsx      # Web3 providers
│   ├── user-registration.tsx
│   └── wallet-connect.tsx
├── hooks/                 # Custom React hooks
│   └── useContract.ts     # Smart contract hooks
└── lib/                   # Utilities and config
    ├── contract.ts        # Contract ABI and types
    └── wagmi.ts          # Wagmi configuration
```

## Configuration

### Supported Networks

The app is configured for:
- Ethereum Mainnet
- Sepolia Testnet

To add more networks, edit `src/lib/wagmi.ts`:

```typescript
import { arbitrum, polygon } from 'wagmi/chains'

export const config = createConfig({
  chains: [mainnet, sepolia, arbitrum, polygon],
  // ... rest of config
})
```

### Custom RPC URLs

Add custom RPC URLs in `.env.local`:

```
NEXT_PUBLIC_MAINNET_RPC_URL=https://mainnet.infura.io/v3/your-key
NEXT_PUBLIC_SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/your-key
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review the smart contract ABI for function details



<!-- right loading state:
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#FFFDD0]/40 border-t-[#FFFDD0] mx-auto shadow-md"></div> -->
