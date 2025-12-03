"""
Notification Service
Background tasks for checking saved searches and sending email notifications
"""
import logging
from typing import List, Dict, Any
from datetime import datetime, timezone, timedelta
from supabase import Client
from services.email_service import EmailService
from services.search_service import SearchService
import meilisearch

logger = logging.getLogger(__name__)


class NotificationService:
    """
    Service for sending automated notifications

    Features:
    - Check saved searches for new results
    - Send email notifications when new programs match
    - Track notification history
    """

    def __init__(
        self,
        supabase: Client,
        email_service: EmailService,
        search_service: SearchService
    ):
        self.supabase = supabase
        self.email_service = email_service
        self.search_service = search_service

    async def check_saved_search_for_new_results(
        self,
        saved_search_id: str
    ) -> Dict[str, Any]:
        """
        Check if a saved search has new results since last notification

        Args:
            saved_search_id: ID of saved search to check

        Returns:
            Dict with has_new_results, new_count, and results preview
        """
        try:
            # Get saved search
            saved_search_response = (
                self.supabase.table("user_saved_searches")
                .select("*")
                .eq("id", saved_search_id)
                .is_("deleted_at", "null")
                .execute()
            )

            if not saved_search_response.data:
                logger.warning(f"Saved search {saved_search_id} not found")
                return {"has_new_results": False, "new_count": 0}

            saved_search = saved_search_response.data[0]

            # Check if notifications are enabled
            if not saved_search.get("notify_on_new_results", False):
                return {"has_new_results": False, "new_count": 0}

            # Get last notified timestamp or created timestamp
            last_notified = saved_search.get("last_notified_at") or saved_search["created_at"]
            last_notified_dt = datetime.fromisoformat(last_notified.replace("Z", "+00:00"))

            # Execute search
            query = saved_search["query"]
            filters = saved_search.get("filters", {})

            # Convert filters to Meilisearch format
            search_filters = []
            if filters.get("state"):
                search_filters.append(f"state IN {filters['state']}")
            if filters.get("type"):
                search_filters.append(f"type IN {filters['type']}")
            if filters.get("degree_type"):
                search_filters.append(f"degree_type IN {filters['degree_type']}")

            filter_string = " AND ".join(search_filters) if search_filters else None

            # Search programs
            search_results = self.search_service.search(
                query=query,
                index="programs",
                filter_string=filter_string,
                limit=100
            )

            # Filter results by created_at > last_notified
            new_results = []
            for hit in search_results.get("hits", []):
                program_created = hit.get("created_at")
                if program_created:
                    program_created_dt = datetime.fromisoformat(
                        program_created.replace("Z", "+00:00")
                    )
                    if program_created_dt > last_notified_dt:
                        new_results.append(hit)

            new_count = len(new_results)

            return {
                "has_new_results": new_count > 0,
                "new_count": new_count,
                "results": new_results[:5],  # Preview of first 5
                "saved_search": saved_search
            }

        except Exception as e:
            logger.error(f"Error checking saved search {saved_search_id}: {e}")
            return {"has_new_results": False, "new_count": 0}

    async def send_saved_search_notification(
        self,
        saved_search_id: str
    ) -> bool:
        """
        Check saved search and send notification if there are new results

        Args:
            saved_search_id: ID of saved search

        Returns:
            True if notification was sent, False otherwise
        """
        try:
            # Check for new results
            check_result = await self.check_saved_search_for_new_results(saved_search_id)

            if not check_result["has_new_results"]:
                logger.info(f"No new results for saved search {saved_search_id}")
                return False

            saved_search = check_result["saved_search"]
            new_results = check_result["results"]
            new_count = check_result["new_count"]

            # Get user details
            user_id = saved_search["user_id"]
            user_response = (
                self.supabase.table("user_profiles")
                .select("full_name, email")
                .eq("id", user_id)
                .is_("deleted_at", "null")
                .execute()
            )

            if not user_response.data:
                logger.warning(f"User {user_id} not found for notification")
                return False

            user = user_response.data[0]
            user_name = user.get("full_name", "Student")
            user_email = user.get("email")

            if not user_email:
                logger.warning(f"No email for user {user_id}")
                return False

            # Build results preview
            results_preview = []
            for result in new_results:
                results_preview.append({
                    "name": result.get("name", "Unknown Program"),
                    "institution": result.get("institution_name", "Unknown Institution"),
                    "state": result.get("state", "Unknown")
                })

            # Build search URL
            search_url = f"https://admitly.com.ng/saved-searches/{saved_search_id}/results"

            # Send email
            await self.email_service.send_saved_search_notification(
                to=user_email,
                user_name=user_name,
                search_name=saved_search["name"],
                search_query=saved_search["query"],
                new_results_count=new_count,
                results_preview=results_preview,
                search_url=search_url
            )

            # Update last_notified_at
            now = datetime.now(timezone.utc).isoformat()
            self.supabase.table("user_saved_searches").update({
                "last_notified_at": now
            }).eq("id", saved_search_id).execute()

            logger.info(
                f"Sent notification for saved search {saved_search_id} "
                f"to {user_email}: {new_count} new results"
            )
            return True

        except Exception as e:
            logger.error(f"Error sending notification for saved search {saved_search_id}: {e}")
            return False

    async def process_all_saved_searches(self) -> Dict[str, int]:
        """
        Process all active saved searches with notifications enabled

        Returns:
            Dict with counts of checked, sent, and failed notifications
        """
        try:
            # Get all active saved searches with notifications enabled
            response = (
                self.supabase.table("user_saved_searches")
                .select("id")
                .eq("notify_on_new_results", True)
                .is_("deleted_at", "null")
                .execute()
            )

            saved_searches = response.data

            checked = 0
            sent = 0
            failed = 0

            for saved_search in saved_searches:
                checked += 1
                try:
                    notification_sent = await self.send_saved_search_notification(
                        saved_search["id"]
                    )
                    if notification_sent:
                        sent += 1
                except Exception as e:
                    logger.error(f"Failed to process saved search {saved_search['id']}: {e}")
                    failed += 1

            logger.info(
                f"Processed {checked} saved searches: "
                f"{sent} notifications sent, {failed} failed"
            )

            return {
                "checked": checked,
                "sent": sent,
                "failed": failed
            }

        except Exception as e:
            logger.error(f"Error processing saved searches: {e}")
            return {"checked": 0, "sent": 0, "failed": 0}

    async def send_deadline_alerts(
        self,
        days_before: int = 7
    ) -> Dict[str, int]:
        """
        Send deadline alerts for upcoming application deadlines

        Args:
            days_before: Send alerts for deadlines within this many days

        Returns:
            Dict with counts of alerts sent
        """
        try:
            # Calculate deadline threshold
            now = datetime.now(timezone.utc)
            threshold = now + timedelta(days=days_before)

            # Get programs with upcoming deadlines
            response = (
                self.supabase.table("programs")
                .select("id, name, institution_id, application_deadline")
                .lte("application_deadline", threshold.isoformat())
                .gte("application_deadline", now.isoformat())
                .eq("status", "published")
                .is_("deleted_at", "null")
                .execute()
            )

            programs = response.data

            sent = 0
            failed = 0

            for program in programs:
                try:
                    # Get users who bookmarked this program
                    bookmarks = (
                        self.supabase.table("user_bookmarks")
                        .select("user_id")
                        .eq("entity_type", "program")
                        .eq("entity_id", program["id"])
                        .is_("deleted_at", "null")
                        .execute()
                    )

                    for bookmark in bookmarks.data:
                        user_id = bookmark["user_id"]

                        # Get user details
                        user_response = (
                            self.supabase.table("user_profiles")
                            .select("full_name, email")
                            .eq("id", user_id)
                            .is_("deleted_at", "null")
                            .execute()
                        )

                        if not user_response.data:
                            continue

                        user = user_response.data[0]
                        user_email = user.get("email")

                        if not user_email:
                            continue

                        # Get institution name
                        institution_response = (
                            self.supabase.table("institutions")
                            .select("name")
                            .eq("id", program["institution_id"])
                            .execute()
                        )

                        institution_name = "Unknown Institution"
                        if institution_response.data:
                            institution_name = institution_response.data[0]["name"]

                        # Calculate days remaining
                        deadline_dt = datetime.fromisoformat(
                            program["application_deadline"].replace("Z", "+00:00")
                        )
                        days_remaining = (deadline_dt - now).days

                        # Send deadline alert
                        await self.email_service.send_deadline_alert(
                            to=user_email,
                            user_name=user.get("full_name", "Student"),
                            program_name=program["name"],
                            institution_name=institution_name,
                            deadline_date=deadline_dt,
                            days_remaining=days_remaining,
                            application_url=f"https://admitly.com.ng/programs/{program['id']}"
                        )

                        sent += 1

                except Exception as e:
                    logger.error(f"Failed to send deadline alert for program {program['id']}: {e}")
                    failed += 1

            logger.info(f"Sent {sent} deadline alerts, {failed} failed")

            return {"sent": sent, "failed": failed}

        except Exception as e:
            logger.error(f"Error sending deadline alerts: {e}")
            return {"sent": 0, "failed": 0}
