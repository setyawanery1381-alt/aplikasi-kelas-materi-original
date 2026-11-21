/**
 * ============================================================
 * gas-client-adapter.js — Drop-in Polyfill google.script.run
 * ============================================================
 * Mengizinkan frontend memanggil:
 * google.script.run.withSuccessHandler(cb).withFailureHandler(errCb).namaFungsi(payload)
 * yang otomatis diteruskan via HTTP POST ke endpoint Vercel Serverless (/api/rpc).
 * ============================================================
 */
(function() {
  if (window.google && window.google.script && window.google.script.run) return;

  function createRunner(successHandler, failureHandler, userObject) {
    return new Proxy({}, {
      get(target, propKey) {
        if (propKey === 'withSuccessHandler') {
          return function(fn) {
            return createRunner(fn, failureHandler, userObject);
          };
        }
        if (propKey === 'withFailureHandler') {
          return function(fn) {
            return createRunner(successHandler, fn, userObject);
          };
        }
        if (propKey === 'withUserObject') {
          return function(obj) {
            return createRunner(successHandler, failureHandler, obj);
          };
        }

        // Pemanggilan fungsi server (RPC)
        return async function(...args) {
          try {
            const response = await fetch('/api/rpc', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ action: propKey, payload: args })
            });

            const result = await response.json();

            if (!response.ok || (result && result.error)) {
              const err = new Error((result && result.error) || 'Server error');
              if (failureHandler) failureHandler(err, userObject);
              else console.error('RPC Error:', err);
              return;
            }

            const data = (result && result.data !== undefined) ? result.data : result;
            if (successHandler) successHandler(data, userObject);
            return data;
          } catch (err) {
            if (failureHandler) failureHandler(err, userObject);
            else console.error('Fetch RPC Network Error:', err);
          }
        };
      }
    });
  }

  window.google = window.google || {};
  window.google.script = window.google.script || {};
  window.google.script.run = createRunner();
  window.google.script.host = {
    close: () => window.close(),
    origin: window.location.origin
  };
})();

