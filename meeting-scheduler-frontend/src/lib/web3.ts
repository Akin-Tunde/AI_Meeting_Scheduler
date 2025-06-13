import { http, createConfig } from 'wagmi'
import { base, baseSepolia } from 'wagmi/chains'
import { coinbaseWallet, metaMask } from 'wagmi/connectors'

// Define the chains we want to support
export const chains = [base, baseSepolia] as const

// Create wagmi config
export const config = createConfig({
  chains,
  connectors: [
    metaMask(),
    coinbaseWallet({
      appName: 'AI Meeting Scheduler',
      appLogoUrl: 'https://example.com/logo.png',
    }),
  ],
  transports: {
    [base.id]: http(),
    [baseSepolia.id]: http(),
  },
})

// Export types for TypeScript
export type Config = typeof config

