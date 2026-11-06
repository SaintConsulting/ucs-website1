# United Craftsman Services website

The website for United Craftsman Services, LLC, at **https://unitedcraftsman.com** (domain registered at Squarespace, site hosted on Vercel). Vercel and GitHub Pages both publish straight from this repository, so any change saved here goes live in about a minute.

## Change the About Us text or add a testimonial

1. Click **content.js** in the file list above.
2. Click the **pencil icon** (Edit) at the top right of the file.
3. Change the text between the backticks: `` `like this` ``. Apostrophes and quotes inside are fine.
4. Click **Commit changes**, then **Commit changes** again.

The notes inside `content.js` show exactly where each piece goes. The testimonials section stays hidden until you add the first one. Only post real reviews from real customers, with their permission, using first name and city only.

## Add project photos

1. **Prepare the photo.** Name it simply, with no spaces, like `dublin-deck-2027.jpg`. Make sure it doesn't show house numbers, faces, license plates or street signs. Photos around 1600 pixels wide load fastest.
2. **Upload it.** Click the **images** folder, then **Add file** > **Upload files**. Drag the photo in and click **Commit changes**.
3. **Put it on the site.** Go back, open **content.js**, click the pencil, and find the right section under `projects` (Concrete & Stone, Fences or Decks & Builds). Use the `gallery` list instead for the short homepage gallery. Copy one line from that list. Paste it at the top of the list, so the newest photo comes first, and fill in:
   - `file`: the photo's file name
   - `alt`: what the photo shows, for people using screen readers (required)
   - `caption`: the short label shown on the photo
4. Click **Commit changes**.

If the photo doesn't show up, check that the file name in `content.js` matches the uploaded file exactly, including capital letters and `.jpg` vs `.jpeg`.

## If something breaks

Every change is saved in the history, so nothing is lost. Click **Commits** (the clock icon near the top of the file list) to see past versions, or open content.js > **History** to see what changed.

The most common mistake is a missing comma or backtick in `content.js`. If a section goes blank after an edit, look at the line you changed.

## Files

| File | What it is |
|---|---|
| `index.html` | The homepage |
| `reviews.html` | The Reviews page. Reviews come from `content.js`. |
| `projects.html` | The Projects page (Concrete & Stone, Fences, Decks & Builds). Photos are listed under `projects` in `content.js`. |
| `content.js` | About text, testimonials and project photo list. **Edit this one.** |
| `images/` | Logo and project photos |
| `privacy.html`, `terms.html`, `accessibility.html` | Legal pages |
| `site.js` | Cookie banner and Google Analytics. Add the measurement ID here once you have it. |
| `legal.css` | Styling for the legal pages |
| `api/ghl-lead.js` | Runs on Vercel. Sends a copy of each quote request to GoHighLevel (contact + opportunity in "Sean's Leads" > "New Lead"). Uses the `GHL_API_TOKEN` and `GHL_LOCATION_ID` settings in Vercel; never put the token in this file. |

## Quote form

Quote requests go to the UCS Google Form and appear in Google Forms and Sheets. A copy also goes to GoHighLevel through `api/ghl-lead.js` on Vercel; if that copy fails, the Google Form still gets the request. If you change questions or answer choices in the Google Form, the website form needs a matching update, or those answers won't come through.
