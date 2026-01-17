"""
Home Care Auto Billing - Comprehensive Test Script
Tests all critical functions and edge cases
"""

import sys
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta
import calendar

# Add parent directory to path
sys.path.append('.')

from homecare_service import (
    calculate_next_billing_date,
    is_billing_due_today,
    calculate_homecare_revenue,
    parse_date,
    format_date
)

def test_calculate_next_billing_date():
    """Test billing date calculation with edge cases"""
    print("\n" + "="*60)
    print("TEST 1: Billing Date Calculation")
    print("="*60)
    
    test_cases = [
        {
            "name": "Join on 31st Jan → Bill on 28th Feb (non-leap)",
            "service_start": datetime(2025, 1, 31),
            "reference": datetime(2025, 1, 31),
            "expected_day": 28,
            "expected_month": 2
        },
        {
            "name": "Join on 31st Jan → Bill on 29th Feb (leap year)",
            "service_start": datetime(2024, 1, 31),
            "reference": datetime(2024, 1, 31),
            "expected_day": 29,
            "expected_month": 2
        },
        {
            "name": "Join on 30th Jan → Bill on 28th Feb",
            "service_start": datetime(2025, 1, 30),
            "reference": datetime(2025, 1, 30),
            "expected_day": 28,
            "expected_month": 2
        },
        {
            "name": "Join on 15th → Bill on 15th next month",
            "service_start": datetime(2025, 1, 15),
            "reference": datetime(2025, 1, 15),
            "expected_day": 15,
            "expected_month": 2
        },
        {
            "name": "Join on 29th Jan → Bill on 28th Feb (non-leap)",
            "service_start": datetime(2025, 1, 29),
            "reference": datetime(2025, 1, 29),
            "expected_day": 28,
            "expected_month": 2
        }
    ]
    
    passed = 0
    failed = 0
    
    for test in test_cases:
        result = calculate_next_billing_date(test["service_start"], test["reference"])
        expected_date = datetime(result.year, test["expected_month"], test["expected_day"])
        
        if result.day == test["expected_day"] and result.month == test["expected_month"]:
            print(f"✅ PASS: {test['name']}")
            print(f"   Expected: {test['expected_day']}/{test['expected_month']}, Got: {result.day}/{result.month}")
            passed += 1
        else:
            print(f"❌ FAIL: {test['name']}")
            print(f"   Expected: {test['expected_day']}/{test['expected_month']}, Got: {result.day}/{result.month}")
            failed += 1
    
    print(f"\nResults: {passed} passed, {failed} failed")
    return failed == 0


def test_is_billing_due_today():
    """Test billing due date logic"""
    print("\n" + "="*60)
    print("TEST 2: Billing Due Today Check")
    print("="*60)
    
    today = datetime.now().date()
    
    test_cases = [
        {
            "name": "First billing - service started 1 month ago on same day",
            "service_start": datetime.now() - relativedelta(months=1),
            "last_billed": None,
            "expected": True
        },
        {
            "name": "Not due - last billed yesterday",
            "service_start": datetime.now() - relativedelta(months=2),
            "last_billed": datetime.now() - timedelta(days=1),
            "expected": False
        },
        {
            "name": "Due - last billed exactly 1 month ago",
            "service_start": datetime.now() - relativedelta(months=2),
            "last_billed": datetime.now() - relativedelta(months=1),
            "expected": True
        }
    ]
    
    passed = 0
    failed = 0
    
    for test in test_cases:
        result = is_billing_due_today(test["service_start"], test["last_billed"])
        
        if result == test["expected"]:
            print(f"✅ PASS: {test['name']}")
            print(f"   Expected: {test['expected']}, Got: {result}")
            passed += 1
        else:
            print(f"❌ FAIL: {test['name']}")
            print(f"   Expected: {test['expected']}, Got: {result}")
            failed += 1
    
    print(f"\nResults: {passed} passed, {failed} failed")
    return failed == 0


def test_revenue_calculation():
    """Test revenue calculation"""
    print("\n" + "="*60)
    print("TEST 3: Revenue Calculation")
    print("="*60)
    
    test_cases = [
        {
            "name": "Basic calculation",
            "home_care": 10000,
            "nursing": 2000,
            "discount": 500,
            "expected": 11500
        },
        {
            "name": "No discount",
            "home_care": 15000,
            "nursing": 3000,
            "discount": 0,
            "expected": 18000
        },
        {
            "name": "No nursing charges",
            "home_care": 12000,
            "nursing": 0,
            "discount": 1000,
            "expected": 11000
        },
        {
            "name": "All zeros",
            "home_care": 0,
            "nursing": 0,
            "discount": 0,
            "expected": 0
        }
    ]
    
    passed = 0
    failed = 0
    
    for test in test_cases:
        result = calculate_homecare_revenue(
            test["home_care"],
            test["nursing"],
            test["discount"]
        )
        
        if result == test["expected"]:
            print(f"✅ PASS: {test['name']}")
            print(f"   Expected: ₹{test['expected']}, Got: ₹{result}")
            passed += 1
        else:
            print(f"❌ FAIL: {test['name']}")
            print(f"   Expected: ₹{test['expected']}, Got: ₹{result}")
            failed += 1
    
    print(f"\nResults: {passed} passed, {failed} failed")
    return failed == 0


def test_date_parsing():
    """Test date parsing with various formats"""
    print("\n" + "="*60)
    print("TEST 4: Date Parsing")
    print("="*60)
    
    test_cases = [
        {
            "name": "DD/MM/YYYY format",
            "input": "22/01/2025",
            "should_parse": True
        },
        {
            "name": "DD-MM-YYYY format",
            "input": "22-01-2025",
            "should_parse": True
        },
        {
            "name": "DD-MM-YYYY HH:MM format",
            "input": "22-01-2025 10:30",
            "should_parse": True
        },
        {
            "name": "Invalid format",
            "input": "invalid-date",
            "should_parse": False
        },
        {
            "name": "Empty string",
            "input": "",
            "should_parse": False
        }
    ]
    
    passed = 0
    failed = 0
    
    for test in test_cases:
        result = parse_date(test["input"])
        parsed = result is not None
        
        if parsed == test["should_parse"]:
            print(f"✅ PASS: {test['name']}")
            print(f"   Input: '{test['input']}', Parsed: {parsed}")
            passed += 1
        else:
            print(f"❌ FAIL: {test['name']}")
            print(f"   Input: '{test['input']}', Expected parse: {test['should_parse']}, Got: {parsed}")
            failed += 1
    
    print(f"\nResults: {passed} passed, {failed} failed")
    return failed == 0


def run_all_tests():
    """Run all test suites"""
    print("\n" + "="*60)
    print("HOME CARE AUTO BILLING - COMPREHENSIVE TEST SUITE")
    print("="*60)
    
    results = []
    
    results.append(("Billing Date Calculation", test_calculate_next_billing_date()))
    results.append(("Billing Due Today Check", test_is_billing_due_today()))
    results.append(("Revenue Calculation", test_revenue_calculation()))
    results.append(("Date Parsing", test_date_parsing()))
    
    print("\n" + "="*60)
    print("FINAL RESULTS")
    print("="*60)
    
    all_passed = True
    for test_name, passed in results:
        status = "✅ PASSED" if passed else "❌ FAILED"
        print(f"{status}: {test_name}")
        if not passed:
            all_passed = False
    
    print("\n" + "="*60)
    if all_passed:
        print("🎉 ALL TESTS PASSED!")
    else:
        print("⚠️  SOME TESTS FAILED - REVIEW REQUIRED")
    print("="*60)
    
    return all_passed


if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)
