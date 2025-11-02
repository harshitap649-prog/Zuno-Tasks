#!/usr/bin/env node

/**
 * Quick Deploy Script - Deploy to Netlify Right Now!
 * 
 * Usage:
 *   1. npm install -g netlify-cli (one time only)
 *   2. node deploy-now.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Quick Deploy to Netlify...\n');

// Step 1: Check if dist folder exists
console.log('📦 Step 1: Checking build folder...');
if (!fs.existsSync('dist')) {
  console.log('⚠️  dist folder not found. Building project...');
  try {
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✅ Build complete!\n');
  } catch (error) {
    console.error('❌ Build failed!');
    console.error('Please run: npm run build');
    process.exit(1);
  }
} else {
  console.log('✅ dist folder exists!\n');
}

// Step 2: Check if Netlify CLI is installed
console.log('🔧 Step 2: Checking Netlify CLI...');
try {
  execSync('netlify --version', { stdio: 'ignore' });
  console.log('✅ Netlify CLI is installed!\n');
} catch (error) {
  console.log('⚠️  Netlify CLI not found. Installing...');
  try {
    execSync('npm install -g netlify-cli', { stdio: 'inherit' });
    console.log('✅ Netlify CLI installed!\n');
  } catch (installError) {
    console.error('❌ Failed to install Netlify CLI.');
    console.error('Please run: npm install -g netlify-cli');
    process.exit(1);
  }
}

// Step 3: Deploy
console.log('🌐 Step 3: Deploying to Netlify...\n');
console.log('📝 Note: If this is your first time, you\'ll need to:');
console.log('   1. Login to Netlify (netlify login)');
console.log('   2. Initialize site (netlify init) or link existing site\n');

try {
  // Try to deploy
  console.log('Deploying...\n');
  execSync('netlify deploy --prod --dir=dist', { stdio: 'inherit' });
  console.log('\n✅ Deployment complete!');
  console.log('🎉 Your site is now live!');
} catch (error) {
  console.error('\n❌ Deployment failed!');
  console.error('\n🔧 Quick Fix Options:');
  console.error('1. First time? Run: netlify login');
  console.error('2. Need to create site? Run: netlify init');
  console.error('3. Link existing site? Run: netlify link');
  console.error('\nThen run this script again!');
  process.exit(1);
}

