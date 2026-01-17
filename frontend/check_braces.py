with open('src/AdmissionRegistration.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

lines = content.split('\n')

# Track brace balance
brace_balance = 0
brace_history = []

for i, line in enumerate(lines, start=1):
    line_open = line.count('{')
    line_close = line.count('}')
    
    brace_balance += (line_open - line_close)
    
    # Track significant changes
    if line_open > 0 or line_close > 0:
        brace_history.append((i, brace_balance, line_open, line_close, line.strip()[:100]))

print(f"BRACE MISMATCH! Missing {brace_balance} closing brace(s)")
print("\nShowing last 30 brace changes:")
for item in brace_history[-30:]:
    line_num, balance, opens, closes, text = item
    indicator = " <-- PROBLEM?" if balance == 1 and closes > 0 else ""
    print(f"Line {line_num:4d}: balance={balance:3d} (+{opens} -{closes}) {text}{indicator}")
