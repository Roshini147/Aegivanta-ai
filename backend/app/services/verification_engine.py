from typing import Tuple, List, Optional
from app.models.entities import TaskStatus, EvidenceClassification, VerificationEvidence

class VerificationEngine:
    """
    Core Verification Rule Evaluator.
    Enforces non-negotiable hackathon integrity rules:
    - Never mark a task VERIFIED without valid evidence and an appropriate verification rule.
    - Accurately label simulated evidence.
    - If evidence is missing or ambiguous, designate UNABLE_TO_VERIFY.
    """

    @staticmethod
    def evaluate_task_verification(
        current_status: str,
        requested_status: str,
        evidence_list: List[VerificationEvidence],
        completion_method: str = "manual_user_attestation"
    ) -> Tuple[str, str, str]:
        """
        Returns: (final_status, classification, reason)
        """
        # If moving to COMPLETED, that is acceptable as self-reported completion
        if requested_status == TaskStatus.COMPLETED.value:
            return (
                TaskStatus.COMPLETED.value,
                "SELF_REPORTED",
                "Task completion recorded by user or routine agent check."
            )

        # If moving to ACTION_REQUIRED or PENDING
        if requested_status in [TaskStatus.PENDING.value, TaskStatus.ACTION_REQUIRED.value]:
            return (
                requested_status,
                "STATUS_UPDATE",
                f"Status explicitly set to {requested_status}."
            )

        # If requested status is VERIFIED
        if requested_status == TaskStatus.VERIFIED.value:
            if not evidence_list or len(evidence_list) == 0:
                return (
                    TaskStatus.UNABLE_TO_VERIFY.value,
                    EvidenceClassification.INSUFFICIENT.value,
                    "REJECTED: Cannot mark VERIFIED without persistent verification evidence. Reverted to UNABLE_TO_VERIFY."
                )

            # Check evidence classifications
            direct_evidence = [e for e in evidence_list if e.classification == EvidenceClassification.DIRECT_EVIDENCE.value]
            simulated_items = [e for e in evidence_list if e.is_simulated]

            if direct_evidence:
                if len(simulated_items) == len(evidence_list):
                    # All evidence is simulated
                    return (
                        TaskStatus.VERIFIED.value,
                        EvidenceClassification.DIRECT_EVIDENCE.value,
                        "VERIFIED (SIMULATION AUDIT): Supported by simulated telemetry data."
                    )
                return (
                    TaskStatus.VERIFIED.value,
                    EvidenceClassification.DIRECT_EVIDENCE.value,
                    "VERIFIED: Satisfies criteria with direct physical or photographic attestation."
                )
            
            corroborative = [e for e in evidence_list if e.classification == EvidenceClassification.CORROBORATIVE.value]
            if len(corroborative) >= 2:
                return (
                    TaskStatus.VERIFIED.value,
                    EvidenceClassification.CORROBORATIVE.value,
                    "VERIFIED: Satisfies criteria via multiple independent corroborative records."
                )

            return (
                TaskStatus.UNABLE_TO_VERIFY.value,
                EvidenceClassification.INSUFFICIENT.value,
                "UNABLE_TO_VERIFY: Available evidence is insufficient for full verification."
            )

        # If requesting UNABLE_TO_VERIFY directly
        if requested_status == TaskStatus.UNABLE_TO_VERIFY.value:
            return (
                TaskStatus.UNABLE_TO_VERIFY.value,
                EvidenceClassification.INSUFFICIENT.value,
                "Task marked as UNABLE_TO_VERIFY due to incomplete or contradictory data."
            )

        return (requested_status, "UNKNOWN", "Default transition applied.")

    @staticmethod
    def classify_new_evidence(
        evidence_type: str,
        description: str,
        source: str,
        is_simulated: bool
    ) -> str:
        """
        Classifies incoming evidence into DIRECT_EVIDENCE, CORROBORATIVE, or INSUFFICIENT.
        """
        if not description or len(description.strip()) < 5:
            return EvidenceClassification.INSUFFICIENT.value

        evidence_type_upper = evidence_type.upper()
        
        if "PHOTO" in evidence_type_upper or "TIMESTAMPED_PHOTO" in evidence_type_upper:
            return EvidenceClassification.DIRECT_EVIDENCE.value
        
        if "SENSOR" in evidence_type_upper or "TELEMETRY" in evidence_type_upper:
            return EvidenceClassification.DIRECT_EVIDENCE.value
            
        if "DOUBLE_CHECK" in evidence_type_upper or "TWO_PARTY" in evidence_type_upper:
            return EvidenceClassification.CORROBORATIVE.value

        if "USER_ATTESTATION" in evidence_type_upper:
            return EvidenceClassification.CORROBORATIVE.value

        return EvidenceClassification.INSUFFICIENT.value
