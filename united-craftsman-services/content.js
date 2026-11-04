/* ================================================================
   UNITED CRAFTSMAN SERVICES: WEBSITE CONTENT
   ----------------------------------------------------------------
   Edit the text in this file to update the website. You don't need
   to touch index.html.

   Rules that keep the site working:
   - Text goes between the backticks: `like this`. Apostrophes and
     "quotes" inside are fine. Just don't type a backtick ` yourself.
   - Every item in a list ends with a comma.
   - Save, then refresh the page to see the change.
   ================================================================ */

window.UCS_CONTENT = {

  /* ---------------- ABOUT US ---------------- */
  about: {
    heading: `Two generations of craftsmanship`,

    // The larger opening line.
    intro: `For more than 50 years, the Hundley family has built homes and outdoor spaces people are proud to come home to.`,

    // One entry per paragraph. Add or remove paragraphs as needed.
    paragraphs: [
      `It started with Steve Hundley, a master builder and custom home builder who began in the trade in 1970. In 2005, he founded United Craftsman Services, a full-scope remodeling company built on hard work, honest service, and a craftsman's eye for detail.`,
      `In 2018, his son Sean Hundley took the lead. Raised on job sites watching his father work, Sean carries that same standard into every project. A musician, artist, and literature graduate, he brings a creative vision to our work in outdoor living and home additions, creating spaces designed around the way you live, not just built to a plan.`,
      `To us, craftsmanship is a form of service. We listen first, communicate clearly, and treat your home as if it were our own. With over 1,000 projects completed since 2005, we're proud to be a fully licensed and insured team you can trust for years to come.`,
    ],

    serviceArea: `Proudly serving Dublin, Westerville, Powell, Worthington, and the surrounding areas.`,

    buttonText: `Request a Free Consultation`,

    // The three numbers under the About text.
    stats: [
      { number: `1970`,   label: `In the trade since` },
      { number: `2005`,   label: `UCS founded` },
      { number: `1,000+`, label: `Projects completed` },
    ],
  },

  /* ---------------- TESTIMONIALS & REVIEWS ----------------
     These show on the Reviews page (reviews.html). The first 3 also show
     on the homepage once at least one is added.

     Only post real reviews from real customers, with their permission.
     Use first name and city only (see terms.html). If you copy a review
     from Google or Facebook, copy it word for word and set "source".

     To add one, copy this block, paste it at the TOP of the list
     inside the [ ] below (newest first), and fill it in:

       {
         quote: `What the customer said.`,
         name: `First name`,
         location: `Dublin, OH`,
         project: `Stamped concrete patio`,
         stars: 5,              // 1 to 5, or delete this line
         source: `Google`,      // where it was posted, or delete this line
       },
  */
  testimonials: [
  ],

  /* Links for the "Leave a review" buttons on the Reviews page.
     Paste the link between the backticks. A button only appears once its
     link is filled in.
       Google: in your Google Business Profile, click "Ask for reviews" and
               copy the link.
       Facebook: your page's address followed by /reviews  */
  reviewLinks: {
    google: ``,
    facebook: ``,
  },

  /* ---------------- PROJECT PHOTOS ----------------
     To add a photo:
       1. Put the photo in the "images" folder. Use a simple file name with
          no spaces, like  dublin-deck-2027.jpg . Photos about 1600 pixels
          wide load fastest.
       2. Copy a line below and paste it at the TOP of the list (newest first).
       3. Fill in:
          file    - the file name
          alt     - what the photo shows, for people using screen readers.
                    Describe it plainly. This is required.
          caption - the short label shown on the photo.

     Before posting, make sure the photo doesn't show house numbers,
     street signs, license plates or people's faces.
  */
  gallery: [
    { file: `circle-patio.jpg`,           alt: `Circular flagstone-stamped concrete patio with chiseled border`,               caption: `Stamped concrete patio with circular seating area` },
    { file: `deck-pergola.jpg`,           alt: `Composite deck under a black louvered pergola with cedar privacy fence`,       caption: `Composite deck with louvered pergola` },
    { file: `patio-pavilion.jpg`,         alt: `Red stamped concrete patio beside a timber-framed pavilion behind a red house`, caption: `Stamped patio with timber pavilion` },
    { file: `front-porch-patio.jpg`,      alt: `Stamped concrete front patio with a rounded border leading to a covered porch`, caption: `Front entry patio with rounded border` },
    { file: `stamped-ashlar-patio.jpg`,   alt: `Close-up of ashlar-pattern stamped concrete with curved chiseled border`,      caption: `Ashlar stamp with chiseled border` },
    { file: `flagstone-patio-curves.jpg`, alt: `Curving gray flagstone-stamped patio wrapping a brick home`,                    caption: `Flagstone-stamped patio with curved edges` },
    { file: `deck-planters.jpg`,          alt: `Composite deck with built-in cedar planters and horizontal privacy fence`,     caption: `Deck with cedar planters & privacy screen` },
    { file: `stamped-walkway.jpg`,        alt: `Stamped concrete walkway with wood-grain stamped borders`,                     caption: `Stamped walkway with wood-grain border` },
    { file: `cedar-fence.jpg`,            alt: `Horizontal cedar privacy fence in a backyard`,                                 caption: `Horizontal cedar privacy fence` },
  ],

};
