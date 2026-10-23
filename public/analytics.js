// Conversion events for GA4 (loaded after the gtag snippet on every page).
// One delegated listener counts clicks on WhatsApp, phone and email links,
// wherever they sit on the page. Only the channel and the page path are sent,
// never the link itself (it can carry the visitor's message).
(function () {
  var CHANNELS = [
    ['whatsapp', /^https:\/\/(wa\.me|api\.whatsapp\.com)\//],
    ['phone', /^tel:/],
    ['email', /^mailto:/],
  ];
  document.addEventListener(
    'click',
    function (e) {
      var link = e.target instanceof Element && e.target.closest('a[href]');
      if (!link || typeof window.gtag !== 'function') return;
      var href = link.getAttribute('href') || '';
      for (var i = 0; i < CHANNELS.length; i++) {
        if (CHANNELS[i][1].test(href)) {
          window.gtag('event', 'contact_click', { method: CHANNELS[i][0], page_path: location.pathname });
          return;
        }
      }
    },
    true
  );
})();
