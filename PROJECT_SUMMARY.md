# INEVITABLE Farcaster Frame/Mini-app - Project Summary

## Overview

This project creates a Farcaster Frame/Mini-app for promoting the NFT book "INEVITABLE: Distributed Cognition & Network Superintelligence". The mini-app showcases book metadata from Alexandria Labs, displays $NSI token pricing data, and provides links to various resources including the Alexandria marketplace, the author's personal site, and the INEVITABLE Nounspace community.

## Features

- **Interactive Frame**: Provides a multi-view interactive Frame with buttons for navigation
- **Book Details**: Displays metadata from the Alexandria Labs NFTBook
- **Token Pricing**: Shows real-time price data for the $NSI memecoin
- **Full Mini-app Experience**: Includes a more comprehensive mini-app view
- **Notifications**: Supports user subscriptions for price alerts and updates
- **Responsive Design**: Optimized for both mobile and desktop views

## Technical Architecture

This project uses a serverless architecture built on Netlify Functions:

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Serverless Netlify Functions
- **APIs**:
  - PageDAO Hub API for book metadata
  - DexScreener API for token pricing
- **Storage**: In-memory for the demo (would use a database in production)
- **Deployment**: Netlify

## Project Structure

```
inevitable-frame/
├── functions/                     # Netlify serverless functions
│   ├── frame.js                   # Main frame handler
│   ├── frame-webhooks.js          # Webhook handler for notifications
│   ├── cron.js                    # Scheduled function for price monitoring
│   └── utils/                     # Utility functions
│       ├── bookMetadata.js        # Book metadata fetching
│       ├── tokenPrice.js          # Token price fetching
│       ├── frameResponse.js       # Frame response formatting
│       ├── imageGenerator.js      # Dynamic image generation
│       ├── imageOptimizer.js      # Image URL optimization
│       └── notificationSender.js  # Notification utility
├── public/                        # Static assets
│   ├── index.html                 # Landing page
│   ├── app.html                   # Mini-app experience
│   ├── style.css                  # Styles
│   └── .well-known/               # Mini-app manifest
│       └── farcaster.json         # Farcaster Mini-app manifest
├── netlify.toml                   # Netlify configuration
├── CRON_SETUP.md                  # Documentation for scheduled functions
└── package.json                   # Project dependencies
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Netlify CLI

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd inevitable-frame
```

2. Install dependencies:
```bash
npm install
```

3. Run the setup script to ensure all directories exist:
```bash
npm run setup
```

4. Start the development server:
```bash
npm run dev
```

5. Access the development server at http://localhost:8888

### Deployment

1. Connect your GitHub repository to Netlify

2. Configure the build settings:
   - Build command: `npm run build`
   - Publish directory: `public`

3. Set up environment variables if needed

4. Deploy the site

## Frame Experience

The Frame offers several views:

1. **Initial View**: Shows book cover with options to explore details, check token price, open the mini-app, or visit the community
2. **Book Details**: Displays book metadata with options to read on Alexandria or explore other reading options
3. **Token Price**: Shows current $NSI token price and market data with buying options
4. **External Links**: Provides direct links to Alexandria, the author's personal site, and the Nounspace community

## Mini-app Experience

The Mini-app expands on the Frame with:

1. **Tabbed Interface**: Easily switch between book details and token information
2. **Rich Content Display**: More comprehensive information about the book and token
3. **Interactive Elements**: Dynamic updates of token prices and market data
4. **Responsive Design**: Optimized for both mobile and desktop viewing

## Notifications

Users can subscribe to notifications for:

1. **Price Alerts**: Significant token price movements
2. **Book Updates**: New content or updates to the book
3. **Community Events**: Announcements from the INEVITABLE community

## Future Enhancements

Potential enhancements for future versions:

1. **Canvas-based Image Generation**: Create true dynamic images with realtime data
2. **Persistent Storage**: Implement a database for notification subscribers
3. **Enhanced Analytics**: Track user engagement and interaction metrics
4. **Content Preview**: Add a preview feature for book content
5. **Interactive Token Charts**: Display price history and trend visualization

## Additional Documentation

- **README.md**: Basic project information and setup instructions
- **CRON_SETUP.md**: Instructions for configuring scheduled functions