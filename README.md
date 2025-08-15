# AI Meeting Scheduler

An AI-powered meeting scheduling system composed of a React-based frontend and intelligent backend agents using XMTP and NLP.

## Table of Contents
- [Overview](#overview)
- [Architecture](#architecture)
- [Features](#features)
- [Installation & Setup](#installation--setup)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Future Enhancements](#future-enhancements)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

AI Meeting Scheduler is a decentralized, AI-enhanced platform for scheduling meetings. It comprises:

- A **frontend**—built with React and TypeScript—for hosts and requesters to manage meetings.
- An **AI agent backend**—handling natural language processing, XMTP messaging, and booking logic.
- A **backend controller layer**—coordinating interactions and routing between frontend and AI agent.

---

## Architecture

1. **Frontend** *(meeting-scheduler-frontend)*  
   - Built with React and TypeScript  
   - Uses Tailwind CSS and Radix UI  
   - Web3 wallet integration (MetaMask, Coinbase Wallet) via Wagmi and Viem  
   - XMTP messaging (mocked in demo mode)  
   - Host and requester dashboards with pricing, availability, booking, chat, and payment flows   
   2

2. **Agent Source** *(ai-agent-source)*  
   - Processes natural-language queries  
   - Uses XMTP for messaging  
   - Supports availability checking, mock payments, booking, cancellations, etc.  
   3

3. **Agent Backend** *(ai-agent-backend)*  
   - (Assumed coordinator layer; expand as needed from your internal repo files.)

---

## Features

### Frontend
- Web3 wallet connections  
- Host tools: availability, pricing setup, booking management, stats dashboard  
- Requester tools: host discovery, booking tracking, AI chat assistant, payment status, meeting links  
- Demo mode for testing without wallets or contracts  
- Responsive and mobile-friendly UI  
4

### AI Agent
- Natural language understanding of schedule-related commands  
- XMTP-based communication  
- Mock smart contract/payment simulation  
- Session tracking, booking, cancellation, availability, pricing logic  
5

---

## Installation & Setup

Clone repository and navigate into the relevant folders:

```bash
git clone https://github.com/Akin-Tunde/AI_Meeting_Scheduler.git
cd AI_Meeting_Scheduler
