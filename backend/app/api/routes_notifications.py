from typing import List
from fastapi import APIRouter, HTTPException
from app.database.session import SyncSessionLocal
from app.models.entities import Notification
from app.schemas.payloads import NotificationResponse, NotificationCreate
import uuid

router = APIRouter(prefix="/api/notifications", tags=["Notifications"])

@router.get("", response_model=List[NotificationResponse])
def get_notifications():
    db = SyncSessionLocal()
    try:
        notifs = db.query(Notification).order_by(Notification.created_at.desc()).limit(30).all()
        # If no notifications exist yet, seed a couple of realistic initial events
        if len(notifs) == 0:
            seed_notifs = [
                Notification(
                    id=str(uuid.uuid4()),
                    title="Departure Plan Active",
                    message="Plan 'Trip to Chennai' initialized with 12 home safeguard tasks.",
                    category="SUCCESS",
                    link_tab="dashboard",
                    is_read=False
                ),
                Notification(
                    id=str(uuid.uuid4()),
                    title="Security Verification Pending",
                    message="Exterior doors and windows await physical attestation or smart lock confirmation.",
                    category="WARNING",
                    link_tab="verification",
                    is_read=False
                )
            ]
            for sn in seed_notifs:
                db.add(sn)
            db.commit()
            notifs = db.query(Notification).order_by(Notification.created_at.desc()).limit(30).all()

        return [
            NotificationResponse(
                id=n.id,
                title=n.title,
                message=n.message,
                category=n.category,
                link_tab=n.link_tab,
                is_read=n.is_read,
                created_at=n.created_at
            )
            for n in notifs
        ]
    finally:
        db.close()

@router.post("", response_model=NotificationResponse)
def create_notification(payload: NotificationCreate):
    db = SyncSessionLocal()
    try:
        notif = Notification(
            id=str(uuid.uuid4()),
            title=payload.title,
            message=payload.message,
            category=payload.category,
            link_tab=payload.link_tab,
            is_read=False
        )
        db.add(notif)
        db.commit()
        db.refresh(notif)
        return NotificationResponse(
            id=notif.id,
            title=notif.title,
            message=notif.message,
            category=notif.category,
            link_tab=notif.link_tab,
            is_read=notif.is_read,
            created_at=notif.created_at
        )
    finally:
        db.close()

@router.patch("/{notification_id}/read")
def mark_notification_read(notification_id: str):
    db = SyncSessionLocal()
    try:
        notif = db.query(Notification).filter(Notification.id == notification_id).first()
        if not notif:
            raise HTTPException(status_code=404, detail="Notification not found")
        notif.is_read = True
        db.commit()
        return {"success": True, "id": notification_id}
    finally:
        db.close()

@router.post("/mark-all-read")
def mark_all_read():
    db = SyncSessionLocal()
    try:
        db.query(Notification).update({"is_read": True})
        db.commit()
        return {"success": True, "message": "All notifications marked as read."}
    finally:
        db.close()

@router.delete("/{notification_id}")
def delete_notification(notification_id: str):
    db = SyncSessionLocal()
    try:
        notif = db.query(Notification).filter(Notification.id == notification_id).first()
        if not notif:
            raise HTTPException(status_code=404, detail="Notification not found")
        db.delete(notif)
        db.commit()
        return {"success": True, "id": notification_id}
    finally:
        db.close()
