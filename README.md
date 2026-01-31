# TradeTrack Pro

TradeTrack Pro is an institutional-grade trading journal and performance analytics platform designed specifically for Futures and Forex traders. It leverages Google Gemini AI to provide deep insights into execution quality and psychological patterns.

## Features

- **Institutional Terminal Design**: A high-end dark interface optimized for clarity and focus.
- **Secure Vault Architecture**: User-scoped data storage with full local persistence.
- **AI Performance Reflection**: Automated trade deconstruction using Gemini 3 Flash.
- **Visual Import Engine**: Batch process trade screenshots via AI-driven data extraction.
- **Dynamic Analytics**: Real-time equity curves, win-rate distribution, and profit factor tracking.
- **Daily Direction Assistant**: AI-powered market structure analysis and directional bias logging.

## Tech Stack

- **Framework**: React 19 (Vite)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Charts**: Recharts
- **Intelligence**: Google Gemini API (@google/genai)

## Deployment

Deploy directly to **Vercel** or **Netlify**:

1. Connect this repository to Vercel.
2. Select the **Vite** preset.
3. Add your `API_KEY` to the environment variables.
4. Deploy.

## Privacy

Data is stored locally in your browser's secure storage, scoped to your username. We recommend using the **Backup/Restore** feature regularly to maintain your journal history.