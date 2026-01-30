# Deploying to Render

This guide covers deploying the Baseball Card Auto-Cropping API to Render.

## Prerequisites

1. GitHub repository with your code
2. Render account (free tier available at https://render.com)

## Deployment Steps

### 1. Create render.yaml

This file tells Render how to build and run your service. It's already included in the repository.

### 2. Connect to Render

1. Go to https://dashboard.render.com
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Select the repository containing this code

### 3. Configure the Service

Render will auto-detect the configuration from `render.yaml`, but verify:

- **Name**: `baseball-card-api` (or your choice)
- **Environment**: `Python 3`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn app:app --host 0.0.0.0 --port $PORT`
- **Instance Type**: Free (for testing) or Starter

### 4. Set Environment Variables

In the Render dashboard, add these environment variables:

```
ENVIRONMENT=production
SECRET_KEY=<generate-a-secure-random-key>
MAX_IMAGE_SIZE_MB=10
CROP_TIMEOUT_SECONDS=3
```

For Phase 2 (Google Photos), also add:
```
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
GOOGLE_REDIRECT_URI=https://your-app.onrender.com/api/auth/google/callback
```

### 5. Deploy

1. Click "Create Web Service"
2. Render will build and deploy your application
3. Once deployed, you'll get a URL like: `https://baseball-card-api.onrender.com`

## Testing the Deployment

### Health Check

```bash
curl https://your-app.onrender.com/health
```

Expected response:
```json
{
  "status": "healthy",
  "environment": "production",
  "version": "1.0.0"
}
```

### Test Image Cropping

```bash
curl -X POST "https://your-app.onrender.com/api/crop-image" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@test-card.jpg"
```

## Monitoring

1. **Logs**: Available in Render dashboard under "Logs" tab
2. **Metrics**: View response times, errors in "Metrics" tab
3. **Health Checks**: Render automatically pings `/health` endpoint

## Custom Domain (Optional)

1. Go to "Settings" in Render dashboard
2. Click "Add Custom Domain"
3. Follow DNS configuration instructions

## Troubleshooting

### Build Fails

- Check Python version compatibility (requires 3.9+)
- Verify all dependencies in `requirements.txt` are valid
- Check build logs in Render dashboard

### Service Not Starting

- Verify `PORT` environment variable is set correctly
- Check that start command matches: `uvicorn app:app --host 0.0.0.0 --port $PORT`
- Review application logs for errors

### Out of Memory

- OpenCV can be memory-intensive
- Upgrade to Starter tier or higher (512MB+ RAM recommended)
- Consider implementing request queuing for free tier

### Cold Starts

- Free tier spins down after inactivity
- First request after spin-down will be slow (30-60 seconds)
- Upgrade to paid tier for always-on instances

## Cost Optimization

### Free Tier
- 750 hours/month free
- Spins down after 15 minutes of inactivity
- Good for development/testing

### Starter Tier ($7/month)
- Always-on
- Better for production use
- Faster response times

## Security Checklist

- [ ] Set strong `SECRET_KEY` environment variable
- [ ] Use HTTPS (automatic with Render)
- [ ] Configure CORS appropriately for production
- [ ] Enable rate limiting (implement in Phase 2)
- [ ] Keep dependencies updated
- [ ] Don't commit `.env` file to repository

## Updating Your Deployment

Render auto-deploys when you push to your connected branch:

```bash
git add .
git commit -m "Update feature"
git push origin main
```

Or manually deploy from Render dashboard:
1. Go to your service
2. Click "Manual Deploy" → "Deploy latest commit"

## Support

For Render-specific issues, see: https://render.com/docs
For application issues, contact: bhimanieshan@gmail.com
