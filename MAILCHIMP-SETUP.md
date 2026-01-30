# Mailchimp Newsletter Setup

This document explains how to configure the Mailchimp newsletter signup forms on the PWV website.

## Overview

Newsletter signup forms are implemented in three locations:

1. **Footer** - Site-wide signup (all pages)
2. **News Index Page** (`/news`) - Prominent signup for news readers
3. **Individual Post Pages** (`/news/*`) - Post-engagement signup

## Environment Variables

The newsletter signup component uses the following environment variables:

### Required Variables

```bash
PUBLIC_MAILCHIMP_ACTION_URL  # Full form action URL from Mailchimp
PUBLIC_MAILCHIMP_U           # Your Mailchimp User ID
PUBLIC_MAILCHIMP_ID          # Your Mailchimp Audience/List ID
```

## How to Get Your Mailchimp Values

### Option 1: Use the Full Action URL (Recommended)

1. Log in to your Mailchimp account
2. Go to **Audience** → **Signup forms** → **Embedded forms**
3. Look for the form's `action` attribute in the generated HTML
4. Copy the entire URL (format: `https://XXXX.list-manage.com/subscribe/post?u=XXXXX&id=XXXXX`)
5. Set it as `PUBLIC_MAILCHIMP_ACTION_URL`

**Example:**
```bash
PUBLIC_MAILCHIMP_ACTION_URL=https://pwv.us12.list-manage.com/subscribe/post?u=abc123def456&id=xyz789
```

### Option 2: Use Individual IDs

Alternatively, you can provide the individual components:

1. **Data Center** - Found in your Mailchimp URL when logged in (e.g., `us12`, `us19`)
2. **User ID (u)** - Found in the embedded form code
3. **Audience ID (id)** - Found in **Audience** → **Settings** → **Audience name and defaults**

**Example:**
```bash
PUBLIC_MAILCHIMP_U=abc123def456ghi789
PUBLIC_MAILCHIMP_ID=xyz789abc123
```

The component will construct the URL as:
```
https://pwv.us12.list-manage.com/subscribe/post?u={PUBLIC_MAILCHIMP_U}&id={PUBLIC_MAILCHIMP_ID}
```

## Setting Environment Variables

### For Local Development

Create a `.env` file in the project root:

```bash
# Mailchimp Newsletter Configuration
PUBLIC_MAILCHIMP_ACTION_URL=https://pwv.us12.list-manage.com/subscribe/post?u=YOUR_U_ID&id=YOUR_AUDIENCE_ID
```

### For Netlify Production/Preview

1. Go to your Netlify site dashboard
2. Navigate to **Site settings** → **Environment variables**
3. Add the following variables:
   - Key: `PUBLIC_MAILCHIMP_ACTION_URL`
   - Value: Your Mailchimp form action URL
   - Scopes: Select "All scopes" or specific ones as needed

4. Redeploy your site for changes to take effect

## Testing the Setup

### 1. With Placeholder Values (Current State)

The component currently uses placeholder values if environment variables are not set. This allows you to test the UI without actual Mailchimp integration.

### 2. With Real Mailchimp Values

1. Add your environment variables (see above)
2. Build the site locally: `npm run dev`
3. Navigate to any page with a newsletter signup
4. Enter a test email address
5. Click "Subscribe"
6. You should be redirected to Mailchimp's confirmation page
7. Check your Mailchimp audience for the new subscriber

## Form Behavior

- **Validation**: Email format is validated before submission
- **Honeypot Protection**: Includes hidden field to prevent spam bots
- **Target**: Form opens in new tab (`target="_blank"`)
- **Double Opt-in**: Uses Mailchimp's default double opt-in process
- **Privacy**: Includes note about privacy and ability to unsubscribe

## Customization

### Newsletter Signup Component

The component (`src/components/NewsletterSignup.astro`) supports three variants:

```astro
<!-- Default variant (full form with heading) -->
<NewsletterSignup />

<!-- Inline variant (horizontal layout on desktop) -->
<NewsletterSignup variant="inline" />

<!-- Compact variant (minimal, no heading/description) -->
<NewsletterSignup variant="compact" />
```

### Custom Text

You can customize the heading and description:

```astro
<NewsletterSignup
  headingText="Join Our Newsletter"
  descriptionText="Get weekly updates from PWV."
  variant="inline"
/>
```

## Troubleshooting

### Form Doesn't Submit

1. Check that environment variables are set correctly
2. Verify the Mailchimp Action URL is valid
3. Check browser console for errors
4. Ensure your Mailchimp audience is active

### Subscribers Not Appearing

1. Check Mailchimp's "Recent Activity" in your Audience dashboard
2. Look in the "Unsubscribed" or "Cleaned" segments
3. Verify double opt-in settings (subscribers must confirm email)
4. Check your email's spam folder for confirmation emails

### Styling Issues

The component uses Tailwind CSS classes matching your site's design system:
- `pwv-black` - Black text/backgrounds
- `pwv-white` - White text
- `pwv-green` - Primary green color
- `pwv-gray` - Gray text/borders

Modify these in the component file if needed.

## Security Notes

- Environment variables prefixed with `PUBLIC_` are exposed to the client
- This is safe for Mailchimp form URLs as they're designed to be public
- The honeypot field helps prevent automated spam submissions
- Mailchimp handles rate limiting and abuse prevention on their end

## Next Steps

1. [ ] Obtain Mailchimp Action URL from your Mailchimp account
2. [ ] Set environment variables in Netlify
3. [ ] Test signup with a real email address
4. [ ] Configure Mailchimp double opt-in settings
5. [ ] Customize welcome email in Mailchimp
6. [ ] Set up automated campaigns (optional)
7. [ ] Add newsletter signup to other pages if desired

## Support

For Mailchimp-specific questions:
- [Mailchimp Documentation](https://mailchimp.com/help/)
- [Embedded Form Guide](https://mailchimp.com/help/add-a-signup-form-to-your-website/)

For site integration questions:
- Check the component file: `src/components/NewsletterSignup.astro`
- Review implementation in `src/components/Footer.astro` and news pages
