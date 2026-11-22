# OptAIn Career AI: Netlify test build

A working test website: free scan, Job Fit Report, Career Discovery Interview, three CV styles, prep pack, panel interview and Career Progress. Claude runs on a server function, so your API key never reaches the browser.

## What's in the folder

| Path | What it does |
| --- | --- |
| `public/*.html` | The website: Home, How it works, For institutions, About, FAQ, Privacy Policy (POPIA), Terms of Use |
| `public/assets/` | Styles, script, self-hosted fonts (Sora, Instrument Sans; SIL Open Font Licence), favicons, social preview image and product screenshots |
| `public/app/index.html` | The working app, opened by every "Get started" button |
| `netlify/functions/ai.mjs` | Sends prompts to Claude and streams the answer back (`/api/ai`) |
| `netlify/functions/health.mjs` | Tells the app whether live AI is switched on (`/api/health`) |
| `netlify.toml` | Netlify settings |

## Before you go live: replace the placeholders

- **Privacy Policy and Terms:** search `privacy.html` and `terms.html` for the yellow-highlighted `[...]` items (company legal name, registration number, address, Information Officer name, email and phone, enquiry retention period). Have both pages reviewed by a lawyer before full launch.
- **Domain, main-site link and email:** these are set at the top of the site build script and appear in every page: `https://careers.optain.co.za` (canonical and share links), `https://optain.co.za` (the "An OptAIn product" link) and `hello@optain.co.za` (contact). Search and replace them across `public/*.html` if yours differ.
- **Testimonials:** the home page has a hidden testimonials section. When pilot users give permission, add their quotes in `index.html` (search for `testimonials`) and remove the `hidden` attribute. Never use invented quotes.

## Connect your own domain (e.g. careers.optain.co.za)

1. In Netlify, open the site, then *Domain management → Add a domain*, and enter `careers.optain.co.za`.
2. At the company that manages `optain.co.za` (your DNS host), add a **CNAME** record: name `careers`, value `your-site-name.netlify.app` (Netlify shows the exact value).
3. Back in Netlify, wait for DNS to verify (minutes to a few hours), then under *HTTPS* click *Verify DNS configuration* and *Provision certificate*. Netlify issues a free SSL certificate.
4. Set it as the primary domain so the `.netlify.app` address redirects to it.

## Deploy in 4 steps

1. **Get a Claude API key** at console.anthropic.com. Set a monthly spend limit there before you share the link.
2. **Deploy the folder.** Netlify Drop (drag-and-drop) does **not** run functions, so use one of these:
   - **GitHub (easiest to update):** push this folder to a GitHub repository. In Netlify, choose *Add new site → Import an existing project* and pick the repository. Leave the build command empty; `netlify.toml` sets everything else.
   - **Netlify CLI:** run `npm install -g netlify-cli`, then `netlify login`, then `netlify deploy --prod` inside this folder.
3. **Add environment variables** in *Site configuration → Environment variables*:

   | Variable | Required | Example | Purpose |
   | --- | --- | --- | --- |
   | `ANTHROPIC_API_KEY` | Yes | `sk-ant-...` | Your Claude API key |
   | `ACCESS_CODE` | Strongly advised | `OPTAIN-PILOT-26` | Testers must enter it before any AI runs |
   | `CLAUDE_MODEL` | No | `claude-sonnet-5-5` | Model for scans, reports and CVs |
   | `CLAUDE_MODEL_QUICK` | No | `claude-haiku-5-5` | Faster model for interview turns |
   | `RATE_PER_MIN` | No | `30` | AI requests allowed per visitor per minute |

4. **Turn on form collection** for the institutions enquiry form: *Forms → Enable form detection*. Enquiries then appear under *Forms* in Netlify, and you can set email notifications there.
5. **Redeploy** (*Deploys → Trigger deploy*) so the variables take effect. The badge at the top of the site turns from *Demo mode* to *Live AI*.

## Test checklist

- [ ] Open the site in Chrome on a laptop and enter the access code when asked
- [ ] Run *Improve my CV* with a real CV (Word, PDF or pasted text)
- [ ] Run *I have a job in mind* with a real advert
- [ ] Coach speaks the questions; the microphone captures answers (Chrome asks for mic permission once)
- [ ] All three CV styles appear; switching style updates the CV and the change log
- [ ] The Job Fit follow-ups feed a tailored CV
- [ ] The prep pack and panel interview run, and the report scores each answer
- [ ] *Delete my CV...* clears everything

## Before you go public

- **Fill the placeholders** in `privacy.html`: registered company name and number, Information Officer name and email.
- **Review the About page** wording about you before publishing.
- **Add a custom domain** in *Domain management* (for example careerai.optain.co.za). Netlify adds HTTPS automatically.

## Know before you share

- **Data:** nothing is stored. Everything lives in the browser tab and disappears on refresh. CV text is sent to Claude only to produce results.
- **POPIA:** add your privacy notice and consent wording before inviting anyone outside a small, known pilot group.
- **Not yet real:** payments (simulated), Word/PDF downloads, ElevenLabs voice (Chrome's built-in voice stands in), live job feeds and course links (examples only).
- **Voice languages:** typed answers work in any language. Spoken answers use Chrome's recognition: South African English by default, plus isiZulu and Afrikaans where Chrome supports them. Test each language before promising it.
- **Cost per full journey:** about 15 Claude calls (scan, report, about 7 interview turns, 3 CV styles, prep pack, panel). Check real spend in the Anthropic console after your first 10 testers.
