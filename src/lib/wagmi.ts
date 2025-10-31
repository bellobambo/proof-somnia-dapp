import { http, createConfig } from 'wagmi'
import { sepolia } from 'wagmi/chains'
import { injected, walletConnect } from 'wagmi/connectors'

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
} as const

const projectId = process.env.NEXT_PUBLIC_WC_PROJECT_ID || ''

export const config = createConfig({
    chains: [somniaTestnet, sepolia],
    connectors: [
        injected(),
        ...(projectId ? [walletConnect({
            projectId,
            showQrModal: true,
            qrModalOptions: {
                themeMode: 'light',
            }
        })] : []),
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