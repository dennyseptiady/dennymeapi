#!/bin/bash

# 🚀 Script Deployment API CMS DennyMe
# Untuk memudahkan proses deployment

echo "🚀 Starting deployment process..."

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Git repository not found. Initializing git..."
    git init
    git add .
    git commit -m "Initial commit"
fi

# Check for uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo "📝 Found uncommitted changes. Committing..."
    git add .
    read -p "Enter commit message: " commit_message
    git commit -m "$commit_message"
fi

echo "✅ Git repository is ready for deployment"

echo ""
echo "🎯 Choose deployment platform:"
echo "1. Railway (Recommended - Free)"
echo "2. Heroku (Paid)"
echo "3. Vercel (Serverless - Free)"
echo "4. Manual (I'll do it myself)"

read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        echo "🚂 Railway deployment selected"
        echo "📋 Next steps:"
        echo "1. Push your code to GitHub/GitLab"
        echo "2. Go to https://railway.app"
        echo "3. Login with GitHub"
        echo "4. Create new project from your repository"
        echo "5. Add MySQL database service"
        echo "6. Set environment variables from env.production file"
        echo ""
        echo "💡 Would you like to push to GitHub now? (y/n)"
        read -p "Push to GitHub: " push_choice
        if [ "$push_choice" = "y" ] || [ "$push_choice" = "Y" ]; then
            echo "🔗 Make sure you have set up a GitHub repository and added it as remote origin"
            git push origin main
        fi
        ;;
    2)
        echo "🔺 Heroku deployment selected"
        echo "💰 Note: Heroku is a paid service now"
        echo "📋 Installing Heroku CLI..."
        npm install -g heroku
        echo "🔐 Please login to Heroku:"
        heroku login
        read -p "Enter your app name: " app_name
        heroku create $app_name
        echo "🗄️ Adding MySQL database..."
        heroku addons:create jawsdb:kitefin
        echo "⚙️ Setting environment variables..."
        heroku config:set NODE_ENV=production
        read -p "Enter JWT_SECRET: " jwt_secret
        heroku config:set JWT_SECRET=$jwt_secret
        heroku config:set JWT_EXPIRES_IN=24h
        echo "🚀 Deploying to Heroku..."
        git push heroku main
        ;;
    3)
        echo "▲ Vercel deployment selected"
        echo "📋 Installing Vercel CLI..."
        npm install -g vercel
        echo "🚀 Starting Vercel deployment..."
        vercel
        echo "✅ Set environment variables in Vercel dashboard"
        echo "💡 Remember to add a MySQL database service"
        ;;
    4)
        echo "📖 Manual deployment selected"
        echo "📋 Please refer to DEPLOYMENT.md for detailed instructions"
        ;;
    *)
        echo "❌ Invalid choice. Please run the script again."
        exit 1
        ;;
esac

echo ""
echo "✅ Deployment script completed!"
echo "📚 Check DEPLOYMENT.md for more detailed instructions"
echo "🔍 Don't forget to test your API after deployment!" 