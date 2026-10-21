from typing import List, Dict, Any, Optional
import re

class DeterministicPlanner:
    """
    Local, deterministic rule-based safety planner.
    Operates without paid APIs or external network dependencies, ensuring 100% reliable local demo execution.
    Distinguishes recommendations from confirmed authoritative records.
    """

    @staticmethod
    def generate_task_templates(
        user_request: str,
        duration_days: int = 7,
        context: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        ctx = context or {}
        req_lower = user_request.lower()
        
        # Extract duration from prompt if mentioned (e.g. "two weeks" -> 14, "5 days" -> 5)
        parsed_days = duration_days
        if "two weeks" in req_lower or "2 weeks" in req_lower:
            parsed_days = 14
        elif "one week" in req_lower or "1 week" in req_lower:
            parsed_days = 7
        elif "month" in req_lower:
            parsed_days = 30
        else:
            match = re.search(r'(\d+)\s*days?', req_lower)
            if match:
                parsed_days = int(match.group(1))

        tasks: List[Dict[str, Any]] = []

        # 1. DOORS & PERIMETER (Crucial for all departures)
        tasks.append({
            "title": "Inspect and Deadbolt All Exterior Doors",
            "description": "Engage primary deadbolts on front entry, back patio door, and garage entry. Verify strike plates have no loose screws.",
            "category": "Doors & Perimeter",
            "priority": "CRITICAL"
        })
        tasks.append({
            "title": "Secure Sliding Glass Doors with Safety Bar",
            "description": "Place physical security pin or wooden dowel track bar into sliding glass patio tracks to prevent forced bypass.",
            "category": "Doors & Perimeter",
            "priority": "HIGH"
        })

        # 2. WINDOWS & LATCHES
        tasks.append({
            "title": "Check Ground Floor Windows and Latches",
            "description": "Verify all ground-level and basement hopper windows are locked and sash locks are securely engaged.",
            "category": "Windows & Latches",
            "priority": "HIGH"
        })

        # 3. PLUMBING & WATER SAFETY
        if parsed_days >= 3:
            tasks.append({
                "title": "Turn Off Main Water Supply or Appliance Cutoffs",
                "description": "Shut off main water valve or individual supply lines to washing machine, dishwashers, and ice makers to prevent catastrophic leaks while unattended.",
                "category": "Plumbing & Appliances",
                "priority": "CRITICAL"
            })
            tasks.append({
                "title": "Switch Water Heater to Vacation / Eco Mode",
                "description": "Set water heater thermostat to low vacation setting to prevent energy waste and unnecessary heating cycles.",
                "category": "Plumbing & Appliances",
                "priority": "MEDIUM"
            })
        else:
            tasks.append({
                "title": "Check Faucets and Under-Sink Pipes",
                "description": "Inspect kitchen and bathroom vanity supplies for active weeping, moisture, or running toilets.",
                "category": "Plumbing & Appliances",
                "priority": "MEDIUM"
            })

        # 4. APPLIANCE & ELECTRICAL SAFETY
        tasks.append({
            "title": "Unplug High-Draw Non-Essential Small Electronics",
            "description": "Unplug toasters, coffee machines, electric space heaters, and desktop equipment to eliminate phantom draw and surge ignition hazards.",
            "category": "Plumbing & Appliances",
            "priority": "MEDIUM"
        })

        # 5. LIGHTING & VISIBILITY TIMERS
        tasks.append({
            "title": "Configure Smart Lighting Schedules for Occupied Appearance",
            "description": "Schedule living room and master bedroom lights to cycle naturally between 6:30 PM and 10:30 PM to avoid a visibly dark home.",
            "category": "Lighting & Security",
            "priority": "HIGH"
        })

        # 6. HVAC & ENVIRONMENT
        winter_risk = ctx.get("winter_freeze_risk", False) or "winter" in req_lower or "freeze" in req_lower or "cold" in req_lower
        if winter_risk:
            tasks.append({
                "title": "Set Thermostat Minimum to 58°F (Freeze Protection)",
                "description": "Keep furnace active at minimum 58°F (14°C) to prevent pipe freezing in crawl spaces or exterior wall cavities.",
                "category": "HVAC & Energy",
                "priority": "CRITICAL"
            })
            tasks.append({
                "title": "Open Vanity Cabinets on Exterior Walls",
                "description": "Allow ambient home warmth to circulate directly around enclosed plumbing pipe lines.",
                "category": "HVAC & Energy",
                "priority": "HIGH"
            })
        else:
            tasks.append({
                "title": "Set Thermostat to Departure Eco Schedule",
                "description": "Set cooling to 78°F or heating to 62°F to preserve indoor air quality without wasted utility cost.",
                "category": "HVAC & Energy",
                "priority": "LOW"
            })

        # 7. PLANTS & PETS
        has_pets = ctx.get("has_pets", False) or "pet" in req_lower or "dog" in req_lower or "cat" in req_lower
        has_plants = ctx.get("has_plants", True) or "plant" in req_lower or "garden" in req_lower

        if has_pets:
            tasks.append({
                "title": "Confirm Pet Sitting / Boarding Schedule and Food Supply",
                "description": "Verify caregiver visit times, food portions, medication schedules, and veterinarian authorization letter.",
                "category": "Pets & Household",
                "priority": "CRITICAL"
            })
        
        if has_plants:
            tasks.append({
                "title": "Arrange Plant Hydration / Irrigation Reservoirs",
                "description": "Water indoor plants thoroughly; arrange capillary watering wicks or self-watering stakes for the duration away.",
                "category": "Pets & Household",
                "priority": "LOW"
            })

        # 8. MAIL & EMERGENCY CONTACT
        if parsed_days >= 7:
            tasks.append({
                "title": "Submit Postal Hold Request or Designate Mail Pickup",
                "description": "Prevent overflowing mailbox from broadcasting vacancy by scheduling USPS hold or neighbor pickup.",
                "category": "Security & Logistics",
                "priority": "HIGH"
            })

        tasks.append({
            "title": "Designate Trusted Keyholder and Emergency Contact",
            "description": "Provide a trusted local contact with spare key, alarm code, and contact information for home emergencies.",
            "category": "Security & Logistics",
            "priority": "CRITICAL"
        })

        return tasks
