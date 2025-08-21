// Test script to verify TypeScript module exports
import { readFileSync } from 'fs';
import { parse } from '@typescript-eslint/parser';

console.log('Testing TypeScript exports...\n');

// Read the types file
const typesContent = readFileSync('./src/types/index.ts', 'utf-8');

// Simple regex to find exports
const exportPattern = /export\s+(interface|type|class|enum)\s+(\w+)/g;
const exports = [];
let match;

while ((match = exportPattern.exec(typesContent)) !== null) {
  exports.push({
    kind: match[1],
    name: match[2]
  });
}

console.log('Found exports in types/index.ts:');
exports.forEach(exp => {
  console.log(`  - ${exp.kind} ${exp.name}`);
});

// Check if AIInsight is exported
const hasAIInsight = exports.some(exp => exp.name === 'AIInsight');
console.log(`\n✅ AIInsight export found: ${hasAIInsight}`);

// Read the api.ts file
const apiContent = readFileSync('./src/services/api.ts', 'utf-8');

// Find imports
const importPattern = /import\s+{([^}]+)}\s+from\s+['"]([^'"]+)['"]/g;
const apiImports = [];

while ((match = importPattern.exec(apiContent)) !== null) {
  const importedItems = match[1].split(',').map(item => item.trim());
  apiImports.push({
    items: importedItems,
    from: match[2]
  });
}

console.log('\nImports in services/api.ts:');
apiImports.forEach(imp => {
  if (imp.from.includes('types')) {
    console.log(`  From ${imp.from}:`);
    imp.items.forEach(item => {
      const isExported = exports.some(exp => exp.name === item);
      const status = isExported ? '✅' : '❌';
      console.log(`    ${status} ${item}`);
    });
  }
});

// Summary
console.log('\n📊 Summary:');
console.log(`Total exports: ${exports.length}`);
console.log(`All required types are exported: ${hasAIInsight ? 'YES' : 'NO'}`);