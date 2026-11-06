/* Vercel serverless function: sends each website quote request to GoHighLevel (API v2).

   The quote form still posts to the Google Form exactly as before. The page also sends a copy
   here, and this function:
     1. creates or updates the contact (name, phone, email, address) and adds a note with the
        rest of the form answers,
     2. creates an opportunity for that contact in the "Sean's Leads" pipeline, "New Lead" stage.
   Pipeline and stage IDs are looked up through the API by name, so renaming either one in
   GoHighLevel means updating PIPELINE_NAME / STAGE_NAME below.

   Needs two environment variables in Vercel: GHL_API_TOKEN and GHL_LOCATION_ID.
   The token needs these scopes: contacts.write, opportunities.readonly, opportunities.write.
   Never put the token in this file. */

const GHL_BASE = 'https://services.leadconnectorhq.com';
const GHL_VERSION = '2021-07-28';
const PIPELINE_NAME = "Sean's Leads";
const STAGE_NAME = 'New Lead';
const LEAD_SOURCE = 'Website quote form';

// Websites allowed to send leads here. Add the address here if the site moves to a new domain.
const ALLOWED_ORIGINS = [
  'https://saintconsulting.github.io',
  'https://ucs-website1.vercel.app',
  'https://unitedcraftsmen.com',
  'https://www.unitedcraftsmen.com',
];

module.exports = async function handler(req, res) {
  const origin = req.headers.origin || '';
  const allowed = ALLOWED_ORIGINS.includes(origin);
  if (allowed) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  }
  res.setHeader('Vary', 'Origin');

  if (req.method === 'OPTIONS') return res.status(allowed ? 204 : 403).end();
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, OPTIONS');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }
  if (!allowed) return res.status(403).json({ ok: false, error: 'Origin not allowed' });

  const token = process.env.GHL_API_TOKEN;
  const locationId = process.env.GHL_LOCATION_ID;
  if (!token || !locationId) {
    console.error('GHL_API_TOKEN or GHL_LOCATION_ID is not set in this Vercel environment');
    return res.status(500).json({ ok: false, error: 'Not configured' });
  }

  let lead;
  try {
    lead = readLead(req.body);
  } catch (e) {
    return res.status(400).json({ ok: false, error: e.message });
  }

  try {
    // Step 1: the contact
    const contactId = await upsertContact(token, locationId, lead);
    try {
      await addNote(token, contactId, lead);
    } catch (e) {
      console.error('GHL note failed (contact and opportunity still created):', e.message);
    }

    // Step 2: the opportunity
    const stage = await findPipelineStage(token, locationId);
    await createOpportunity(token, locationId, contactId, stage, lead);

    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error('GHL sync failed:', e.message);
    return res.status(502).json({ ok: false, error: 'Could not send to GoHighLevel' });
  }
};

// The page sends JSON as text/plain so the browser doesn't need a CORS preflight.
function readLead(body) {
  let data = body;
  if (Buffer.isBuffer(data)) data = data.toString('utf8');
  if (typeof data === 'string') {
    try { data = JSON.parse(data); } catch (e) { throw new Error('Invalid form data'); }
  }
  if (!data || typeof data !== 'object') throw new Error('Missing form data');

  const field = (key) => String(data[key] == null ? '' : data[key]).trim().slice(0, 2000);
  const lead = {
    name: field('name'),
    phone: field('phone'),
    email: field('email'),
    address: field('address'),
    project: field('project'),
    budget: field('budget'),
    timeline: field('timeline'),
    foundUs: field('foundUs'),
    extra: field('extra'),
  };
  if (!lead.name) throw new Error('Name is required');
  if (lead.phone.replace(/\D/g, '').length < 10) throw new Error('A phone number with area code is required');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email)) throw new Error('A valid email address is required');
  if (!lead.address) throw new Error('The project address is required');
  return lead;
}

