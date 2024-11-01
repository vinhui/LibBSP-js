const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const indexFilePath = path.join(srcDir, 'index.ts');

// Function to recursively get all TypeScript files in a directory
function getFiles(dir) {
    const files = fs.readdirSync(dir);
    let result = [];

    files.forEach(file => {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            result = result.concat(getFiles(filePath));
        } else if (file.endsWith('.ts') && file !== 'index.ts') {
            const relativePath = path.relative(srcDir, filePath).replace(/\\/g, '/');
            result.push(relativePath.replace('.ts', ''));
        }
    });

    return result;
}

// Generate index file content
const filesToExport = getFiles(srcDir).map(file => `export * from './${file}';`).join('\n');
fs.writeFileSync(indexFilePath, filesToExport, 'utf8');

console.log('Index file generated successfully!');
