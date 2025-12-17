"""
Test the new Member ID format: MID-yyyy-mm-dd-numericalid
"""
from datetime import datetime
import random

def generate_member_id():
    """Generate Member ID in format: MID-yyyy-mm-dd-numericalid"""
    now = datetime.now()
    date_part = now.strftime('%Y-%m-%d')
    # Generate unique numerical ID using timestamp + random number
    numerical_id = int(now.timestamp() * 1000) % 100000 + random.randint(1000, 9999)
    return f"MID-{date_part}-{numerical_id}"

# Generate 5 sample Member IDs
print("=" * 60)
print("NEW MEMBER ID FORMAT: MID-yyyy-mm-dd-numericalid")
print("=" * 60)
print("\nSample Member IDs:")
for i in range(5):
    member_id = generate_member_id()
    print(f"{i+1}. {member_id}")

print("\nFormat Breakdown:")
print("  - MID: Prefix")
print("  - yyyy-mm-dd: Current date")
print("  - numericalid: Unique 5-digit number (timestamp + random)")
print("\nExample: MID-2025-11-03-87432")
print("=" * 60)
