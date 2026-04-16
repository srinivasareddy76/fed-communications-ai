#!/usr/bin/env node

console.log('=== Fed Communications AI Deployment Diagnostics ===\n');

// Check Node.js version
console.log('1. Node.js Version:');
console.log(`   Node: ${process.version}`);
console.log(`   Platform: ${process.platform}`);
console.log(`   Architecture: ${process.arch}\n`);

// Check required modules
console.log('2. Checking Dependencies:');
const requiredModules = [
  'express', 'cors', 'helmet', 'morgan', 'body-parser', 
  'socket.io', 'moment', 'lodash', 'sentiment', 'uuid'
];

requiredModules.forEach(module => {
  try {
    require(module);
    console.log(`   ✅ ${module} - OK`);
  } catch (error) {
    console.log(`   ❌ ${module} - MISSING`);
  }
});

// Check file system
console.log('\n3. Checking File System:');
const fs = require('fs');
const path = require('path');

const requiredFiles = [
  './server.js',
  './three-panel-app.js',
  './package.json',
  '../sample_data/communications.json',
  '../sample_data/response_templates.json'
];

requiredFiles.forEach(file => {
  try {
    const fullPath = path.resolve(__dirname, file);
    if (fs.existsSync(fullPath)) {
      const stats = fs.statSync(fullPath);
      console.log(`   ✅ ${file} - OK (${stats.size} bytes)`);
    } else {
      console.log(`   ❌ ${file} - NOT FOUND`);
    }
  } catch (error) {
    console.log(`   ❌ ${file} - ERROR: ${error.message}`);
  }
});

// Check sample data loading
console.log('\n4. Testing Sample Data Loading:');
try {
  const communicationsPath = path.join(__dirname, '../sample_data/communications.json');
  const templatesPath = path.join(__dirname, '../sample_data/response_templates.json');
  
  if (fs.existsSync(communicationsPath)) {
    const communications = JSON.parse(fs.readFileSync(communicationsPath, 'utf8'));
    console.log(`   ✅ Communications data loaded: ${communications.length} items`);
  } else {
    console.log('   ⚠️  Communications file not found, will use fallback data');
  }
  
  if (fs.existsSync(templatesPath)) {
    const templates = JSON.parse(fs.readFileSync(templatesPath, 'utf8'));
    console.log(`   ✅ Templates data loaded: ${templates.length} items`);
  } else {
    console.log('   ⚠️  Templates file not found, will use fallback data');
  }
} catch (error) {
  console.log(`   ❌ Error loading sample data: ${error.message}`);
}

// Test basic server functionality
console.log('\n5. Testing Basic Server Setup:');
try {
  const express = require('express');
  const app = express();
  
  app.get('/test', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
  });
  
  const server = app.listen(0, () => {
    const port = server.address().port;
    console.log(`   ✅ Express server test successful on port ${port}`);
    server.close();
  });
  
} catch (error) {
  console.log(`   ❌ Express server test failed: ${error.message}`);
}

// Environment check
console.log('\n6. Environment Variables:');
console.log(`   PORT: ${process.env.PORT || 'not set (will use 53788)'}`);
console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);

console.log('\n=== Diagnostics Complete ===');
console.log('\nIf you see any ❌ errors above, those need to be fixed before deployment.');
console.log('If all checks pass ✅, the issue might be platform-specific.');
