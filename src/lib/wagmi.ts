import { http, createConfig } from 'wagmi'
import { sepolia } from 'wagmi/chains'
import { injected, metaMask, safe, walletConnect } from 'wagmi/connectors'


const somniaTestnet = {
    id: 50312,
    name: 'Somnia Testnet',
    network: 'somnia-testnet',
    nativeCurrency: {
        decimals: 18,
        name: 'STT',
        symbol: 'STT',
    },
    rpcUrls: {
        default: {
            http: [process.env.NEXT_PUBLIC_SOMNIA_TESTNET_RPC_URL || 'https://dream-rpc.somnia.network/'],
        },
        public: {
            http: [
                process.env.NEXT_PUBLIC_SOMNIA_TESTNET_RPC_URL || 'https://dream-rpc.somnia.network/',
                'https://somnia.publicnode.com'
            ],
        },
    },
    blockExplorers: {
        default: {
            name: 'Somnia Testnet Explorer',
            url: 'https://shannon-explorer.somnia.network/'
        },
    },
    testnet: true,
}

const projectId = process.env.NEXT_PUBLIC_WC_PROJECT_ID

if (!projectId) {
    throw new Error('NEXT_PUBLIC_WC_PROJECT_ID is required')
}

export const config = createConfig({
    chains: [somniaTestnet, sepolia],
    connectors: [
        injected(),
        metaMask(),
        safe(),
        walletConnect({
            projectId,
            showQrModal: true // Optional: enables QR modal for better UX
        }),
    ],
    transports: {
        [somniaTestnet.id]: http(process.env.NEXT_PUBLIC_SOMNIA_TESTNET_RPC_URL),
        [sepolia.id]: http(process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL),
    },
    ssr: true, 
})

declare module 'wagmi' {
    interface Register {
        config: typeof config
    }
}