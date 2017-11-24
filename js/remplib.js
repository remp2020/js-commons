export default {

    beamToken: null,

    segmentProviderCacheKey: "segment_provider_cache",

    userId: null,

    signedIn: false,

    cacheThreshold: 15 * 60000, // 15 minutes

    getUserId: function() {
        if (this.userId) {
            return this.userId;
        }
        var storageKey = "anon_id";
        var anonId = this.getFromStorage(storageKey, true);
        if (anonId) {
            return anonId;
        }
        anonId = remplib.uuidv4();
        var now = new Date();
        var item = {
            "version": 1,
            "value": anonId,
            "createdAt": now,
            "updatedAt": now,
        };
        localStorage.setItem(storageKey, JSON.stringify(item));
        return anonId;
    },

    uuidv4: function() {
        var format = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';
        if (!window.crypto) {
            return format.replace(/[xy]/g, function(c) {
                var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
                return v.toString(16);
            });
        }

        var nums = window.crypto.getRandomValues(new Uint8ClampedArray(format.split(/[xy]/).length - 1));
        var pointer = 0;
        return format.replace(/[xy]/g, function(c) {
            var r = nums[pointer++] % 16,
                v = (c === 'x') ? r : (r&0x3|0x8);
            return v.toString(16);
        });
    },

    getFromStorage: function(key, bypassThreshold) {
        var now = new Date();
        var data = localStorage.getItem(key);
        if (data === null) {
            return null;
        }

        var item = JSON.parse(data);
        var threshold = new Date(now.getTime() - this.cacheThreshold);
        if (!bypassThreshold && (new Date(item.updatedAt)).getTime() < threshold.getTime()) {
            localStorage.removeItem(key);
            return null;
        }

        if (item.hasOwnProperty("updatedAt")) {
            item.updatedAt = now;
        }
        localStorage.setItem(key, JSON.stringify(item));

        if (item.hasOwnProperty('value')) {
            return item.value;
        }
        return item;
    },

    extend: function() {
        var a, b, c, f, l, g = arguments[0] || {}, k = 1, v = arguments.length, n = !1;
        "boolean" === typeof g && (n = g,
            g = arguments[1] || {},
            k = 2);
        "object" === typeof g || d.isFunction(g) || (g = {});
        v === k && (g = this,
            --k);
        for (; k < v; k++)
            if (null != (a = arguments[k]))
                for (b in a)
                    c = g[b],
                        f = a[b],
                    g !== f && (n && f && (d.isPlainObject(f) || (l = d.isArray(f))) ? (l ? (l = !1,
                        c = c && d.isArray(c) ? c : []) : c = c && d.isPlainObject(c) ? c : {},
                        g[b] = d.extend(n, c, f)) : void 0 !== f && (g[b] = f));
        return g
    },

    bootstrap: function(app) {
        this.applyPolyfills();
        if (this.isBot(navigator.userAgent)) {
            return;
        }
        for (var i=0; i < app._.length; i++) {
            var cb = app._[i];
            setTimeout((function() {
                var cbf = cb[0];
                var cbargs = cb[1];
                return function() {
                    if (cbf !== "run") {
                        app[cbf].apply(app, cbargs);
                    }
                    app.initIterator++;
                    if (app.initIterator === app._.length) {
                        app.run();
                    }
                }
            })(), 0);
        }
    },

    applyPolyfills: function() {
        // CustomEvent constructor for IE
        if ( typeof window.CustomEvent === "function" ) return false;
        function CustomEvent ( event, params ) {
            params = params || { bubbles: false, cancelable: false, detail: undefined };
            var evt = document.createEvent( 'CustomEvent' );
            evt.initCustomEvent( event, params.bubbles, params.cancelable, params.detail );
            return evt;
        }
        CustomEvent.prototype = window.Event.prototype;
        window.CustomEvent = CustomEvent;
    },

    loadScript: function (src, callback) {
        var s = document.createElement('script');
        s.src = src;
        s.async = true;
        s.onreadystatechange = s.onload = function() {
            if (typeof callback !== 'undefined' && !callback.done && (!s.readyState || /loaded|complete/.test(s.readyState))) {
                callback.done = true;
                callback();
            }
        };
        document.getElementsByTagName('head')[0].appendChild(s);
    },

    loadStyle: function (src, callback) {
        var l = document.createElement('link');
        l.href = src;
        l.rel = "stylesheet";
        l.onreadystatechange = l.onload = function() {
            if (typeof callback !== 'undefined' && !callback.done && (!l.readyState || /loaded|complete/.test(l.readyState))) {
                callback.done = true;
                callback();
            }
        };
        document.getElementsByTagName('head')[0].appendChild(l);
    },

    isBot: function(userAgent) {
        return userAgent.match(/bot|crawl|slurp|spider|mediapartners/i);
    },
}
