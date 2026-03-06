#!/usr/bin/env node
/**
 * setup-bgremoval.js
 *
 * Downloads @imgly/background-removal and uploads all dist files to R2
 * so the P2M Pipeline can self-host the AI background removal library.
 *
 * Usage:
 *   cd C:\Users\ccasperslocal\Documents\_Claude\opsflowbetter\worker
 *   node setup-bgremoval.js
 *
 * Prerequisites:
 *   - Node.js installed
 *   - Your R2 upload secret (you'll be prompted)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const https = require('https');
const http = require('http');
const readline = require('readline');

const R2_UPLOAD_API = 'https://api.opsflowbetter.com/upload/';
const R2_PREFIX = 'libs/bgremoval/';
const PACKAGE_NAME = '@imgly/background-removal';
const PACKAGE_VERSION = '1.5.5';
const DATA_PACKAGE = '@imgly/background-removal-data';

// ── Helpers ──────────────────────────────────────────────────────────

function ask(question) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    return new Promise(resolve => rl.question(question, ans => { rl.close(); resolve(ans.trim()); }));
}

function uploadFile(filePath, r2Key, secret) {
    return new Promise((resolve, reject) => {
        const fileData = fs.readFileSync(filePath);
        const ext = path.extname(filePath).toLowerCase();

        // Determine content type
        const contentTypes = {
            '.js': 'application/javascript',
            '.mjs': 'application/javascript',
            '.wasm': 'application/wasm',
            '.onnx': 'application/octet-stream',
            '.json': 'application/json',
            '.map': 'application/json',
        };
        const contentType = contentTypes[ext] || 'application/octet-stream';

        const url = new URL(R2_UPLOAD_API + r2Key);
        const options = {
            hostname: url.hostname,
            port: 443,
            path: url.pathname,
            method: 'PUT',
            headers: {
                'Content-Type': contentType,
                'Content-Length': fileData.length,
                'X-Upload-Secret': secret,
            },
        };

        const req = https.request(options, res => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    try {
                        const json = JSON.parse(body);
                        resolve(json);
                    } catch {
                        resolve({ ok: true, status: res.statusCode });
                    }
                } else {
                    reject(new Error(`HTTP ${res.statusCode}: ${body}`));
                }
            });
        });
        req.on('error', reject);
        req.write(fileData);
        req.end();
    });
}

function getAllFiles(dir, baseDir) {
    baseDir = baseDir || dir;
    let results = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            results = results.concat(getAllFiles(fullPath, baseDir));
        } else {
            results.push({
                fullPath,
                relativePath: path.relative(baseDir, fullPath).replace(/\\/g, '/'),
            });
        }
    }
    return results;
}

// ── Main ─────────────────────────────────────────────────────────────

async function main() {
    console.log('');
    console.log('╔══════════════════════════════════════════════════╗');
    console.log('║  OpsFlowBetter — AI Background Removal Setup    ║');
    console.log('║  Self-host @imgly/background-removal on R2      ║');
    console.log('╚══════════════════════════════════════════════════╝');
    console.log('');

    // Get secret
    const secret = await ask('Enter your R2 upload secret: ');
    if (!secret) {
        console.error('No secret provided. Aborting.');
        process.exit(1);
    }

    // Verify Worker is reachable
    console.log('\n[1/5] Checking Worker health...');
    try {
        execSync('curl -sf https://api.opsflowbetter.com/health', { stdio: 'pipe' });
        console.log('  ✓ Worker is online');
    } catch {
        console.warn('  ⚠ Could not reach Worker — continuing anyway');
    }

    // Create temp directory
    const tmpDir = path.join(__dirname, '_bgremoval_tmp');
    if (fs.existsSync(tmpDir)) {
        fs.rmSync(tmpDir, { recursive: true });
    }
    fs.mkdirSync(tmpDir);

    // Install packages
    console.log('\n[2/5] Installing npm packages (this may take a minute)...');
    try {
        execSync(`npm install ${PACKAGE_NAME}@${PACKAGE_VERSION} --prefix "${tmpDir}"`, {
            stdio: 'inherit',
            cwd: tmpDir,
        });
        console.log('  ✓ Package installed');
    } catch (err) {
        console.error('  ✗ npm install failed:', err.message);
        process.exit(1);
    }

    // Locate dist files
    console.log('\n[3/5] Collecting files to upload...');

    const distDir = path.join(tmpDir, 'node_modules', '@imgly', 'background-removal', 'dist');
    if (!fs.existsSync(distDir)) {
        console.error('  ✗ dist directory not found at', distDir);
        process.exit(1);
    }

    // Collect all dist files
    let files = getAllFiles(distDir);
    console.log(`  Found ${files.length} files in dist/`);

    // Also check for model data package
    const dataDir = path.join(tmpDir, 'node_modules', '@imgly', 'background-removal-data');
    if (fs.existsSync(dataDir)) {
        const dataDistDir = path.join(dataDir, 'dist');
        if (fs.existsSync(dataDistDir)) {
            const dataFiles = getAllFiles(dataDistDir);
            // Prefix these with 'data/' to keep them organized
            files = files.concat(dataFiles.map(f => ({
                fullPath: f.fullPath,
                relativePath: 'data/' + f.relativePath,
            })));
            console.log(`  Found ${dataFiles.length} files in background-removal-data/dist/`);
        }
    }

    // Filter to relevant files only
    const validExts = ['.js', '.mjs', '.wasm', '.onnx', '.json', '.map'];
    files = files.filter(f => validExts.includes(path.extname(f.fullPath).toLowerCase()));
    console.log(`  ${files.length} files to upload after filtering`);

    // Upload all files
    console.log('\n[4/5] Uploading to R2...');
    let uploaded = 0;
    let failed = 0;

    for (const file of files) {
        const r2Key = R2_PREFIX + file.relativePath;
        const size = fs.statSync(file.fullPath).size;
        const sizeMB = (size / 1024 / 1024).toFixed(2);

        process.stdout.write(`  Uploading ${r2Key} (${sizeMB} MB)... `);
        try {
            await uploadFile(file.fullPath, r2Key, secret);
            console.log('✓');
            uploaded++;
        } catch (err) {
            console.log('✗ ' + err.message);
            failed++;
        }
    }

    // Cleanup
    console.log('\n[5/5] Cleaning up temp files...');
    fs.rmSync(tmpDir, { recursive: true });
    console.log('  ✓ Temp files removed');

    // Summary
    console.log('\n══════════════════════════════════════════════════');
    console.log(`  Uploaded: ${uploaded}  |  Failed: ${failed}`);
    console.log(`  Base URL: https://images.opsflowbetter.com/${R2_PREFIX}`);
    console.log('══════════════════════════════════════════════════');

    if (failed === 0) {
        console.log('\n✓ All files uploaded! The P2M Pipeline will now use self-hosted AI.');
        console.log('  Test it at: https://opsflowbetter.com/p2m/');
    } else {
        console.log('\n⚠ Some files failed to upload. Re-run this script to retry.');
    }
}

main().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
