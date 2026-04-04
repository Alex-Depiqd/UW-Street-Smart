#!/bin/bash

# UW Street Smart NL Tracker - Installation Script

echo "🚀 Setting up UW Street Smart NL Tracker..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed."
    echo "Please install Node.js from https://nodejs.org/"
    echo "Or use Homebrew: brew install node"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed."
    echo "Please install npm (usually comes with Node.js)"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully!"
    
    echo ""
    echo "🎉 Setup complete! You can now run the app:"
    echo "   npm run dev"
    echo ""
    echo "Then open http://localhost:3000 in your browser"
    echo ""
    echo "📱 To test PWA features:"
    echo "   - Use Chrome/Edge for best PWA support"
    echo "   - Look for the install prompt"
    echo "   - Test offline functionality"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi 