"""
Email Service using Resend
Handles all email sending operations for the Admitly platform
"""
import logging
from typing import Optional, List, Dict, Any
from datetime import datetime
import resend
from core.config import settings

logger = logging.getLogger(__name__)


class EmailService:
    """
    Email service abstraction using Resend API

    Features:
    - Saved search notifications (new results)
    - Application deadline alerts
    - Account verification (future)
    - Password reset (future)
    - Weekly digest (future)
    """

    def __init__(self):
        """Initialize Resend client"""
        self.client = resend
        self.client.api_key = settings.RESEND_API_KEY
        self.from_email = settings.FROM_EMAIL
        self.support_email = settings.SUPPORT_EMAIL

    async def send_email(
        self,
        to: str,
        subject: str,
        html: str,
        text: Optional[str] = None,
        reply_to: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Send an email using Resend

        Args:
            to: Recipient email address
            subject: Email subject
            html: HTML content
            text: Plain text content (optional)
            reply_to: Reply-to email address (optional)

        Returns:
            Response from Resend API with email ID

        Raises:
            Exception: If email sending fails
        """
        try:
            params = {
                "from": self.from_email,
                "to": [to],
                "subject": subject,
                "html": html,
            }

            if text:
                params["text"] = text

            if reply_to:
                params["reply_to"] = reply_to

            response = self.client.Emails.send(params)

            logger.info(f"Email sent successfully to {to}, ID: {response.get('id')}")
            return response

        except Exception as e:
            logger.error(f"Failed to send email to {to}: {str(e)}")
            raise

    async def send_saved_search_notification(
        self,
        to: str,
        user_name: str,
        search_name: str,
        search_query: str,
        new_results_count: int,
        results_preview: List[Dict[str, Any]],
        search_url: str
    ) -> Dict[str, Any]:
        """
        Send notification about new results for a saved search

        Args:
            to: User email
            user_name: User's full name
            search_name: Name of saved search
            search_query: Search query text
            new_results_count: Number of new results found
            results_preview: List of first 3-5 results with name, institution, state
            search_url: Direct URL to view full results

        Returns:
            Response from Resend API
        """
        subject = f"🎓 {new_results_count} new program(s) found for '{search_name}'"

        # Build results preview HTML
        preview_html = ""
        for result in results_preview[:5]:  # Show max 5
            preview_html += f"""
            <div style="margin: 10px 0; padding: 10px; border-left: 3px solid #3b82f6; background: #f9fafb;">
                <strong style="color: #1f2937;">{result.get('name', 'Unknown Program')}</strong><br>
                <span style="color: #6b7280;">{result.get('institution', 'Unknown Institution')}</span><br>
                <span style="color: #6b7280; font-size: 14px;">📍 {result.get('state', 'Unknown Location')}</span>
            </div>
            """

        html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 24px;">New Programs Found!</h1>
            </div>

            <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
                <p style="font-size: 16px; margin-bottom: 20px;">Hi {user_name},</p>

                <p style="font-size: 16px; margin-bottom: 20px;">
                    Great news! We found <strong>{new_results_count} new program(s)</strong> matching your saved search
                    "<strong>{search_name}</strong>" (query: "{search_query}").
                </p>

                <h3 style="color: #1f2937; margin-top: 30px; margin-bottom: 15px;">Preview of New Programs:</h3>
                {preview_html}

                {f'<p style="color: #6b7280; font-size: 14px; margin-top: 15px;">...and {new_results_count - 5} more</p>' if new_results_count > 5 else ''}

                <div style="text-align: center; margin-top: 30px;">
                    <a href="{search_url}"
                       style="background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                        View All Results
                    </a>
                </div>

                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

                <p style="font-size: 14px; color: #6b7280; margin-bottom: 10px;">
                    You're receiving this email because you have notifications enabled for this saved search.
                    You can manage your notification preferences in your
                    <a href="https://admitly.com.ng/settings/preferences" style="color: #3b82f6;">account settings</a>.
                </p>

                <p style="font-size: 14px; color: #6b7280; margin-top: 20px;">
                    Best regards,<br>
                    <strong>The Admitly Team</strong>
                </p>
            </div>

            <div style="background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; border-top: none;">
                <p style="font-size: 12px; color: #9ca3af; margin: 5px 0;">
                    Admitly - Nigeria's Premier Educational Data Platform
                </p>
                <p style="font-size: 12px; color: #9ca3af; margin: 5px 0;">
                    <a href="https://admitly.com.ng" style="color: #3b82f6; text-decoration: none;">admitly.com.ng</a> |
                    <a href="mailto:{self.support_email}" style="color: #3b82f6; text-decoration: none;">{self.support_email}</a>
                </p>
            </div>
        </body>
        </html>
        """

        # Plain text version
        text = f"""
Hi {user_name},

Great news! We found {new_results_count} new program(s) matching your saved search "{search_name}" (query: "{search_query}").

Preview of New Programs:
"""
        for result in results_preview[:5]:
            text += f"\n- {result.get('name', 'Unknown')} at {result.get('institution', 'Unknown')} ({result.get('state', 'Unknown')})"

        if new_results_count > 5:
            text += f"\n...and {new_results_count - 5} more"

        text += f"\n\nView all results: {search_url}\n\nYou can manage your notification preferences at https://admitly.com.ng/settings/preferences\n\nBest regards,\nThe Admitly Team"

        return await self.send_email(
            to=to,
            subject=subject,
            html=html,
            text=text
        )

    async def send_deadline_alert(
        self,
        to: str,
        user_name: str,
        program_name: str,
        institution_name: str,
        deadline_date: datetime,
        days_remaining: int,
        application_url: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Send application deadline alert

        Args:
            to: User email
            user_name: User's full name
            program_name: Name of program
            institution_name: Name of institution
            deadline_date: Application deadline
            days_remaining: Number of days until deadline
            application_url: URL to application page (optional)

        Returns:
            Response from Resend API
        """
        urgency = "🔴 URGENT" if days_remaining <= 3 else "⚠️ REMINDER"
        subject = f"{urgency}: {program_name} deadline in {days_remaining} day(s)"

        deadline_formatted = deadline_date.strftime("%B %d, %Y")

        html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: {'#dc2626' if days_remaining <= 3 else '#f59e0b'}; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 24px;">Application Deadline Reminder</h1>
            </div>

            <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
                <p style="font-size: 16px; margin-bottom: 20px;">Hi {user_name},</p>

                <div style="background: {'#fee2e2' if days_remaining <= 3 else '#fef3c7'}; padding: 20px; border-radius: 6px; margin: 20px 0;">
                    <p style="font-size: 18px; font-weight: bold; color: {'#991b1b' if days_remaining <= 3 else '#92400e'}; margin: 0;">
                        ⏰ Only {days_remaining} day(s) remaining!
                    </p>
                </div>

                <p style="font-size: 16px; margin-bottom: 10px;">
                    The application deadline for <strong>{program_name}</strong> at <strong>{institution_name}</strong>
                    is approaching fast.
                </p>

                <p style="font-size: 16px; margin-bottom: 20px;">
                    <strong>Deadline:</strong> {deadline_formatted}
                </p>

                {'<div style="text-align: center; margin-top: 30px;"><a href="' + application_url + '" style="background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">Apply Now</a></div>' if application_url else ''}

                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

                <p style="font-size: 14px; color: #6b7280; margin-bottom: 10px;">
                    Don't miss this opportunity! Make sure to submit your application before the deadline.
                </p>

                <p style="font-size: 14px; color: #6b7280; margin-top: 20px;">
                    Best regards,<br>
                    <strong>The Admitly Team</strong>
                </p>
            </div>

            <div style="background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; border-top: none;">
                <p style="font-size: 12px; color: #9ca3af; margin: 5px 0;">
                    Admitly - Nigeria's Premier Educational Data Platform
                </p>
                <p style="font-size: 12px; color: #9ca3af; margin: 5px 0;">
                    <a href="https://admitly.com.ng" style="color: #3b82f6; text-decoration: none;">admitly.com.ng</a> |
                    <a href="mailto:{self.support_email}" style="color: #3b82f6; text-decoration: none;">{self.support_email}</a>
                </p>
            </div>
        </body>
        </html>
        """

        # Plain text version
        text = f"""
Hi {user_name},

{urgency}: The application deadline for {program_name} at {institution_name} is approaching fast!

Only {days_remaining} day(s) remaining until the deadline on {deadline_formatted}.

{"Apply now: " + application_url if application_url else "Make sure to submit your application before the deadline!"}

Best regards,
The Admitly Team
"""

        return await self.send_email(
            to=to,
            subject=subject,
            html=html,
            text=text
        )

    async def send_account_verification(
        self,
        to: str,
        user_name: str,
        verification_url: str
    ) -> Dict[str, Any]:
        """
        Send account verification email (future implementation)

        Args:
            to: User email
            user_name: User's full name
            verification_url: URL with verification token

        Returns:
            Response from Resend API
        """
        subject = "Verify your Admitly account"

        html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 24px;">Welcome to Admitly!</h1>
            </div>

            <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
                <p style="font-size: 16px; margin-bottom: 20px;">Hi {user_name},</p>

                <p style="font-size: 16px; margin-bottom: 20px;">
                    Thank you for signing up for Admitly! To complete your registration, please verify your email address.
                </p>

                <div style="text-align: center; margin: 30px 0;">
                    <a href="{verification_url}"
                       style="background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                        Verify Email Address
                    </a>
                </div>

                <p style="font-size: 14px; color: #6b7280; margin-top: 20px;">
                    If you didn't create an account with Admitly, please ignore this email.
                </p>

                <p style="font-size: 14px; color: #6b7280; margin-top: 20px;">
                    Best regards,<br>
                    <strong>The Admitly Team</strong>
                </p>
            </div>

            <div style="background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; border-top: none;">
                <p style="font-size: 12px; color: #9ca3af; margin: 5px 0;">
                    Admitly - Nigeria's Premier Educational Data Platform
                </p>
                <p style="font-size: 12px; color: #9ca3af; margin: 5px 0;">
                    <a href="https://admitly.com.ng" style="color: #3b82f6; text-decoration: none;">admitly.com.ng</a> |
                    <a href="mailto:{self.support_email}" style="color: #3b82f6; text-decoration: none;">{self.support_email}</a>
                </p>
            </div>
        </body>
        </html>
        """

        text = f"""
Hi {user_name},

Thank you for signing up for Admitly! To complete your registration, please verify your email address by clicking the link below:

{verification_url}

If you didn't create an account with Admitly, please ignore this email.

Best regards,
The Admitly Team
"""

        return await self.send_email(
            to=to,
            subject=subject,
            html=html,
            text=text
        )


# Singleton instance
email_service = EmailService()
