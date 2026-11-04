/* Shared by every page: cookie consent, analytics (Google Analytics 4 + Microsoft Clarity)
   and conversion tracking.

   Analytics scripts load only after the visitor clicks "Accept". Until at least one ID below
   is filled in, no banner shows and nothing loads. Visitors whose browser sends a Global
   Privacy Control signal are treated as having declined.

   Conversions sent (mark these as key events in GA4 > Admin > Events):
     generate_lead  - quote form submitted (sent from index.html)
     click_to_call  - any tel: link clicked
     click_email    - any mailto: link clicked
*/
(function () {
  var CONFIG = {
    ga4Id: '',      // TODO: GA4 measurement ID, e.g. 'G-ABC123XYZ'
    clarityId: ''   // TODO: Microsoft Clarity project ID, e.g. 'k8x2abc9de'
  };

  var KEY = 'ucs-consent'; // 'granted' | 'denied', kept in this browser only
  var enabled = !!(CONFIG.ga4Id || CONFIG.clarityId);
  var gpc = navigator.globalPrivacyControl === true;
  var loaded = false;
  var banner = null;

  function getChoice() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function setChoice(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }

  function loadAnalytics() {
    if (loaded || !enabled) return;
    loaded = true;
    if (CONFIG.ga4Id) {
      var s = document.createElement('script');
      s.async = true;
      s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(CONFIG.ga4Id);
      document.head.appendChild(s);
      window.dataLayer = window.dataLayer || [];
      window.gtag = function () { window.dataLayer.push(arguments); };
      window.gtag('js', new Date());
      window.gtag('config', CONFIG.ga4Id);
    }
    if (CONFIG.clarityId) {
      (function (c, l, a, r, i, t, y) {
        c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
        t = l.createElement(r); t.async = 1; t.src = 'https://www.clarity.ms/tag/' + i;
        y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
      })(window, document, 'clarity', 'script', CONFIG.clarityId);
      window.clarity('consent');
    }
  }

  // Remove analytics cookies after a visitor withdraws consent.
  function clearAnalyticsCookies() {
    var host = location.hostname.replace(/^www\./, '');
    document.cookie.split(';').forEach(function (c) {
      var name = c.split('=')[0].trim();
      if (/^(_ga|_gid|_clck|_clsk|CLID|MUID)/.test(name)) {
        ['', '; domain=' + host, '; domain=.' + host].forEach(function (d) {
          document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/' + d;
        });
      }
    });
  }

  // Public hook for page scripts: window.ucsTrack('generate_lead', { ... })
  window.ucsTrack = function (name, params) {
    if (!loaded) return;
    if (CONFIG.ga4Id && window.gtag) window.gtag('event', name, params || {});
    if (CONFIG.clarityId && window.clarity) window.clarity('event', name);
  };

  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href^="tel:"], a[href^="mailto:"]');
    if (!a) return;
    var where = a.closest('header') ? 'header' : a.closest('footer') ? 'footer' : (a.closest('section[id]') || {}).id || 'page';
    window.ucsTrack(a.protocol === 'tel:' ? 'click_to_call' : 'click_email', { link_location: where });
  });

  var css = [
    '.ucs-consent{position:fixed;z-index:70;left:calc(16px + env(safe-area-inset-left,0px));right:calc(16px + env(safe-area-inset-right,0px));bottom:calc(16px + env(safe-area-inset-bottom,0px));',
    'max-width:560px;margin:0 auto;background:#12233a;color:#fff;border-radius:16px;padding:20px 22px;',
    'box-shadow:0 18px 50px rgba(0,0,0,.35);font:15px/1.6 Inter,system-ui,-apple-system,"Segoe UI",sans-serif}',
    '.ucs-consent h2{font:800 20px/1.1 "Barlow Condensed",Inter,sans-serif;text-transform:uppercase;margin:0 0 6px;color:#fff}',
    '.ucs-consent p{margin:0 0 16px;color:rgba(255,255,255,.85)}',
    '.ucs-consent a{color:#fff}',
    '.ucs-consent .row{display:flex;flex-wrap:wrap;gap:10px}',
    '.ucs-consent button{flex:1 1 140px;padding:12px 18px;border-radius:999px;font:600 15px/1 Inter,sans-serif;cursor:pointer;border:1.5px solid #f2b632}',
    '.ucs-consent .accept{background:#f2b632;color:#12233a}',
    '.ucs-consent .decline{background:transparent;color:#fff}',
    '.ucs-consent button:focus-visible{outline:3px solid #fff;outline-offset:3px}'
  ].join('');

  function showBanner(focus) {
    if (banner) { banner.hidden = false; if (focus) banner.querySelector('button').focus(); return; }
    var style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);

    banner = document.createElement('section');
    banner.className = 'ucs-consent';
    banner.setAttribute('aria-labelledby', 'ucs-consent-title');
    banner.innerHTML =
      '<h2 id="ucs-consent-title">Cookies on this site</h2>' +
      '<p>With your permission, we use Google Analytics and Microsoft Clarity to see how people use this site so we can improve it. ' +
      'They stay off unless you accept. <a href="privacy.html#analytics">Learn more</a></p>' +
      '<div class="row"><button type="button" class="decline">Decline</button>' +
      '<button type="button" class="accept">Accept</button></div>';

    banner.addEventListener('click', function (e) {
      var btn = e.target.closest('button');
      if (!btn) return;
      var choice = btn.classList.contains('accept') ? 'granted' : 'denied';
      var was = getChoice();
      setChoice(choice);
      banner.hidden = true;
      if (choice === 'granted') { loadAnalytics(); }
      else if (was === 'granted' || loaded) { clearAnalyticsCookies(); location.reload(); }
    });

    // Put the banner early in the page so keyboard users reach it right after the skip link.
    var skip = document.querySelector('.skip');
    if (skip) skip.insertAdjacentElement('afterend', banner);
    else document.body.insertBefore(banner, document.body.firstChild);
    if (focus) banner.querySelector('button').focus();
  }

  function init() {
    // "Cookie settings" links in the footer reopen the banner; hide them while analytics is off.
    document.querySelectorAll('[data-cookie-settings]').forEach(function (el) {
      el.hidden = !enabled;
      el.addEventListener('click', function (e) { e.preventDefault(); showBanner(true); });
    });
    if (!enabled) return;

    var choice = getChoice();
    if (gpc && choice !== 'granted') { setChoice('denied'); return; }
    if (choice === 'granted') loadAnalytics();
    else if (choice !== 'denied') showBanner(false);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