async function ghl(token, method, path, body) {
  const headers = { Authorization: 'Bearer ' + token, Version: GHL_VERSION, Accept: 'application/json' };
  if (body) headers['Content-Type'] = 'application/json';
  const res = await fetch(GHL_BASE + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(10000),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(method + ' ' + path.split('?')[0] + ' returned ' + res.status + ': ' + text.slice(0, 300));
  try { return text ? JSON.parse(text) : {}; } catch (e) { return {}; }
}

async function upsertContact(token, locationId, lead) {
  const parts = lead.name.split(/\s+/);
  const firstName = parts.shift();
  const lastName = parts.join(' ');
  const zip = (lead.address.match(/\b\d{5}(?:-\d{4})?\b/) || [])[0];

  const contact = {
    locationId,
    name: lead.name,
    firstName,
    email: lead.email,
    phone: toE164(lead.phone),
    source: LEAD_SOURCE,
  };
  if (lastName) contact.lastName = lastName;
  if (zip) contact.postalCode = zip;
  if (lead.address !== zip) contact.address1 = lead.address; // skip when they only typed a zip

  const out = await ghl(token, 'POST', '/contacts/upsert', contact);
  const id = out.contact && out.contact.id;
  if (!id) throw new Error('Contact upsert returned no contact id');
  return id;
}

// The remaining form answers, saved on the contact as a note.
function addNote(token, contactId, lead) {
  const lines = [
    ['Project address', lead.address],
    ['Project details', lead.project],
    ['Investment range', lead.budget],
    ['Hoping to start', lead.timeline],
    ['Found us through', lead.foundUs],
    ['Anything else', lead.extra],
  ].filter(([, value]) => value).map(([label, value]) => label + ': ' + value);
  const body = 'Website quote request\n' + lines.join('\n');
  return ghl(token, 'POST', '/contacts/' + encodeURIComponent(contactId) + '/notes', { body });
}

// Pipeline and stage IDs, cached while the function stays warm.
let cachedStage = null;
async function findPipelineStage(token, locationId) {
  if (cachedStage) return cachedStage;
  const norm = (s) => String(s || '').replace(/[‘’]/g, "'").replace(/\s+/g, ' ').trim().toLowerCase();
  const out = await ghl(token, 'GET', '/opportunities/pipelines?locationId=' + encodeURIComponent(locationId));
  const pipeline = (out.pipelines || []).find((p) => norm(p.name) === norm(PIPELINE_NAME));
  if (!pipeline) throw new Error('Pipeline "' + PIPELINE_NAME + '" was not found');
  const stage = (pipeline.stages || []).find((s) => norm(s.name) === norm(STAGE_NAME));
  if (!stage) throw new Error('Stage "' + STAGE_NAME + '" was not found in "' + PIPELINE_NAME + '"');
  cachedStage = { pipelineId: pipeline.id, stageId: stage.id };
  return cachedStage;
}

function createOpportunity(token, locationId, contactId, stage, lead) {
  const opportunity = {
    locationId,
    pipelineId: stage.pipelineId,
    pipelineStageId: stage.stageId,
    contactId,
    name: lead.name + ' - Website quote',
    status: 'open',
  };
  const value = budgetMidpoint(lead.budget);
  if (value) opportunity.monetaryValue = value;
  return ghl(token, 'POST', '/opportunities/', opportunity);
}

// Opportunity value: the midpoint of the budget range they picked,
// e.g. "$10,000 - $35,000" -> 22500. "$100,000 - $250,000+" -> 175000.
function budgetMidpoint(budget) {
  const nums = (String(budget).match(/\d[\d,]*/g) || [])
    .map((n) => Number(n.replace(/,/g, '')))
    .filter((n) => n > 0);
  if (!nums.length) return 0;
  const low = nums[0];
  const high = nums.length > 1 ? nums[1] : nums[0];
  return Math.round((low + high) / 2);
}

// GoHighLevel expects phone numbers like +16145551234.
function toE164(phone) {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) return '+1' + digits;
  if (digits.length === 11 && digits[0] === '1') return '+' + digits;
  return phone.trim().startsWith('+') ? '+' + digits : phone.trim();
}
