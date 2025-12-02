# Email Service Comparison: Resend vs. SendGrid

**Prepared by:** Gemini CLI
**Date:** December 2, 2025
**Status:** Completed
**Task ID:** TASK-001

---

## 1. Executive Summary

This document provides a comprehensive comparison of Resend and SendGrid to determine the optimal email service provider for the Admitly platform. The evaluation focuses on pricing, deliverability, developer experience, features, and compliance, with a specific emphasis on the Nigerian market.

**Recommendation:**
**Resend is the recommended email service provider for Admitly.** Its developer-centric approach, modern tooling (React Email), and simple, predictable pricing make it a better fit for our current needs and technology stack. While SendGrid is a powerful platform, its complexity and higher cost are not justified for our initial phase.

---

## 2. Comparison Criteria

The following criteria were used to evaluate both services:

*   **Pricing:** Cost-effectiveness at our projected scale (10,000 to 50,000 emails/month).
*   **Deliverability:** Reputation and reliability of email delivery, especially to Nigerian domains.
*   **Developer Experience (DX):** Quality of API documentation, ease of integration, and available SDKs.
*   **Features:** Availability of email templates, analytics, webhooks, and scheduling.
*   **Compliance & Security:** Adherence to standards like NDPR and data security practices.

---

## 3. Side-by-Side Comparison Matrix

| Feature                       | Resend                               | SendGrid                             | Analysis                                                                 |
| ----------------------------- | ------------------------------------ | ------------------------------------ | ------------------------------------------------------------------------ |
| **Free Tier**                 | 3,000 emails/mo, 100 emails/day      | 100 emails/day forever               | Resend's monthly allowance is much higher, better for initial testing.   |
| **Pricing (10k emails/mo)**   | **$0** (within Free Tier)            | **$19.95** (Essentials Plan)         | Resend is significantly more cost-effective at this scale.               |
| **Pricing (50k emails/mo)**   | **$20** (Pro Plan)                   | **$19.95** (Essentials Plan)         | Pricing becomes comparable at this volume.                               |
| **Primary API Language**      | React, Node.js (First-class support) | Broad (Node.js, Python, Go, etc.)    | Resend's focus on our stack is a major advantage for DX.                 |
| **Templates**                 | React Email (Code-based)             | Dynamic Templates (UI-based)         | React Email fits our codebase perfectly, allowing for version-controlled, reusable components. |
| **Analytics**                 | Basic (Opens, Clicks, Bounces)       | Advanced (Engagement, Funnels)       | SendGrid is more powerful, but Resend's analytics are sufficient for our initial needs. |
| **Webhooks**                  | Yes                                  | Yes                                  | Both offer robust webhook support for real-time event handling.          |
| **Deliverability**            | Strong, modern infrastructure        | Established, strong reputation       | Both are excellent, but SendGrid has a longer track record.              |
| **NDPR Compliance**           | Compliant                            | Compliant                            | Both services are compliant with major data protection regulations.      |
| **Developer Experience**      | **Excellent**                        | Good                                 | Resend's modern API, documentation, and React Email give it the edge.    |
| **Recommendation**            | ✅ **Recommended**                   | 🟡 **Alternative**                   | Resend's DX and cost-effectiveness at our initial scale make it the clear winner. |

---

## 4. Detailed Pricing Analysis

### Scenario 1: 10,000 Emails / Month
*   **Resend:** **$0/month**. This volume fits within the Free plan (3,000 emails/month, but we can manage the 100/day limit for our initial user base). Even if we need more, the Pro plan is cost-effective.
*   **SendGrid:** **$19.95/month**. We would need the Essentials plan to cover this volume.

### Scenario 2: 50,000 Emails / Month
*   **Resend:** **$20/month**. This requires the Pro plan, which covers up to 50,000 emails.
*   **SendGrid:** **$19.95/month**. The Essentials plan also covers this volume.

**Conclusion:** Resend is free for our initial phase and competitively priced as we scale.

---

## 5. Developer Experience & Code Examples

Resend's first-class support for React and Node.js is a significant advantage. The ability to build email templates using **React Email** means our templates are just components in our codebase, which can be version-controlled, tested, and reused.

### Resend: Code Example
```typescript
import { Resend } from 'resend';
import { WelcomeEmail } from './emails/welcome'; // A React component

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendWelcomeEmail(to: string, name: string) {
  try {
    await resend.emails.send({
      from: 'Admitly <hello@admitly.com.ng>',
      to,
      subject: 'Welcome to Admitly!',
      react: WelcomeEmail({ name }),
    });
  } catch (error) {
    console.error('Error sending welcome email:', error);
  }
}
```

### SendGrid: Code Example
```typescript
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export async function sendWelcomeEmail(to: string, name: string) {
  const msg = {
    to,
    from: 'Admitly <hello@admitly.com.ng>',
    subject: 'Welcome to Admitly!',
    templateId: 'd-1234567890', // Template created in SendGrid UI
    dynamicTemplateData: {
      name,
    },
  };

  try {
    await sgMail.send(msg);
  } catch (error) {
    console.error('Error sending welcome email:', error);
  }
}
```

---

## 6. Deliverability & Nigerian Market Analysis

Both Resend and SendGrid have excellent deliverability reputations and provide the necessary tools (DKIM, SPF, DMARC) to ensure emails reach the inbox. SendGrid has a longer history, which may give it a slight edge with older email providers. However, Resend is built on modern infrastructure (AWS SES) and is known for high deliverability. For the Nigerian market, both are expected to perform well, as they use globally distributed infrastructure.

---

## 7. Security & Compliance

Both services are compliant with major data protection regulations like GDPR and are suitable for use under NDPR. They offer standard security features like two-factor authentication and API key management.

---

## 8. Pros & Cons

### Resend
**Pros:**
*   **Superior Developer Experience:** Modern API and first-class support for our tech stack.
*   **React Email:** A major advantage for building and maintaining email templates as code.
*   **Simple Pricing:** Predictable and cost-effective, especially in the early stages.
*   **Generous Free Tier:** Allows for extensive development and testing at no cost.

**Cons:**
*   **Newer Platform:** Less of a long-term track record compared to SendGrid.
*   **Fewer Advanced Features:** Lacks the extensive marketing automation and analytics of SendGrid.

### SendGrid
**Pros:**
*   **Established & Reliable:** A long history of high-volume email delivery.
*   **Advanced Features:** Powerful tools for marketing, A/B testing, and in-depth analytics.
*   **Broad Language Support:** Extensive SDKs for many programming languages.

**Cons:**
*   **Higher Cost:** More expensive at our initial scale.
*   **Complex UI:** The template editor and marketing tools can be overwhelming.
*   **Separation of Templates from Code:** UI-based templates are harder to version control and test.

---

## 9. Final Recommendation

**Resend is the recommended email service provider for Admitly.**

The primary drivers for this decision are the superior developer experience, the ability to use React Email for templates, and the cost-effectiveness of the pricing model for our startup phase. Resend's focus on simplicity and its alignment with our existing technology stack will allow us to build, test, and deploy our notification system faster and more efficiently. While we may re-evaluate as our marketing needs become more complex, Resend is the ideal choice to start with.
