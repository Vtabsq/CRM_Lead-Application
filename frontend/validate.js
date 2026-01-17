const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'AdmissionRegistration.jsx');
const content = fs.readFileSync(filePath, 'utf8');

// Count braces
let openBraces = 0;
let closeBraces = 0;
let openParens = 0;
let closeParens = 0;

const lines = content.split('\n');

lines.forEach((line, index) => {
    for (let char of line) {
        if (char === '{') openBraces++;
        if (char === '}') closeBraces++;
        if (char === '(') openParens++;
        if (char === ')') closeParens++;
    }
    
    // Check for problematic patterns around line 541
    if (index >= 535 && index <= 550) {
        console.log(`Line ${index + 1}: ${line.substring(0, 100)}`);
    }
});

console.log('\n=== Brace Count ===');
console.log(`Open braces: ${openBraces}`);
console.log(`Close braces: ${closeBraces}`);
console.log(`Difference: ${openBraces - closeBraces}`);

console.log('\n=== Parenthesis Count ===');
console.log(`Open parens: ${openParens}`);
console.log(`Close parens: ${closeParens}`);
console.log(`Difference: ${openParens - closeParens}`);
