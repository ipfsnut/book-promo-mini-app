# INEVITABLE Farcaster Frame

A Farcaster Frame/Mini-app for promoting the NFT book "INEVITABLE: Distributed Cognition & Network Superintelligence" by EpicDylan.

## Features

- Display book metadata from Alexandria Labs NFTBook
- Show pricing data for the $NSI memecoin
- Provide links to:
  - Alexandria Books marketplace
  - Author's personal site
  - INEVITABLE Nounspace community

## Technical Stack

- Netlify Serverless Functions
- Farcaster Frames V2/Mini-app
- PageDAO Hub API integration
- DexScreener API for token pricing

## Project Structure

```
inevitable-frame/
├── functions/              # Netlify serverless functions
│   ├── frame.js            # Main frame handler
│   └── utils/              # Utility functions
│       ├── bookMetadata.js # Book metadata fetching
│       ├── frameResponse.js # Frame response formatting
│       ├── imageGenerator.js # Dynamic image generation
│       └── tokenPrice.js   # Token price fetching
├── public/                 # Static assets
│   ├── index.html          # Landing page
│   └── style.css           # Styles
├── netlify.toml            # Netlify configuration
└── package.json            # Project dependencies
```

## Local Development

1. Clone the repository:
```
git clone <repository-url>
cd inevitable-frame
```

2. Install dependencies:
```
npm install
```

3. Run the development server:
```
npm run dev
```

4. Open your browser to `http://localhost:8888` to view the landing page.

5. Test the frame via a Farcaster Frame development tool using the frame URL: `http://localhost:8888/frame`

## Deployment

1. Connect your GitHub repository to Netlify

2. Configure the build settings:
   - Build command: `npm run build`
   - Publish directory: `public`

3. Deploy the site

4. Your frame will be available at `https://your-netlify-site-name.netlify.app/frame`

## Frame Testing

You can test the frame using:

- Farcaster Frame Validator: [farcaster.xyz/frame-validator](https://farcaster.xyz/frame-validator)
- WarpCast Frame development tools
- Farcaster Developer Hub

## Environment Variables

This project doesn't require any environment variables, but you can add them if needed for custom API keys or other configuration.

## Contributing

Feel free to submit issues or pull requests if you find bugs or have suggestions for improvements.

## License

MIT