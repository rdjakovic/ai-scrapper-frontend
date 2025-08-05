#!/usr/bin/env node

/**
 * Build verification script
 * Checks build output for common issues and optimizations
 */

const fs = require('fs');
const path = require('path');

const DIST_DIR = path.join(__dirname, '..', 'dist');
const MAX_CHUNK_SIZE = 1024 * 1024; // 1MB
const MAX_TOTAL_SIZE = 5 * 1024 * 1024; // 5MB

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function getFileSize(filePath) {
  try {
    return fs.statSync(filePath).size;
  } catch (error) {
    return 0;
  }
}

function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      getAllFiles(filePath, fileList);
    } else {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

function checkBuild() {
  console.log('🔍 Checking build output...\n');
  
  // Check if dist directory exists
  if (!fs.existsSync(DIST_DIR)) {
    console.error('❌ Build directory not found:', DIST_DIR);
    process.exit(1);
  }
  
  // Get all files
  const allFiles = getAllFiles(DIST_DIR);
  const jsFiles = allFiles.filter(f => f.endsWith('.js'));
  const cssFiles = allFiles.filter(f => f.endsWith('.css'));
  const assetFiles = allFiles.filter(f => !f.endsWith('.js') && !f.endsWith('.css') && !f.endsWith('.html'));
  
  let totalSize = 0;
  let issues = [];
  
  console.log('📊 Build Analysis:');
  console.log('==================');
  
  // Analyze JavaScript files
  console.log('\n📦 JavaScript Files:');
  jsFiles.forEach(file => {
    const size = getFileSize(file);
    totalSize += size;
    const relativePath = path.relative(DIST_DIR, file);
    
    console.log(`  ${relativePath}: ${formatBytes(size)}`);
    
    if (size > MAX_CHUNK_SIZE) {
      issues.push(`Large JS chunk: ${relativePath} (${formatBytes(size)})`);
    }
  });
  
  // Analyze CSS files
  console.log('\n🎨 CSS Files:');
  cssFiles.forEach(file => {
    const size = getFileSize(file);
    totalSize += size;
    const relativePath = path.relative(DIST_DIR, file);
    
    console.log(`  ${relativePath}: ${formatBytes(size)}`);
  });
  
  // Analyze asset files
  console.log('\n🖼️  Asset Files:');
  assetFiles.forEach(file => {
    const size = getFileSize(file);
    totalSize += size;
    const relativePath = path.relative(DIST_DIR, file);
    
    console.log(`  ${relativePath}: ${formatBytes(size)}`);
  });
  
  console.log('\n📈 Summary:');
  console.log('===========');
  console.log(`Total files: ${allFiles.length}`);
  console.log(`JavaScript files: ${jsFiles.length}`);
  console.log(`CSS files: ${cssFiles.length}`);
  console.log(`Asset files: ${assetFiles.length}`);
  console.log(`Total size: ${formatBytes(totalSize)}`);
  
  // Check for required files
  const requiredFiles = ['index.html', 'manifest.json'];
  console.log('\n✅ Required Files:');
  requiredFiles.forEach(file => {
    const filePath = path.join(DIST_DIR, file);
    const exists = fs.existsSync(filePath);
    console.log(`  ${file}: ${exists ? '✅' : '❌'}`);
    
    if (!exists) {
      issues.push(`Missing required file: ${file}`);
    }
  });
  
  // Check for optimization issues
  if (totalSize > MAX_TOTAL_SIZE) {
    issues.push(`Total bundle size too large: ${formatBytes(totalSize)} (max: ${formatBytes(MAX_TOTAL_SIZE)})`);
  }
  
  // Check for source maps in production
  const sourceMaps = allFiles.filter(f => f.endsWith('.map'));
  if (process.env.NODE_ENV === 'production' && sourceMaps.length > 0) {
    issues.push(`Source maps found in production build: ${sourceMaps.length} files`);
  }
  
  // Report issues
  if (issues.length > 0) {
    console.log('\n⚠️  Issues Found:');
    console.log('================');
    issues.forEach(issue => {
      console.log(`  ⚠️  ${issue}`);
    });
    
    if (issues.some(issue => issue.includes('Missing required file'))) {
      console.log('\n❌ Build verification failed due to missing required files');
      process.exit(1);
    } else {
      console.log('\n⚠️  Build completed with warnings');
      process.exit(0);
    }
  } else {
    console.log('\n✅ Build verification passed!');
    console.log('All checks completed successfully.');
    process.exit(0);
  }
}

// Run the check
checkBuild();