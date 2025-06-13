# AI-Powered Decentralized Meeting Scheduling System - Frontend

A modern React TypeScript application for decentralized meeting scheduling with AI agents on the Base Network.

## 🚀 Features

### Core Functionality
- **Web3 Wallet Integration**: Connect with MetaMask, Coinbase Wallet, and other Web3 wallets
- **Base Network Support**: Built specifically for Base Network with testnet support
- **XMTP Messaging**: Decentralized messaging for AI agent communication
- **Demo Mode**: Test all features without wallet connection
- **Responsive Design**: Mobile-first design with Tailwind CSS

### Host Features
- **Comprehensive Dashboard**: Manage availability, pricing, and meeting requests
- **Pricing Configuration**: Set rates for 30-min and 60-min sessions in multiple currencies
- **Availability Management**: Visual time slot management with enable/disable controls
- **Request Management**: Review and approve/reject meeting requests
- **Statistics Overview**: Track available slots, pending requests, and earnings

### Requester Features
- **Host Discovery**: Browse available experts with ratings and specialties
- **Booking Management**: Track confirmed, pending, and completed meetings
- **AI Agent Chat**: Communicate with AI scheduling assistant via XMTP
- **Payment Integration**: View payment status and transaction links
- **Meeting Links**: Direct access to confirmed meeting rooms

## 🛠 Technology Stack

- **Frontend Framework**: React 19.1.0 with TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Web3 Integration**: Wagmi + Viem for wallet connections
- **Messaging**: XMTP (with mock implementation for demo)
- **UI Components**: Custom components with Radix UI primitives
- **Build Tool**: Vite for fast development and building
- **Package Manager**: pnpm for efficient dependency management

## 📦 Installation

1. **Clone or extract the project**:
   ```bash
   tar -xzf meeting-scheduler-frontend.tar.gz
   cd meeting-scheduler-frontend
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   ```

3. **Start development server**:
   ```bash
   pnpm run dev
   ```

4. **Build for production**:
   ```bash
   pnpm run build
   ```

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:
```env
VITE_WALLETCONNECT_PROJECT_ID=your-project-id
```

### Tailwind CSS
The project uses a custom Tailwind configuration with:
- Custom color scheme optimized for Web3 applications
- Responsive breakpoints for mobile-first design
- Component variants using class-variance-authority
- Dark mode support (configurable)

## 🎨 Design System

### Colors
- **Primary**: Blue-based palette for Web3 branding
- **Secondary**: Gray tones for content hierarchy
- **Status Colors**: Green (success), Yellow (pending), Red (error)
- **Accent Colors**: Purple for highlights and special elements

### Components
- **Buttons**: Multiple variants (primary, secondary, outline, ghost)
- **Cards**: Consistent card design for content containers
- **Badges**: Status indicators with color coding
- **Forms**: Styled inputs with focus states and validation
- **Navigation**: Tab-based navigation with active states

## 🔗 Integration Points

### Web3 Wallets
- MetaMask integration via Wagmi
- Coinbase Wallet support
- Base Network and Base Sepolia testnet
- ENS name resolution for user identity

### XMTP Messaging
- Mock implementation for development/demo
- Ready for real XMTP integration
- AI agent communication simulation
- Message history and real-time updates

### Smart Contracts (Ready for Integration)
- Payment escrow functionality
- Automated fund release
- Refund mechanisms
- Platform fee collection

## 📱 User Flows

### Host Flow
1. Connect wallet or use demo mode
2. Select "I'm a Meeting Host"
3. Configure pricing and availability
4. Review and manage meeting requests
5. Track earnings and statistics

### Requester Flow
1. Connect wallet or use demo mode
2. Select "I want to Schedule a Meeting"
3. Discover available hosts
4. Chat with AI agent for scheduling
5. Manage bookings and payments

## 🧪 Demo Mode

The application includes a comprehensive demo mode that:
- Simulates wallet connection with demo.base.eth
- Provides realistic data for all features
- Enables full testing without Web3 setup
- Demonstrates AI agent interactions

## 🚀 Deployment

### Build for Production
```bash
pnpm run build
```

### Deploy to Vercel/Netlify
The `dist/` folder contains the built application ready for deployment to any static hosting service.

### Environment Setup
Ensure environment variables are configured for production:
- WalletConnect Project ID
- Base Network RPC endpoints
- XMTP configuration

## 🔮 Future Enhancements

### Planned Features
- Real XMTP integration when SDK is updated
- Smart contract integration for payments
- Calendar integration (Google Calendar, Outlook)
- Video call integration (Zoom, Google Meet)
- Advanced filtering and search
- Multi-language support
- Push notifications

### Technical Improvements
- Service worker for offline functionality
- Advanced caching strategies
- Performance optimizations
- Accessibility enhancements
- Testing suite (Jest, Cypress)

## 📄 License

This project is part of the Base Batch Messaging Buildathon submission.

## 🤝 Contributing

This is a buildathon project. For production use, consider:
- Adding comprehensive testing
- Implementing proper error handling
- Adding monitoring and analytics
- Security audits for smart contract integration
- Performance optimization for large datasets

---

**Built with ❤️ for the Base Network ecosystem**

