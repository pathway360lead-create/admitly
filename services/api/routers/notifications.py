"""
Notifications Router
API endpoints for email notifications and alerts
"""
import logging
from fastapi import APIRouter, Depends, Query
from supabase import Client

from services.notification_service import NotificationService
from services.email_service import EmailService
from services.search_service import SearchService
from core.dependencies import (
    get_supabase,
    get_email_service,
    get_search_service,
    get_current_admin_user
)

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/admin/notifications",
    tags=["notifications"],
)


def get_notification_service(
    supabase: Client = Depends(get_supabase),
    email_service: EmailService = Depends(get_email_service),
    search_service: SearchService = Depends(get_search_service),
) -> NotificationService:
    """Get notification service instance"""
    return NotificationService(supabase, email_service, search_service)


@router.post(
    "/process-saved-searches",
    summary="Process all saved searches",
    description="""
**Admin Only:** Process all active saved searches with notifications enabled.

Checks each saved search for new results and sends email notifications
to users when new programs match their criteria.

**Authentication Required:** JWT Bearer token with admin role

**Response:**
Returns counts of:
- checked: Total saved searches checked
- sent: Notifications successfully sent
- failed: Notifications that failed

**Use Cases:**
- Manual trigger for testing
- Recovery after system downtime
- Debugging notification issues

**Scheduling:**
This endpoint should be called periodically (e.g., daily at 8 AM)
via a cron job or task scheduler.

**Error Handling:**
- Continues processing even if individual notifications fail
- Logs all errors for debugging
- Returns counts for monitoring

**Example Response:**
```json
{
  "message": "Processed 45 saved searches",
  "checked": 45,
  "sent": 12,
  "failed": 2
}
```
""",
)
async def process_saved_searches(
    service: NotificationService = Depends(get_notification_service),
    current_user = Depends(get_current_admin_user),
):
    """
    Process all saved searches and send notifications

    Admin endpoint to manually trigger notification processing.
    Should be called periodically via scheduled task.
    """
    result = await service.process_all_saved_searches()

    return {
        "message": f"Processed {result['checked']} saved searches",
        "checked": result["checked"],
        "sent": result["sent"],
        "failed": result["failed"],
    }


@router.post(
    "/send-deadline-alerts",
    summary="Send deadline alerts",
    description="""
**Admin Only:** Send application deadline alerts to users.

Finds programs with upcoming deadlines and sends email alerts
to users who have bookmarked those programs.

**Authentication Required:** JWT Bearer token with admin role

**Query Parameters:**
- **days_before**: Send alerts for deadlines within N days (default: 7)

**Business Logic:**
- Queries programs with deadlines in next N days
- Finds users who bookmarked each program
- Sends personalized email alerts
- Different urgency levels based on days remaining:
  - 1-3 days: 🔴 URGENT
  - 4-7 days: ⚠️ REMINDER

**Response:**
Returns counts of alerts sent and failed

**Scheduling:**
Recommended schedule:
- Daily at 8 AM: 7 days before
- Daily at 8 AM: 3 days before
- Daily at 8 AM: 1 day before

**Example Response:**
```json
{
  "message": "Sent 28 deadline alerts",
  "sent": 28,
  "failed": 1
}
```
""",
)
async def send_deadline_alerts(
    days_before: int = Query(
        7,
        ge=1,
        le=30,
        description="Send alerts for deadlines within this many days"
    ),
    service: NotificationService = Depends(get_notification_service),
    current_user = Depends(get_current_admin_user),
):
    """
    Send deadline alerts for upcoming application deadlines

    Admin endpoint to manually trigger deadline alerts.
    Should be called periodically via scheduled task.
    """
    result = await service.send_deadline_alerts(days_before=days_before)

    return {
        "message": f"Sent {result['sent']} deadline alerts",
        "sent": result["sent"],
        "failed": result["failed"],
    }


@router.post(
    "/test-email",
    summary="Test email delivery",
    description="""
**Admin Only:** Send a test email to verify Resend configuration.

Sends a simple test email to the specified address to verify
that the Resend API integration is working correctly.

**Authentication Required:** JWT Bearer token with admin role

**Query Parameters:**
- **to**: Email address to send test email to

**Response:**
Returns success status and Resend email ID

**Use Cases:**
- Verify Resend API key is valid
- Test email deliverability
- Debug email template rendering

**Example Response:**
```json
{
  "message": "Test email sent successfully",
  "email_id": "re_abc123xyz",
  "to": "test@example.com"
}
```
""",
)
async def test_email(
    to: str = Query(..., description="Email address to send test to"),
    email_service: EmailService = Depends(get_email_service),
    current_user = Depends(get_current_admin_user),
):
    """
    Send a test email to verify email service configuration

    Admin endpoint for testing email delivery.
    """
    try:
        html = """
        <!DOCTYPE html>
        <html>
        <body style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>🎓 Admitly Email Test</h2>
            <p>This is a test email from the Admitly platform.</p>
            <p>If you received this email, the Resend integration is working correctly!</p>
            <hr>
            <p style="font-size: 12px; color: #666;">
                Sent from Admitly API<br>
                <a href="https://admitly.com.ng">admitly.com.ng</a>
            </p>
        </body>
        </html>
        """

        response = await email_service.send_email(
            to=to,
            subject="Admitly Email Test",
            html=html,
            text="This is a test email from Admitly. If you received this, the email service is working!"
        )

        return {
            "message": "Test email sent successfully",
            "email_id": response.get("id"),
            "to": to,
        }

    except Exception as e:
        logger.error(f"Failed to send test email: {e}")
        return {
            "message": "Failed to send test email",
            "error": str(e),
            "to": to,
        }
