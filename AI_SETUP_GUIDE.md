# AI Features Setup Guide

## Enabling Gemini AI Recommendations

The Project Planner uses Google's Gemini AI to provide intelligent project recommendations. Follow these steps to enable this feature:

### Step 1: Get Your API Key

1. Visit: [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click **"Create API Key"** button
4. Select **"Create API key in new project"** (or existing project)
5. Copy the generated API key

### Step 2: Configure Environment Variables

1. Open the `.env.local` file in your project root:
   ```
   SMART-TALENT-ALLOCATOR/.env.local
   ```

2. Replace the placeholder with your actual API key:
   ```
   VITE_GEMINI_API_KEY=your_actual_api_key_here
   ```

   Example:
   ```
   VITE_GEMINI_API_KEY=AIzaSyDh3xZ4k9L2m3N4o5P6q7R8s9T0u1V2w3X4
   ```

### Step 3: Restart Development Server

1. Stop your development server (Ctrl+C)
2. Start it again:
   ```bash
   npm run dev
   ```

### Step 4: Test the Feature

1. Navigate to the Project Planner page
2. Drag any project card to the drop zone
3. Wait for AI suggestions to generate

## How It Works

### For Completed Projects
- Drag completed projects to get post-project recommendations about:
  - Next steps and documentation
  - Team recognition strategies
  - Lessons learned
  - Resource reallocation
  - Success metrics

### For Ongoing Projects  
- Drag active projects to get efficiency suggestions about:
  - Resource optimization
  - Timeline management
  - Risk mitigation
  - Team coordination
  - Performance tracking

## Troubleshooting

### Error: "Gemini API key not found"
- Make sure `.env.local` file exists in project root
- Verify the file contains: `VITE_GEMINI_API_KEY=your_key`
- Restart your development server after editing `.env.local`

### Error: "API permission denied"
- Your API key may be invalid or expired
- Try generating a new API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
- Update `.env.local` with the new key
- Restart your development server

### Error: "API quota exceeded"
- You've hit the API usage limit
- Wait a few minutes and try again
- Check your API quota at [Google AI Studio](https://makersuite.google.com/app/apikey)

## Security Notes

- **Never commit `.env.local` to version control** - it contains your API key
- Keep your API key secret and don't share it
- The API key is only used server-side during development
- Each project can have API key restrictions for security

## Features Enabled

✅ AI-powered project recommendations  
✅ Role-based suggestions (Manager vs Employee)  
✅ Context-aware recommendations based on project status  
✅ Team member skill and availability considerations  

## Support

For more information about Google's Gemini API:
- [Google AI Documentation](https://ai.google.dev)
- [API Reference](https://ai.google.dev/docs/api)
