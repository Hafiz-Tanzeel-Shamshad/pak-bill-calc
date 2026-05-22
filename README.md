# PakBillCalc - Pakistan Electricity Bill Calculator

This is a static HTML website for estimating Pakistan electricity bills using NEPRA 2026 tariffs. It includes 12 calculators, 20 blog posts, and full legal pages for AdSense readiness.

## Project Structure
- `index.html` - main calculator homepage
- `calculators/` - DISCO and solar calculators
- `blog/` - 20 long-form SEO posts
- `assets/` - CSS, JS, and Open Graph image
- `sitemap.xml` and `robots.txt`

## Run Locally
Open `index.html` in your browser. For local hosting, use any static server:

```bash
# Example using Python
python -m http.server 8080
```

Then visit `http://localhost:8080`.

## Deploy (Netlify)
1. Create a new site in Netlify.
2. Drag and drop the project folder.
3. Set the site name and connect your custom domain.
4. Netlify will automatically serve the static files.

## Deploy (Vercel)
1. Create a new Vercel project.
2. Import the folder as a static site.
3. Set the root directory to the project folder.
4. Deploy and connect your custom domain.

## Google Search Console Setup
1. Visit Google Search Console and add your domain.
2. Verify ownership using the DNS TXT method.
3. After verification, submit the sitemap:
   - `https://pakbillcalc.online/sitemap.xml`
4. Monitor indexing status and fix any crawl errors.

## Google Analytics 4 Setup
1. Create a GA4 property in your Google account.
2. Replace `G-XXXXXXXXXX` with your actual GA4 measurement ID in all HTML files.
3. Verify tracking in the GA4 real-time dashboard.

## AdSense Application Steps
1. Make sure all 20 blog posts and 12 calculator pages are live.
2. Ensure legal pages are accessible and complete.
3. Remove all ad placeholders or keep them empty before approval.
4. Apply for AdSense at `https://www.google.com/adsense/`.
5. Once approved, insert AdSense code in the ad slots:
   - Top banner above calculators
   - Rectangle below results
   - In-article ad slot inside blog posts

## Notes
- Estimates are based on NEPRA 2026 base tariffs.
- Actual bills may vary due to FCA, QTA, and local surcharges.
