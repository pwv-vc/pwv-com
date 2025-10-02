/**
 * UTM tracking utilities for social sharing and analytics
 */

export interface UTMParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
}

/**
 * Generate UTM parameters for social sharing
 */
export function generateSocialUTM(
  platform:
    | 'twitter'
    | 'linkedin'
    | 'facebook'
    | 'reddit'
    | 'hackernews'
    | 'general',
  content?: string
): UTMParams {
  const baseParams: UTMParams = {
    utm_source: 'pwv.com',
    utm_medium: 'social',
  };

  switch (platform) {
    case 'twitter':
      return {
        ...baseParams,
        utm_campaign: 'social_twitter',
        utm_content: content || 'twitter_share',
      };
    case 'linkedin':
      return {
        ...baseParams,
        utm_campaign: 'social_linkedin',
        utm_content: content || 'linkedin_share',
      };
    case 'facebook':
      return {
        ...baseParams,
        utm_campaign: 'social_facebook',
        utm_content: content || 'facebook_share',
      };
    case 'reddit':
      return {
        ...baseParams,
        utm_campaign: 'social_reddit',
        utm_content: content || 'reddit_share',
      };
    case 'hackernews':
      return {
        ...baseParams,
        utm_campaign: 'social_hackernews',
        utm_content: content || 'hackernews_share',
      };
    case 'general':
    default:
      return {
        ...baseParams,
        utm_campaign: 'social_sharing',
        utm_content: content || 'general_share',
      };
  }
}

/**
 * Add UTM parameters to a URL
 */
export function addUTMToURL(url: string, utmParams: UTMParams): string {
  try {
    const urlObj = new URL(url);

    Object.entries(utmParams).forEach(([key, value]) => {
      if (value) {
        urlObj.searchParams.set(key, value);
      }
    });

    return urlObj.toString();
  } catch (error) {
    // If URL parsing fails, return original URL
    console.warn('Failed to parse URL for UTM tracking:', url, error);
    return url;
  }
}

/**
 * Generate social sharing URLs with UTM tracking
 */
export function generateSocialSharingURLs(
  url: string,
  title: string,
  description?: string
): {
  twitter: string;
  linkedin: string;
  facebook: string;
  reddit: string;
  hackernews: string;
} {
  const encodedURL = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = description ? encodeURIComponent(description) : '';

  // Add UTM parameters to the original URL for each platform
  const twitterURL = addUTMToURL(
    url,
    generateSocialUTM('twitter', 'twitter_share')
  );
  const linkedinURL = addUTMToURL(
    url,
    generateSocialUTM('linkedin', 'linkedin_share')
  );
  const facebookURL = addUTMToURL(
    url,
    generateSocialUTM('facebook', 'facebook_share')
  );
  const redditURL = addUTMToURL(
    url,
    generateSocialUTM('reddit', 'reddit_share')
  );
  const hackernewsURL = addUTMToURL(
    url,
    generateSocialUTM('hackernews', 'hackernews_share')
  );

  return {
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(twitterURL)}&text=${encodedTitle}${encodedDescription ? `&via=PWVentures` : ''}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(linkedinURL)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(facebookURL)}`,
    reddit: `https://reddit.com/submit?url=${encodeURIComponent(redditURL)}&title=${encodedTitle}`,
    hackernews: `https://news.ycombinator.com/submitlink?u=${encodeURIComponent(hackernewsURL)}&t=${encodedTitle}`,
  };
}

/**
 * Generate UTM parameters for specific content types
 */
export function generateContentUTM(
  contentType: 'post' | 'portfolio' | 'about' | 'apply',
  contentSlug?: string
): UTMParams {
  const baseParams: UTMParams = {
    utm_source: 'pwv.com',
    utm_medium: 'social',
  };

  switch (contentType) {
    case 'post':
      return {
        ...baseParams,
        utm_campaign: 'content_post',
        utm_content: contentSlug || 'blog_post',
      };
    case 'portfolio':
      return {
        ...baseParams,
        utm_campaign: 'content_portfolio',
        utm_content: contentSlug || 'portfolio_company',
      };
    case 'about':
      return {
        ...baseParams,
        utm_campaign: 'content_about',
        utm_content: 'about_page',
      };
    case 'apply':
      return {
        ...baseParams,
        utm_campaign: 'content_apply',
        utm_content: 'apply_page',
      };
    default:
      return {
        ...baseParams,
        utm_campaign: 'content_general',
        utm_content: 'general_content',
      };
  }
}
