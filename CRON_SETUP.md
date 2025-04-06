# Setting Up Scheduled Functions for Token Price Monitoring

This document explains how to set up Netlify scheduled functions to monitor token prices and send notifications to users who have enabled them for the INEVITABLE Farcaster Frame/Mini-app.

## Overview

We use Netlify's scheduled functions feature to periodically check the price of the $NSI token and notify users about significant price movements.

## Requirements

1. Netlify account with the Build Plugins beta feature enabled
2. Netlify CLI installed locally
3. Repository connected to Netlify

## Steps to Enable Scheduled Functions

### 1. Install the Netlify Schedule Functions Plugin

Add the Netlify Schedule Functions plugin to your project:

```bash
npm install -D @netlify/plugin-scheduled-functions
```

### 2. Update netlify.toml Configuration

Add the plugin configuration to your netlify.toml file:

```toml
[[plugins]]
  package = "@netlify/plugin-scheduled-functions"

[functions.cron]
  schedule = "@hourly"
```

This will run the cron function every hour. You can adjust the schedule using standard cron syntax:

- `@hourly` - Run once per hour
- `@daily` - Run once per day
- `@weekly` - Run once per week
- `@monthly` - Run once per month
- `@yearly` - Run once per year
- `* * * * *` - Custom cron syntax (minute, hour, day of month, month, day of week)

For example, to run every 15 minutes:

```toml
[functions.cron]
  schedule = "*/15 * * * *"
```

### 3. Deploy to Netlify

Push your changes and deploy to Netlify:

```bash
git add .
git commit -m "Add scheduled function for token price monitoring"
git push origin main
```

### 4. Verify Scheduled Function

After deployment, you can verify the scheduled function in the Netlify dashboard:

1. Go to your site's dashboard
2. Navigate to "Functions"
3. Check that the "cron" function is listed
4. Monitor function logs to ensure it's running as expected

## Testing Locally

You can test the scheduled function locally by invoking it directly:

```bash
netlify functions:invoke cron
```

## Notification Thresholds

By default, the system sends notifications when:

- The token price changes by more than 10% in either direction within 24 hours

You can adjust these thresholds in the `checkNotificationThresholds` function in `functions/cron.js`.

## Storage Considerations

This example uses in-memory storage for subscriptions, which will reset when the function cold starts. For production use, you should:

1. Implement a database solution (such as Fauna, Supabase, or Firebase)
2. Update the `addSubscriber` and `removeSubscriber` functions to use persistent storage
3. Fetch subscriber data when the cron function runs

## Troubleshooting

If your scheduled functions are not running as expected:

1. Check Netlify function logs for errors
2. Verify that the plugin is correctly installed and configured
3. Ensure your Netlify account has the scheduled functions feature enabled
4. Check that your schedule syntax is valid

## Additional Resources

- [Netlify Scheduled Functions Documentation](https://docs.netlify.com/functions/scheduled-functions/)
- [Cron Syntax Reference](https://crontab.guru/)