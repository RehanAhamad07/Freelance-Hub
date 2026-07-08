/**
 * Chat Moderation Utility
 * Pattern-based content filtering for real-time chat messages.
 * Zero cost, no external API calls — runs entirely on regex patterns.
 */

// Phone number patterns (international formats)
const phonePatterns = [
  /(\+?\d{1,4}[\s.-]?)?\(?\d{2,4}\)?[\s.-]?\d{3,4}[\s.-]?\d{3,4}/g,
  /\b\d{10,13}\b/g,
];

// Email pattern
const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

// Social media / messaging platform handles
const socialPatterns = [
  /(?:whatsapp|whats\s*app|wa\.me|telegram|t\.me|discord|skype|signal)\s*[:\-]?\s*[\w@#.+/]+/gi,
  /(?:instagram|insta|ig|snapchat|snap|twitter|facebook|fb)\s*[:\-@]?\s*[\w.]+/gi,
];

// Off-platform payment attempts
const paymentPatterns = [
  /(?:paypal|venmo|cash\s*app|zelle|crypto|bitcoin|btc|ethereum|eth|usdt)\s*[:\-]?\s*[\w@.]+/gi,
  /(?:send\s+(?:money|payment|funds)\s+(?:to|via|through))/gi,
  /\b[13][a-km-zA-HJ-NP-Z1-9]{25,34}\b/g,  // Bitcoin address pattern
  /\b0x[a-fA-F0-9]{40}\b/g,  // Ethereum address pattern
];

// Suspicious URLs (external links)
const suspiciousUrlPatterns = [
  /(?:bit\.ly|tinyurl|goo\.gl|t\.co|short\.link|rb\.gy)\/[\w]+/gi,
  /(?:https?:\/\/)?(?:www\.)?(?!localhost)[\w.-]+\.(?:com|net|org|io|xyz|tk|ml|ga|cf|gq)\b/gi,
];

// Abusive language blocklist (keep minimal, expand as needed)
const abusiveTerms = [
  // Slurs and harassment - using patterns that catch variations
  /\bf+u+c+k+/gi,
  /\bs+h+i+t+/gi,
  /\ba+s+s+h+o+l+e+/gi,
  /\bb+i+t+c+h+/gi,
  /\bid+i+o+t+/gi,
  /\bst+u+p+i+d+/gi,
  /\bk+i+l+l\s+(?:you|ur|u|yourself)/gi,
  /\bthreat/gi,
  /\bdie\b/gi,
];

/**
 * Analyze a chat message for policy violations
 * @param {string} text - The message text to analyze
 * @returns {{ flagged: boolean, reasons: string[], severity: 'low'|'medium'|'high' }}
 */
const moderateMessage = (text) => {
  if (!text || typeof text !== 'string') {
    return { flagged: false, reasons: [], severity: 'low' };
  }

  const reasons = [];
  let severity = 'low';

  // Check for phone numbers
  for (const pattern of phonePatterns) {
    if (pattern.test(text)) {
      reasons.push('Contains phone number — sharing contact info off-platform is not allowed');
      severity = 'medium';
      break;
    }
    pattern.lastIndex = 0; // Reset regex state
  }

  // Check for email addresses
  if (emailPattern.test(text)) {
    reasons.push('Contains email address — keep communications on-platform');
    severity = 'medium';
  }
  emailPattern.lastIndex = 0;

  // Check for social media handles
  for (const pattern of socialPatterns) {
    if (pattern.test(text)) {
      reasons.push('Contains social media / messaging handle — off-platform contact detected');
      severity = 'medium';
      break;
    }
    pattern.lastIndex = 0;
  }

  // Check for off-platform payment attempts
  for (const pattern of paymentPatterns) {
    if (pattern.test(text)) {
      reasons.push('Off-platform payment attempt detected — all transactions must go through FreelanceHub');
      severity = 'high';
      break;
    }
    pattern.lastIndex = 0;
  }

  // Check for suspicious URLs
  for (const pattern of suspiciousUrlPatterns) {
    if (pattern.test(text)) {
      reasons.push('External link detected — be cautious with links from unknown sources');
      if (severity === 'low') severity = 'low'; // URLs alone are low severity
      break;
    }
    pattern.lastIndex = 0;
  }

  // Check for abusive language
  for (const pattern of abusiveTerms) {
    if (pattern.test(text)) {
      reasons.push('Message contains inappropriate language');
      severity = severity === 'high' ? 'high' : 'medium';
      break;
    }
    pattern.lastIndex = 0;
  }

  return {
    flagged: reasons.length > 0,
    reasons,
    severity
  };
};

module.exports = { moderateMessage };
