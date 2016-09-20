(function () {
    window.tlRequire = window.tlRequire || {};
    var d = window.tlRequire;
    var b = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
    var a = /([^\s,]+)/g;

    function c(g) {
        var f = g.toString().replace(b, "");
        var e = f.slice(f.indexOf("(") + 1, f.indexOf(")")).match(a);
        return e || []
    }(function (k) {
        var g = {};
        var i = function (m) {
            return {
                waitList: [],
                waitCount: 0,
                callback: null,
                definition: null,
                dependencies: null,
                async: null,
                id: m
            }
        };
        var h = function (o, n, m) {
            f(o, n, m, true)
        };
        var f = function (t, q, m, p) {
            p = p || false;
            g[t] = g[t] || i(t);
            var s = g[t];
            s.callback = m;
            s.dependencies = q;
            s.async = p;
            for (var o = 0; o < q.length; o++) {
                var n = q[o];
                if (!g[n]) {
                    g[n] = i(n)
                }
                var r = g[n];
                if (!r.definition) {
                    r.waitList.push(s);
                    s.waitCount++
                }
            }
            if (s.callback && s.waitCount === 0) {
                e(s)
            }
        };
        var j = function (r) {
            var p = c(r),
                o = [];
            for (var n = 0; n < p.length; n++) {
                    var m = p[n];
                    var q = g[m];
                    l(q);
                    e(q);
                    o.push(q.definition)
                }
            return function () {
                    r.apply(undefined, o)
                }
        };
        var l = function (o) {
            for (var m = 0; m < o.waitList.length; m++) {
                var n = o.waitList[m];
                n.waitCount--;
                if (n.callback && n.waitCount === 0) {
                    e(n)
                }
            }
        };
        var e = function (p) {
            var m = [];
            for (var o = 0; o < p.dependencies.length; o++) {
                var n = p.dependencies[o];
                var q = g[n];
                m.push(q.definition)
            }
            if (p.async) {
                m.push(function (s, r) {
                    if (s) {
                        p.definition = r;
                        l(p)
                    }
                });
                p.callback.apply(undefined, m)
            } else {
                p.definition = p.callback.apply(undefined, m);
                l(p)
            }
        };
        k.define = f;
        k.defineAsync = h;
        k.inject = j
    }(d))
}());
tlRequire.define("EventDispatcher", [], function () {
    var a = function () {
        this._listeners = {}
    };
    a.prototype = {
        constructor: a,
        addListener: function (b, c) {
            if (!this._listeners[b]) {
                this._listeners[b] = []
            }
            this._listeners[b].push(c)
        },
        trigger: function (d, f) {
            var c = this._listeners[d],
                e;
            if (c) {
                    e = c.slice(0);
                    var b;
                    for (b = 0; b < e.length; b++) {
                        e[b].call(this, f)
                    }
                }
        },
        removeListener: function (d, e) {
            var c = this._listeners[d];
            if (c) {
                var b;
                for (b = 0; b < c.length; b++) {
                    if (c[b] === e) {
                        c.splice(b, 1);
                        break
                    }
                }
            }
        }
    };
    return a
});
tlRequire.define("abTest", ["hashing"], function (a) {
    var g = {};

    function d() {
        var k = 0;
        try {
            k = localStorage.getItem("tlJsUserId");
            if (!k) {
                k = Math.floor(Math.random() * 100);
                localStorage.setItem("tlJsUserId", k)
            }
        } catch (l) {}
        return k
    }
    var h = function (k, n, o, m) {
        var l = {
            start: n,
            end: o,
            variant: m
        };
        if (!g.hasOwnProperty(k)) {
            g[k] = []
        }
        g[k].push(l)
    };
    var i = function (k, m) {
        var n = g[k];
        var l;
        if (typeof n === "undefined") {
            return null
        }
        for (l = 0; l < n.length; l++) {
            var o = n[l];
            if ((o.start <= m) && (o.end >= m)) {
                return o.variant
            }
        }
        return null
    };
    var e = function (k, m) {
        var l = Math.abs(m ^ a.adler32(k)) % 100;
        return i(k, l)
    };
    var j = function (k) {
        return e(k, d())
    };
    var b = function (m) {
        var k = [];
        var l;
        for (l in g) {
            if (g.hasOwnProperty(l)) {
                var n = e(l, m);
                k.push({
                    testName: l,
                    variant: n
                })
            }
        }
        return k
    };
    var c = function () {
        return b(d())
    };
    var f = function () {
        g = {}
    };
    return {
        addBucket: h,
        variantForUser: j,
        activeTestsForUser: c,
        clear: f,
        internals: {
            variantForUserId: e,
            activeTestsForUserId: b,
            variantForUserBucketPoint: i
        }
    }
});
tlRequire.define("actionLogger", ["jQuery", "config", "eventCallback", "util", "abTest"], function (n, s, m, b, i) {
    var j = {};
    var d = {};
    var t = {};
    var k = {};
    var g = b.isTouchDevice;
    var e = (function () {
        var w = null;
        var u = null;

        function v(z, x) {
            var A = true;
            var y = new Date().getTime();
            if (u && !x) {
                if (y - u < 5000) {
                    A = false
                }
            }
            if (s.referer) {
                z.referer = s.referer
            }
            if (A) {
                if (w) {
                    clearTimeout(w);
                    w = null
                }
                w = setTimeout(function () {
                    n.getJSON(s.getApiBaseUrl() + "/api/internal/logActivity?callback=?", z)
                }, 200);
                if (!x) {
                    u = y
                }
            }
        }
        return v
    }());

    function p(y, x) {
        var v = x[y];
        var u = new Date().getTime();
        var w = (v && (u - v < 5000)) ? false : true;
        return w
    }
    function a(w, u, z, B) {
        var v = p(w, d);
        if (!v) {
            return
        }
        var x = {
            event: "tagClick",
            scene: u,
            tag: w
        };
        m(z, x);
        var A = s.getApiBaseUrl();
        var y = {
            thing: w,
            sceneId: u,
            e: "click",
            referer: s.referer
        };
        n.getJSON(A + "/api/internal/logThingAccess?callback=?", y, B);
        d[w] = new Date().getTime()
    }
    function q(u, v) {
        if (g && !k[u]) {
            k[u] = true;
            return true
        }
        return v
    }
    function f(x, v, y) {
        var w = p(x, j);
        if (!w) {
            return
        }
        t[x] = new Date();
        var z = s.getApiBaseUrl();
        var u = q(v);
        setTimeout(function () {
            n.getJSON(z + "/api/internal/logThingAccess?callback=?", {
                thing: x,
                sceneId: v,
                e: "hover",
                referer: s.referer,
                dwell: u
            });
            var A = {
                event: "tagHover",
                scene: v,
                tag: x
            };
            m(y, A)
        }, 500);
        j[x] = new Date().getTime()
    }
    var l = function (w) {
        var x = w.data("entertime");
        if (x) {
            var y = (new Date()).getTime() - x;
            if (y > 250) {
                var v = w.find("img").attr("tl-scene-id");
                var u = q(v);
                if (v) {
                    setTimeout(function () {
                        n.getJSON(s.getApiBaseUrl() + "/api/internal/logSceneAccess?callback=?", {
                            time: y,
                            sceneId: v,
                            referer: s.referer,
                            dwell: u,
                            event: "scene.hover"
                        })
                    }, 500)
                }
                w.removeData("entertime")
            }
        }
    };
    var c = function (w, v) {
        var u = w.trackingUrl;
        if (u) {
            u = u.replace("RANDOM", Math.floor(Math.random() * 1000000000));
            u = u.replace("[timestamp]", new Date().getTime());
            v.find("img.tlTracker").remove();
            v.append('<img class="tlTracker" src="' + u + '" style="position:absolute;width:1px;height:1px;top:0;left:0;">')
        }
    };
    var r = function (A) {
        var C = A.width();
        var z = Math.floor(C / 100) * 100;
        var E = Math.floor(A.height() / 100) * 100;
        var x = Math.floor(window.screen.width / 100) * 100;
        var y = Math.floor(window.screen.height / 100) * 100;
        var F = /iPad/.test(navigator.platform);
        var w = /iPhone/.test(navigator.platform);
        var B = F ? "iPad" : w ? "iPhone" : "unknown";
        var G = i.activeTestsForUser();
        var u = null;
        var v = navigator.userAgent.toLowerCase();
        if (v.indexOf("msie") !== -1) {
            u = "IE" + (parseInt(v.split("msie")[1]).toString())
        }
        G.push({
            testName: "r_imageWidth",
            variant: C.toString()
        });
        G.push({
            testName: "r_imageHeight",
            variant: A.height().toString()
        });
        G.push({
            testName: "r_imageWidthHundred",
            variant: z.toString()
        });
        G.push({
            testName: "r_imageHeightHundred",
            variant: E.toString()
        });
        G.push({
            testName: "r_screenWidth",
            variant: window.screen.width.toString()
        });
        G.push({
            testName: "r_screenHeight",
            variant: window.screen.height.toString()
        });
        G.push({
            testName: "r_screenWidthHundred",
            variant: x.toString()
        });
        G.push({
            testName: "r_screenHeightHundred",
            variant: y.toString()
        });
        G.push({
            testName: "r_mobileDevice",
            variant: B
        });
        G.push({
            testName: "r_ieVersion",
            variant: u
        });
        var D = JSON.stringify(G);
        return D
    };
    var o = function (w) {
        var v = w.find("img.thinglinkImage");
        var u = v.attr("tl-scene-id");
        if (u) {
            var x = v.tlImage("sceneData");
            c(x, w);
            setTimeout(function () {
                n.getJSON(s.getApiBaseUrl() + "/api/internal/logSceneAccess?callback=?", {
                    sceneId: u,
                    referer: s.referer,
                    event: "scene.view",
                    channelId: b.getChannelId(w)
                })
            }, 500)
        }
    };
    var h = function (v, u) {
        var w = t[v];
        if (w) {
            var x = (new Date()).getTime() - w;
            if (x > 250) {
                if (u) {
                    setTimeout(function () {
                        n.getJSON(s.getApiBaseUrl() + "/api/internal/logThingAccess?callback=?", {
                            time: x,
                            sceneId: u,
                            thing: v,
                            e: "hoverend",
                            referer: s.referer
                        })
                    }, 500)
                }
                t[v] = null
            }
        }
    };
    return {
        calcABTestString: r,
        logActivity: e,
        logHoverTime: l,
        logHoverEnd: h,
        logClick: a,
        logHover: f,
        logSceneView: o,
        installTracker: c
    }
});
tlRequire.define("adMatcher", [], function () {
    function b() {
        var c = ["1.\\d+.\\d+.\\d+", "127.0.0.\\d+", "localhost", "46.45.138.126", "abs.twimg.com", "ad.doubleclick.net", "ad.flatmaids.de", "ad.zanox.com", "ad.adriver.ru", "ad.admitad.com", "ad.dumedia.ru", "ad.linksynergy.com", "ad-cdn.technoratimedia.com", "ad\\d.adfarm1.adition.com", "ad1.emediate.dk", "ad.retargeter.com", "adsfac.eu", "adfarm.mediaplex.com", "adfile.tattermedia.com", "admax.quisma.com", "admeta.vo.llnwd.net", "adscale.nuggad.net", "adserver.wesee.com", "ads.foodbuzz.com", "ads.giovannicintolo.com", "ads.guava-affiliate.com", "ads.heias.com", "ads.jetpackdigital.com", "ads.nelly.com", "ads.newtentionassets.net", "ads.studentmedia.ucla.edu", "ads.thinglink.com", "ads.jetpackdigital.com", "adtag.neodatagroup.com", "adtracker.meinungsstudie.de", "aka-cdn-ns.adtech.de", "ads\\d.unitymedia.de", "analytics.sanoma.fi", "analytics.spongecell.com", "api.zanox.ws", "api.here.com", "ariel1.spaceprogram.com", "asn.advolution.de", "as.aug.me", "avatars.scribblelive.com", "b.aol.com", "b.kavanga.ru", "b.thebestlinks.com", "b.scorecardresearch.com", "bid.openx.net", "brandnamic.adclear.net", "brightcove.vo.llnwd.net", "bs.serving-sys.com", "cas.criteo.com", "cepep.co", "cdn.flashtalking.com", "c.statcounter.com", "counters.gigya.com", "cdn\\d*.gigya.com", "counter.rambler.ru", "creatives.klikki.com", "cxpfy.com", "d.shareaholic.com", "delatv.com", "d1.openx.org", "delivery.ctasnet.com", "engine.adzerk.net", "fapp.im", "fraction8.com", "\\w+.visadd.com", "geo.yahoo.com", "getpocket.com", "g.doubleclick.net", "gravatar.com", "\\w+.gmads.mookie1.com", "hits.e.cl", "i-cdn.servedbyopenx.com", "imp\\w?\\w?.tradedoubler.com", "imagesrv.adition.com", "img-cdn.mediaplex.com", "pictela.net", "jptracking.elasticbeanstalk.com", "\\w+.googleapis.com", "khm\\d.google.com", "l.betrad.com", "\\w+.lijit.com", "links.es", "leerya.net", "\\d+.maps.nlp.nokia.com", "mdsad.com", "mt\\d.googleapis.com", "malvin.tv", "maps.googleapis.com", "maps.google.com", "next.playad.se", "notici.me", "notifreak.com", "networkanalytics.net", "oas.theblondesalad.com", "otile\\d.mqcdn.com", "pagead\\d.googlesyndication.com", "paypal.com", "peliculasid.biz", "pictela.net", "pixel.wp.com", "pulsemaps.com", "readitlaterlist.com", "remnant.fmpub.net", "reports.wizebar.com", "s0.2mdn.net", "s\\d+.adform.net", "s\\d+.addthis.com", "s\\d+.shinystat.com", "stats.wordpress.com", "sitemeter.com", "sm\\d+.sitemeter.com", "tag.admeld.com", "t.qservz.com", "t.socialgrowthtechnologies.com", "tags.bluekai.com", "tessera\\d+.intellicast.com", "tile.openstreetmap.org", "\\w+.tile.openstreetmap.org", "track.adform.net", "track.admaxim.com", "tracking.hubspot.com", "traffic.shareaholic.com", "trk.lqw.me", "trk-\\w+.tidaltv.com", "us-ads.openx.net", "view.adtraxx.de", "videosomg.com", "widgets.kiosked.com", "w.uptolike.com", "www.ftjcfx.com", "www.getfreebacklinks.com", "www.google.com", "www.w3counter.com", "www\\d+.a8.net", "www.divxatope.com", "www.etracker.de", "www.callefina.com", "www.googleadservices.com", "www.google-analytics.com"];
        return new RegExp("//(" + c.join("|").replace(".", "\\.") + ")")
    }
    var a = b();
    return a
});
tlRequire.define("animUtil", ["jQuery"], function (b) {
    function a(e, c, d, f) {
        if (f === undefined) {
            f = "easeOutCubic"
        }
        if (d === undefined) {
            d = 100
        }
        if ((c.length > 30) || typeof(document.addEventListener) === "undefined") {
            if (e === "show") {
                c.show()
            } else {
                c.hide()
            }
        } else {
            c.stop(true, true);
            if (e === "show") {
                c.fadeIn(d, f)
            } else {
                c.fadeOut(d, f)
            }
        }
    }
    return {
        variateOpacity: a
    }
});
tlRequire.define("browserFeats", ["jQuery"], function (a) {
    var b = (function () {
        var f = null;
        var g = null;
        var e = function (h) {
            var i = false;
            h(function (j) {
                i = true
            });
            return i
        };
        var c = function () {
            if (f === null) {
                f = e(function (h) {
                    var j = a("html"),
                        i = j[0];
                    j.bind("DOMAttrModified", h);
                    i.setAttribute("___test___", true);
                    i.removeAttribute("___test___");
                    j.unbind("DOMAttrModified")
                })
            }
            return f
        };
        var d = function () {
            if (g === null) {
                g = e(function (h) {
                    var i = a("html");
                    i.bind("DOMNodeInserted", h);
                    a("<span />").appendTo(a("body")).remove();
                    i.unbind("DOMNodeInserted")
                })
            }
            return g
        };
        return {
            hasDomAttrModified: c,
            hasDomNodeInserted: d
        }
    }());
    return b
});
tlRequire.define("bubbleRenderer", ["jQuery", "config", "util", "cssUtil", "postMessageManager", "customization"], function (i, b, e, j, g, d) {
    function c(o, q, p) {
        var l;
        if (q.indexOf("<") !== -1) {
            l = i("<p>" + q + "</p>").text().length
        } else {
            l = q.length
        }
        var m = 0;
        if (l < 50) {
            m = 100 + l
        } else {
            m = 100 + (l / 2.5);
            if (m > 350) {
                m = 350
            }
            if (l > 300) {
                o.addClass("tlLongDescription")
            } else {
                if (l > 100) {
                    o.addClass("tlSemiLongDescription")
                }
            }
        }
        var n = j.parseCssText(o.attr("style"), false, false);
        if (p < m) {
            m = p
        }
        n["min-width"] = m + "px";
        o.css({
            cssText: e.mapToCssText(n, true)
        })
    }
    function a(l) {
        return l.charAt(0).toUpperCase() + l.slice(1)
    }
    function h(m) {
        var l = new RegExp("^[\u0000-\u001F\\s]*[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]");
        return !!m && m.match(l)
    }
    function k(m, q, s) {
        var l = new RegExp("([^.]+\\.(?:co\\.)?[a-z]{2,7})$"),
            n, u, t = (s && s.openlink) || "AUTO",
            p;
        try {
                n = l.exec(window.location.hostname)[0]
            } catch (o) {
                n = window.location.hostname
            }
        if (t === "NEW") {
                u = false
            } else {
                if (t === "SAME") {
                    u = true
                } else {
                    if (t === "NONE") {
                        if (q) {
                            q()
                        }
                        return
                    } else {
                        u = new RegExp("(^https?://(?:[^/]*)|&url=http[^&]+)" + n).test(m) || (m.indexOf("://") === -1)
                    }
                }
            }
        if (u) {
                if (q) {
                    q(function () {
                        window.open(m, "_top")
                    })
                } else {
                    window.open(m, "_top")
                }
            } else {
                if (q) {
                    q()
                }
                p = window.open(m);
                p.opener = null
            }
    }
    function f(x, L, p) {
        var I;
        var P;
        var l;
        var O, z;
        var J;
        var u;
        var v = x.thingUrl || "";
        var C = "tl-a-" + x.id;
        var t = i(window).width() - 30;
        var y = i(window).height() - 60;
        var w = t - 15;
        var q = y - 14;
        if (x.productName.indexOf("\n") !== -1) {
            x.productName = x.productName.replace(/\n\n+/g, "\n\n").replace(/\n/g, "<br>")
        }
        var D = h(x.productName) ? "tlRtl" : "";
        if (x.theme === "iframe") {
            var H = x.iWidth;
            var s = x.iHeight;
            l = g.prepareAndGetParameters(x.contentUrl);
            P = l.srcPmParams;
            I = l.rtid;
            var M = '<iframe class="tlIframe" allowfullscreen="true" allowTransparency="true" name="rmt-' + x.id + '" scrolling="auto" src="' + x.contentUrl + P + '" style="width:' + H + "px !important; height:" + s + "px !important;max-width: " + w + "px!important; max-height:" + q + 'px!important;" frameBorder="0"></iframe>';
            var G;
            if (x.productName != null && x.productName.length > 0 && !(x.hideDescription)) {
                G = '<div class="tlIframeDescription ' + D + '">';
                G += x.productName;
                G += "</div><hr>"
            } else {
                G = ""
            }
            J = i('<div class="tlThingText" id="' + C + '" style="max-width:' + t + "px!important; max-height:" + y + 'px!important;"><div class="tlThingClose"></div><div class="tlThingContent" style="max-width:' + t + "px!important; max-height:" + y + 'px!important;">' + G + '<div class="tlSpinner" style="width:' + H + "px!important;height:" + s + 'px!important;"></div></div><div class="tlArrowWrapper"><div class="tlArrow"></div></div></div>');
            z = function () {
                var S = J.find(".tlThingContent > .tlSpinner");
                var R = S.find(".tlIframe");
                if (R.size() === 0) {
                    R = i(M);
                    R.css("opacity", "0");
                    var Q = H <= w ? H : w;
                    if (S.length === 0) {
                        J.find(".tlThingContent").append(R)
                    } else {
                        if (S.is("div")) {
                            S.append(R)
                        }
                    }
                    J.find(".tlThingContent").css("cssText", "width:" + Q + "px!important;");
                    R.load(function () {
                        J.addClass("iframeLoaded");
                        R.addClass("loaded");
                        S.css({
                            width: R.css("width"),
                            height: R.css("height")
                        });
                        var T = x.styles;
                        if (!x.styles) {
                            T = i("." + C).data("tlStyles") || {}
                        }
                        d.applyNewCustomization(J, T, e.getSourceDomain(x.contentUrl));
                        setTimeout(function () {
                            R.fadeTo(300, 1)
                        }, 300);
                        setTimeout(function () {
                            S.addClass("loaded")
                        }, 200);
                        R.unbind("load")
                    });
                    if (window.ActiveXObject || "ActiveXObject" in window) {
                        R.attr("src", R.attr("src"))
                    }
                }
            };
            O = function (Q, S, R) {
                k(Q, R, x, window.top == window.self)
            }
        } else {
            if (x.theme === "rich") {
                var n = !e.no(x.icon) ? x.icon : "";
                var E = !e.no(x.title) ? x.title : "";
                if (x.productName) {
                    E = x.productName
                } else {
                    if (!e.no(x.title)) {
                        E = x.title
                    } else {
                        E = ""
                    }
                }
                E = '<span class="tlThingTitle">' + E + "</span>";
                if (!x.productName && !e.no(x.subTitle)) {
                    E = '<span class="tlThingSubTitle">' + x.subTitle + "</span><br />" + E
                }
                var o = "";
                var K;
                if (n) {
                    K = '<div class="tlVideoIconWrapper"><img class="tlThingIcon" src="' + n + '"/></div>'
                } else {
                    K = '<div class="tlThingIcon"></div>'
                }
                var B = "";
                if (!e.no(x.site)) {
                    B = x.site;
                    if (!e.no(x.siteUrl)) {
                        B = '<a href="' + x.siteUrl + '">' + B + "</a>"
                    }
                    B = '<div class="tlThingFooter">' + B + "</div>"
                }
                var m = "";
                if ("NONE" === x.openlink) {
                    m = "defaultCursor"
                }
                J = i('<div class="tlThingText" id="' + C + '"><div class="tlThingClose"></div><div class="tlThingContent" style="max-width:' + t + "px!important; max-height:" + y + 'px!important">' + o + '<div class="tlNonplayingContent ' + D + '"style="max-width:' + t + "px!important; max-height:" + y + 'px!important;"><div class="tlThumbnail ' + m + '"style="important;max-width:' + t + "px!important; max-height:" + y + 'px!important;">' + K + '<div class="tlThumbnailOverlay"></div></div><span class="tlCenteringOuter"><span class="tlCenteringMiddle"><span class="tlCenteringInner ' + D + '">' + E + "</span></span></span></div>" + B + '</div><div class="tlArrowWrapper"><div class="tlArrow"></div></div></div>');
                J.find(".tlThingTitle").on("vmouseup", "a", function (S) {
                    var R = i(this).attr("href");
                    var Q = window.open(R, "_blank");
                    Q.opener = null;
                    return false
                });
                if (x.contentUrl) {
                    l = g.prepareAndGetParameters(x.contentUrl);
                    P = l.srcPmParams;
                    I = l.rtid
                }
                O = function (Q, W, V) {
                    if (V) {
                        V()
                    }
                    if (J.hasClass("whitelabel") && (x.openlink === "AUTO" || x.openlink === "NONE")) {
                        return
                    }
                    if (x.contentUrl && J.find(".tlSpinner").length === 0) {
                        i(".tlThingClose").not(J.find(".tlThingClose")).mouseup();
                        var R = i(window).width();
                        var X = x.iWidth;
                        var U = x.iHeight;
                        if (X > (R - 26)) {
                            var T = X / (R - 26);
                            X = X / T;
                            U = U / T
                        }
                        var S = i('<iframe class="tlSpinner tlRichIframe" webkitallowfullscreen mozallowfullscreen allowfullscreen scrolling="auto" src="' + x.contentUrl + P + '" style="width:' + X.toString() + "px !important; height:" + U.toString() + 'px !important;" frameBorder="0"></iframe>');
                        J.find(".tlThingContent").append(S);
                        J.addClass("tlPlaying tlSticky");
                        p(W);
                        setTimeout(function () {
                            W.closest(".tlImageContainer").addClass("mouseover")
                        }, 0)
                    } else {
                        J.find(".tlThingClose").mouseup();
                        if (Q.indexOf("http") === 0) {
                            k(Q, false, x, window.top == window.self)
                        } else {
                            window.location = Q
                        }
                    }
                }
            } else {
                var r = !e.no(x.title) ? x.title : "";
                var N = "";
                if (r !== "") {
                    if (x.productName !== "") {
                        N += "<br />"
                    }
                    N += '<a class="tlThingLink" href="' + v + '">' + r + "</a>"
                }
                u = x.productName;
                J = i('<div class="tlThingText" id="' + C + '" style="max-width:' + t + "px!important;max-height:" + y + 'px!important;""><div class="tlThingClose"></div><div class="tlThingContent ' + D + '" style="max-width:' + t + "px!important; max-height:" + y + 'px!important;">' + u + N + '</div><div class="tlArrowWrapper"><div class="tlArrow"></div></div></div>');
                O = function (Q, S, R) {
                    k(Q, R, x, window.top == window.self)
                };
                c(J, u, t)
            }
        }
        var F = "";
        if (!e.no(x.theme)) {
            F += " tlTheme" + a(x.theme) + "Thing"
        }
        if (!e.no(x.variant)) {
            F += " tlVariant" + a(x.variant) + "Thing";
            if (x.variant == "image" && L && v.indexOf(b.getBaseUrl() + "/scene/") != -1) {
                F += " whitelabel"
            }
        }
        J.addClass(F);
        var A = {
            rtid: I,
            clickHandler: O,
            hoverHandler: z
        };
        J.data("bubbledata", A);
        return J
    }
    return {
        render: f,
        setBubbleTagTextStyle: c,
        relocateOrOpen: k
    }
});
tlRequire.define("callbackManager", [], function () {
    var a = (function () {
        var b = {};
        return {
            runAfter: function (c, d) {
                if (b[c] && b[c].length === 0) {
                    d()
                } else {
                    if (!b[c]) {
                        b[c] = [d]
                    } else {
                        b[c].push(d)
                    }
                }
            },
            triggerEvent: function (c) {
                if (b[c]) {
                    while (b[c].length > 0) {
                        (b[c].shift())()
                    }
                } else {
                    b[c] = []
                }
            }
        }
    }());
    return a
});
tlRequire.define("config", ["namespace", "util"], function (c, d) {
    function g() {
        var o = "http://thinglink.local:8080/thinglink",
            l = "https://thinglink.local:8443/thinglink",
            n = "https://localhost:8000",
            m = "https://localhost:8000";
        if (a.address.charAt(0) == "@") {
                a.address = o;
                a.clientId = "666666666"
            }
        if (a.videoAddress.charAt(0) == "@") {
                a.videoAddress = n
            }
        if (a.sslVideoAddress.charAt(0) == "@") {
                a.sslVideoAddress = m
            }
        if (a.sslAddress.charAt(0) == "@") {
                a.sslAddress = l
            }
        if (a.embedAddress.charAt(0) == "@") {
                a.embedAddress = o
            }
        if (a.staticAddress.charAt(0) == "@") {
                a.staticAddress = o
            }
        if (a.staticSslAddress.charAt(0) == "@") {
                a.staticSslAddress = l
            }
        if (a.staticAddress.charAt(0) == "/") {
                a.staticAddress = d.getProtocol() + a.staticAddress
            }
        if (a.cssNonce.toString().charAt(0) == "@") {
                a.cssNonce = Math.round(Math.random() * Math.pow(10, 8))
            }
    }
    var a = d.extend({
        address: "http://www.thinglink.com",
        sslAddress: "https://www.thinglink.com",
        videoAddress: "https://video.thinglink.com",
        sslVideoAddress: "https://video.thinglink.com",
        staticAddress: "//cdn.thinglink.me",
        staticSslAddress: "https://cdn.thinglink.me",
        embedAddress: "//cdn.thinglink.me",
        cssNonce: "253154014824",
        clientId: "310115790974091265",
        fbAppId: "163019823751039",
        wlFbAppId: "448074751917449",
        usePromotionBanner: false,
        minWidth: 130,
        minHeight: 130,
        activateImage: function (l) {
            $tlJQ(l).tlImage("scrollTo")
        },
        initAfterLoad: true,
        showPoweredBy: true,
        eventManager: false,
        disableContextMenu: false,
        fourDotsInfo: true,
        vOverflow: null,
        hOverflow: null,
        referer: undefined,
        nubbinSneakPeek: true,
        makeNubbinsSticky: false,
        makeSidebarSticky: false,
        extraSidebarIcons: [],
        preventNavigation: false,
        disableMenuItems: false,
        showTouch: true,
        showShare: true,
        showFullscreen: true,
        forceSecure: false,
        initialNubbinShowDuration: 5000,
        eventCallback: null,
        language: null,
        manualViewStats: false,
        highlightCallback: null
    }, c.config);
    g();
    if (window.location.search.indexOf("thinglinkLocal") !== -1) {
        var k = "www.thinglink.com";
        a.address = "http://" + k;
        a.sslAddress = "https://" + k
    }
    function e() {
        return ("https:" == document.location.protocol) ? a.sslAddress : a.address
    }
    function i() {
        return a.sslAddress
    }
    function j() {
        return ("https:" == document.location.protocol) ? a.sslVideoAddress : a.videoAddress
    }
    function f() {
        return ("https:" == document.location.protocol) ? a.staticSslAddress : a.staticAddress
    }
    function h() {
        var n = e();
        if (window.top !== window) {
            return false
        }
        var m = window.location.href;
        return m.indexOf(n) != -1
    }
    function b(l) {
        if (!a.language && l) {
            a.language = l
        }
    }
    a.getCDNUrl = f;
    a.getBaseUrl = e;
    a.getApiBaseUrl = i;
    a.getBaseVideoUrl = j;
    a.isThinglinkSite = h;
    a.setRequestLanguage = b;
    c.config = a;
    return a
});
tlRequire.define("cssInjector", ["jQuery", "config"], function (c, a) {
    function b(i, f, g) {
        var h = "";
        if (g) {
            h = ' media="screen"'
        }
        if (c("head").has("#" + i).length === 0) {
            var e = c('<link id="' + i + '" type="text/css" rel="stylesheet" href="' + f + '"' + h + "></link>").appendTo(c("head"));
            if (typeof(document.addEventListener) === "undefined") {
                e.attr({
                    href: f,
                    rel: "stylesheet",
                    type: "text/css",
                    id: i
                })
            }
        }
    }
    function d() {
        if (!document.getElementById("tlInjectedCss")) {
            b("tlInjectedCss", a.getCDNUrl() + "/jsec/" + a.cssNonce + "/embed.css");
            if (typeof(document.addEventListener) === "undefined") {
                b("tlInjectedIeCss", a.getCDNUrl() + "/jsec/" + a.cssNonce + "/embed-ie.css")
            }
        }
    }
    return {
        injectEmbedCSS: d,
        addExternalCss: b
    }
});
tlRequire.define("cssUtil", ["jQuery", "util"], function (d, a) {
    function c(h, k, j) {
        var e = {};
        if (!h) {
            return e
        }
        var g = h.split(";"),
            n, p, o, l, f;
        for (n = 0; n < g.length && (g[n] !== false); n++) {
                l = g[n].match(/^ *([^: ]+) *: *(.*)$/);
                if (l) {
                    p = l[1];
                    if (k) {
                        f = l[2].match(/^([\d.]+) *(?:px *(?:! *important)? *)?$/i);
                        if (f) {
                            o = f[1]
                        }
                    }
                    if ((k && !f) || !k) {
                        o = d.trim(l[2]);
                        if (k || j) {
                            o = o.replace(/! *important/i, "")
                        }
                    }
                    p = p.toLowerCase();
                    e[p] = o
                }
            }
        return e
    }
    function b(g, f) {
        var e = c(f.style.cssText, false, true);
        e.top = g.t + "px";
        e.left = g.l + "px";
        if (!a.isSVG(g.w, g.h)) {
            e.width = g.w + "px";
            e.height = g.h + "px"
        }
        f.style.cssText = a.mapToCssText(e, true)
    }
    return {
        parseCssText: c,
        repositionElement: b
    }
});
tlRequire.define("customization", ["namespace", "util", "config", "jQuery"], function (d, h, c, k) {
    if (!window.location.origin) {
        window.location.origin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ":" + window.location.port : "")
    }
    function j() {
        return {
            bubble: {
                backgroundColor: "inherit",
                foregroundColor: "inherit"
            },
            font: {
                size: "inherit",
                family: "inherit",
                source: "default"
            }
        }
    }
    function a(o) {
        if (/MSIE (\d+\.\d+);/.test(navigator.userAgent)) {
            var n = parseFloat(RegExp.$1);
            if (n <= 9) {
                o = JSON.stringify(o)
            }
        }
        return o
    }
    function b(q, o, n) {
        if (typeof n === "undefined" || n == "undefined") {
            n = window.location.origin
        } else {
            n = decodeURIComponent(n)
        }
        if (q.length > 0 && q.hasClass("loaded")) {
            try {
                o = a(o);
                q[0].contentWindow.postMessage(o, n)
            } catch (p) {
                console.log("failed to send parcel")
            }
        }
    }
    function m(n) {
        var p = d.customization.googleFonts || [],
            o;
        for (o = p.length - 1; o >= 0; o--) {
                if (p[o] === n) {
                    return true
                }
            }
        return false
    }
    function i(n, q) {
        var p;
        if (document.getElementById("webfontScript") == null) {
            p = document.createElement("script");
            var r = document.scripts[0];
            p.id = "webfontScript";
            p.src = "https://ajax.googleapis.com/ajax/libs/webfont/1.5.18/webfont.js";
            r.parentNode.insertBefore(p, r)
        } else {
            p = document.getElementById("webfontScript")
        }
        function t() {
            WebFont.load({
                google: {
                    families: [n + ":400,400i,700,700i"]
                }
            })
        }
        if (k(p).hasClass("script-loaded")) {
            var o = n.toLowerCase().replace(/ /g, "");
            if (!k("html").hasClass("wf-" + o + "-n4-loading") && !k("html").hasClass("wf-" + o + "-n4-active")) {
                t()
            }
        } else {
            p.onload = function () {
                k(this).addClass("script-loaded");
                t()
            }
        }
    }
    function l(q, p, o) {
        var n = q || {};
        n.description = p || {};
        n.properties = o || {};
        return n
    }
    function g(p, o, n) {
        e(p, o, n, false);
        b(p.find("iframe"), o, n)
    }
    function e(q, p, o, r) {
        if (typeof(window.addEventListener) === "undefined") {
            return
        }
        if (typeof(r) === "undefined") {
            r = true
        }
        var u = {};
        var t = {};
        p = h.extend(j(), p);
        if (p.bubble) {
            if (p.bubble.backgroundColor != "inherit") {
                u["background-color"] = p.bubble.backgroundColor
            } else {
                u["background-color"] = "#ffffff"
            }
            if (p.bubble.foregroundColor != "inherit") {
                u.color = p.bubble.foregroundColor;
                t.color = p.bubble.foregroundColor
            } else {
                u.color = "#000000";
                t.color = "#000000"
            }
        }
        if (p.font) {
            if (p.font.size != "inherit") {
                u["font-size"] = p.font.size + "px";
                t["font-size"] = p.font.size + "px"
            } else {
                u["font-size"] = "";
                t["font-size"] = ""
            }
            if (p.font.family != "inherit") {
                if (p.font.source === "google" || (typeof(p.font.source) === "undefined" && m(p.font.family))) {
                    i(p.font.family, q)
                }
                u["font-family"] = p.font.family + ", sans-serif";
                t["font-family"] = p.font.family + ", sans-serif"
            } else {
                u["font-family"] = "inherit";
                t["font-family"] = "inherit"
            }
        }
        var n = q.find(".tlUpArrow");
        if (n.length > 0) {
            n.css("cssText", n[0].style.cssText + " border-bottom-color: " + u["background-color"] + " !important;")
        }
        var s = q.find(".tlArrow");
        if (s.length > 0) {
            s.css("cssText", s[0].style.cssText + " border-top-color: " + u["background-color"] + " !important;")
        }
        q.find(".tlThingContent, .tlIframeDescription").css(u);
        q.find(".tlThingContent span,.tlThingContent .tlThingFooter").each(function (x, v) {
            var w = k(v);
            if (w.attr("style") && !w.hasClass("tlThingFooter")) {
                t["font-size"] = w.css("font-size")
            } else {
                if (w.hasClass("tlThingFooter")) {
                    t["font-size"] = "9"
                }
            }
            w.attr("style", h.mapToCssText(t, true))
        });
        q.find(".tlThingContent, .tlIframeDescription").find("h3").css({
            color: "inherit"
        });
        q.find(".tlThingContent, .tlIframeDescription").find("b, i, strong, i a, b a, strong a, p").css({
            "font-size": "inherit",
            color: "inherit"
        });
        if (r) {
            b(q.find("iframe"), p, o)
        }
    }
    var f = h.extend({
        defaultCustomStyles: j,
        applyNewCustomization: g,
        sendParcelToIframe: b,
        mergeParcelData: l
    }, d.customization);
    d.customization = f;
    return d.customization
});
tlRequire.define("editor", ["jQuery", "namespace", "sceneUtil", "EventDispatcher", "config", "util", "postMessageManager"], function (n, g, h, e, f, i, m) {
    function b(t) {
        if (n("#thinglinkColorbox").length === 0) {
            n.thinglinkColorbox.init()
        }
        var r = n(window).width();
        var u = n(window).height();
        var o = r;
        var q = u;
        var s = n.thinglinkColorbox({
            iframe: true,
            open: false,
            transition: "none",
            width: o,
            height: q,
            opacity: 0.6,
            overlayClose: false,
            scrolling: false,
            onOpen: function () {
                n("html").css({
                    overflow: "hidden"
                })
            },
            onComplete: function () {
                var w = n("#thinglinkColorbox").offset().top,
                    v = (n(window).height() - q) / 2,
                    x = n(window).scrollTop();
                if (w > n(window).height() + n(window).scrollTop()) {
                        n("#thinglinkColorbox").css({
                            top: x + v
                        })
                    }
            },
            onCleanup: function () {
                n("html").css({
                    overflow: ""
                });
                a.trigger("editorClose", t)
            },
            href: function () {
                return l(t)
            }
        });
        var p = n("#thinglinkCBLoadedContent iframe");
        if (typeof(window.InstallTrigger) !== "undefined") {
            p.css("display", "block")
        }
        p.load(function () {
            p.css("background-color", "transparent");
            p.css("height", q + "px")
        })
    }
    function l(p) {
        var o = h.getSceneUrl(p),
            u = f.getApiBaseUrl(),
            w = p.attr("tl-type");
        if (p.attr("tl-media-360") == "true") {
                var q = p.attr("tl-video-id");
                return f.getBaseUrl() + "/media/" + q + "/editor"
            }
        if (w == "video") {
                var t = p.attr("tl-video-id");
                return f.getBaseVideoUrl() + "/videos/" + t + "/editor"
            }
        var v = p.attr("tl-scene-id");
        if (!v) {
                v = "url=" + o;
                if (!i.no(window.__tlid)) {
                    v += "&massId=" + window.__tlid
                }
            } else {
                v = "itemId=" + v
            }
        var s = m.prepareAndGetParameters(u + "/embed/editor").srcPmParams;
        var r;
        if (f.isThinglinkSite()) {
                r = "thinglink_site"
            } else {
                r = "embedded_image"
            }
        var x = Math.floor(Math.random() * 10000000);
        return u + "/embed/editor?x=" + x + "&embed=true&" + v + "&activityOrigin=" + r + s
    }
    function k(r, p) {
        var o = l(r);
        if (p) {
            g.editorPopup = p;
            p.location.href = o
        } else {
            var x = screen.width * 0.9;
            var t = screen.height * 0.9;
            var v = x;
            var s = t;
            var q = (x / 2) - (v / 2);
            var u = (t / 2) - (s / 2);
            g.editorPopup = window.open(o, "editor", "status=0,statusbar=0,toolbar=0,location=0,menubar=0,directories=0,resizable=1,height=" + s + ",width=" + v + ",left=" + q + ",top=" + u)
        }
    }
    function d(q, p) {
        if (p) {
            try {
                p.close()
            } catch (o) {}
        }
        if (n("#thinglinkColorBoxScript").length === 0) {
            n.getScript(f.getCDNUrl() + "/jsec/" + f.cssNonce + "/jquery.colorbox.js", function () {
                if (q) {
                    q()
                }
            });
            g.addExternalCss("tlInjectedColorboxCss", f.getCDNUrl() + "/jsec/" + f.cssNonce + "/colorbox.css", true)
        } else {
            if (q) {
                q()
            }
        }
    }
    function c(p, s, r, q) {
        h.closeAllStickyTags();
        if (h.isThinglinkSceneView() && !s) {
            s = function () {
                window.location.reload()
            }
        }
        g.editorCloseCallback = s;
        if (!q && (window.innerWidth < 1025 || window.innerHeight < 585)) {
            k(n(p), r)
        } else {
            if (r) {
                try {
                    r.close()
                } catch (o) {}
            }
            d(function () {
                b(n(p))
            }, r)
        }
    }
    var j = function () {};
    j.prototype = new e();
    j.prototype.open = c;
    var a = new j();
    return a
});
tlRequire.define("errorReporter", ["namespace", "config", "jQuery"], function (e, d, f) {
    var a = 5;
    var c = 0;
    var b = window.onerror;
    window.onerror = function (j, h, g) {
        if (h.indexOf("embed.js") === -1) {
            return
        }
        if (b) {
            b(j, h, g)
        }
        c += 1;
        if (c >= a) {
            return
        }
        var i = d.getApiBaseUrl();
        var k = {
            errorMessage: j,
            file: h,
            lineNumber: g
        };
        f.ajax({
            url: i + "/api/internal/reportJsError",
            data: k,
            dataType: "jsonp"
        })
    };
    return {}
});
tlRequire.define("eventCallback", ["config"], function (a) {
    function b(e, f) {
        var c;
        if (e.length > 0) {
            c = e.tlImage("sceneData");
            var d = c.permissions;
            if (a.eventCallback && typeof(d) != "undefined" && d.indexOf("cpm") >= 0) {
                f.image = e[0];
                f.timestamp = (new Date()).getTime();
                a.eventCallback(f)
            }
        }
    }
    return b
});
tlRequire.define("eventDebounce", [], function () {
    var a = function (f) {
        var e, d = [],
            g = {},
            b = function (h) {
                if (f.after) {
                    f.after.call(h, d, g)
                }
                d = [];
                e = null;
                g = {}
            };
        return function c(k) {
                var j = this,
                    i = k.type;
                var h = (typeof k.originalEvent === "undefined") ? k.type : k.originalEvent.type;
                g.lastOrigEventType = h;
                if (e) {
                        clearTimeout(e)
                    } else {
                        if (f.before) {
                            f.before.call(j, i, g)
                        }
                    }
                if (f.everyTime) {
                        f.everyTime.call(j, i, g, k)
                    }
                d.push(i);
                e = setTimeout(function () {
                        b(j)
                    }, f.threshold || 100);
                if (f.allowPropagation) {
                        return true
                    } else {
                        return false
                    }
            }
    };
    return a
});
tlRequire.define("fourDotsButton", ["config", "postMessageManager", "animUtil", "txt", "actionLogger", "abTest"], function (d, i, k, f, l, e) {
    var h = false,
        j = Math.random() < 0.001;

    function c() {
            return d.getBaseUrl() + "?buttonSource=badgeButtonBox"
        }
    function b(m, n, o) {
            if ((m.find(".tlFourDotsButton").length === 0) && (m.find(".tlFourDotsBanner").length === 0)) {
                return
            }
            a(m)
        }
    function a(r) {
            r.find(".tlFourDotsButton").remove();
            r.find(".tlFourDotsBanner").remove();
            var p = null;
            var s = r.width();
            var v = 300,
                n = 300;
            if (d.usePromotionBanner && r.width() >= v && r.height() >= n) {
                    e.addBucket("bannerType", 0, 99, "virtualStoreBanner");
                    var q = e.variantForUser("bannerType");
                    var m, o, w, u;
                    if (q === "vrAppBanner") {
                        m = "banner-virtualLessons-300.png",
                        o = "banner300",
                        w = 106,
                        u = 250;
                        if (s >= 800) {
                            m = "banner-virtualLessons-800.png";
                            o = "banner800";
                            w = 50;
                            u = 764
                        }
                        p = $tlJQ('<div class="tlFourDotsBanner tlBottomWideBanner"><div class="backgroundRect"></div><div class="bannerImageAreaWrapper"><img style="width:' + u + "px!important; height:" + w + 'px!important;" class="bannerImage" src="' + d.getBaseUrl() + "/gfx/banners/" + m + '"><a class="homeLink ' + o + '" href="' + d.getBaseUrl() + '?buttonSource=badgeButtonVirtualStore" target="_blank"><a class="promotedLink ' + o + '" href="https://itunes.apple.com/us/app/vr-lessons-by-thinglink/id1096042510?ls=1&mt=8" target=_blank></a></div></div>')
                    } else {
                        m = "banner-virtualStoreBanner-300.png";
                        o = "banner300";
                        w = 106;
                        u = 250;
                        if (s >= 800) {
                            m = "banner-virtualStoreBanner-800.png";
                            o = "banner800";
                            w = 50;
                            u = 764
                        }
                        p = $tlJQ('<div class="tlFourDotsBanner tlBottomWideBanner"><div class="backgroundRect"></div><div class="bannerImageAreaWrapper"><img style="width:' + u + "px!important; height:" + w + 'px!important;" class="bannerImage" src="' + d.getBaseUrl() + "/gfx/banners/" + m + '"><a class="homeLink ' + o + '" href="' + d.getBaseUrl() + '?buttonSource=badgeButtonVirtualStore" target="_blank"><a class="promotedLink ' + o + '" href="http://demo.thinglink.com/vr-store" target=_blank></a></div></div>')
                    }
                    if (j) {
                        var t = l.calcABTestString(r);
                        p.find(".homeLink").unbind("vclick").bind("vclick", function () {
                            l.logActivity({
                                name: "clicked home banner",
                                sceneId: r.find(".thinglinkImage").attr("tl-scene-id"),
                                isThinglinkSite: d.isThinglinkSite(),
                                ABTests: t
                            }, true)
                        });
                        p.find(".promotedLink").unbind("vclick").bind("vclick", function () {
                            l.logActivity({
                                name: "clicked promoted banner",
                                sceneId: r.find(".thinglinkImage").attr("tl-scene-id"),
                                isThinglinkSite: d.isThinglinkSite(),
                                ABTests: t
                            }, true)
                        });
                        if (!h) {
                            h = true;
                            l.logActivity({
                                name: "showed promotion banner",
                                sceneId: r.find(".thinglinkImage").attr("tl-scene-id"),
                                isThinglinkSite: d.isThinglinkSite(),
                                ABTests: t
                            }, true)
                        }
                    }
                } else {
                    p = $tlJQ('<div class="tlFourDotsButton"><div id="intro">' + f("FourDotsButton.MadeWithOrMakeYourOwn") + '</div><div id="logo"></div><a class="btn" href="' + c() + '" target="_blank"><span class="btnMessageShort">' + f("FourDotsButton.LearnMore") + '</span></a><div class="arrowRight"></div></div>')
                }
            p.appendTo(r);
            p.find("#logo").on("click", function () {
                    window.open(c(), "_blank");
                    return false
                })
        }
    function g(m, n) {
            if (n.indicator) {
                return
            }
            a(m);
            b(m)
        }
    return {
            setup: g,
            reposition: b
        }
});
tlRequire.define("globalCache", ["jQuery"], function (d) {
    var e = d();

    function b(f) {
        e = e.add(f)
    }
    function a() {
        return e
    }
    function c() {
        e = d()
    }
    return {
        addQueriedImage: b,
        getQueriedImages: a,
        clear: c
    }
});
tlRequire.define("hashing", [], function () {
    function b(c) {
        return Math.abs(a(c.src)).toString(16)
    }
    function a(f) {
        var g = 65521;
        var d = 1,
            c = 0;
        var e;
        for (e = 0; e < f.length; ++e) {
                d = (d + f.charAt(e).charCodeAt()) % g;
                c = (c + d) % g
            }
        return (c << 16) | d
    }
    return {
        adler32: a,
        generateImageHash: b
    }
});
tlRequire.define("imageEventHandlers", ["jQuery", "callbackManager", "config", "eventDebounce", "jUtil", "animUtil", "actionLogger", "util"], function (n, f, c, i, g, k, m, e) {
    var d = false;
    var b = function (p) {
        p.data("entertime", (new Date()).getTime());
        if (!d) {
            n(window).blur(function () {
                n(".tlImageContainer").each(function () {
                    m.logHoverTime(n(this))
                });
                return true
            });
            d = true
        }
    };
    var h = "div.nubbin, .tlFirstseen, .tlSidebar";
    var o = function (q) {
        if (!q.hasClass("tlHover")) {
            b(q);
            q.addClass("tlHover");
            var p = q.find(h);
            k.variateOpacity("show", p)
        }
    },
        l = function () {
            return (c.makeSidebarSticky ? "" : ".tlSidebar, ") + ".tlFirstseen" + (c.makeNubbinsSticky ? "" : ", div.nubbin.unpinned, div.nubbin .nubbinGlow")
        },
        j = function (p) {
            setTimeout(function () {
                var q = n("#tlTagContainer div.tlThingText.mouseover");
                if (!p.hasClass("mouseover") && q.length === 0) {
                    p.removeClass("tlHover");
                    m.logHoverTime(p);
                    k.variateOpacity("hide", p.find(l()))
                }
            }, 30)
        };

    function a(p) {
            p.removeClass("tlHover");
            p.find(l()).hide();
            var q = function () {
                if (!p.hasClass("mouseover")) {
                    p.addClass("mouseover")
                }
                setTimeout(function () {
                    n("#tlTagContainer").children("div.tlThingText").mouseleave();
                    o(p)
                }, 0)
            };
            p.unbind("mouseenter vclick").bind("mouseenter vclick", i({
                before: q,
                threshold: 50,
                allowPropagation: true
            }));
            p.unbind("mouseleave").bind("mouseleave", function () {
                p.removeClass("mouseover");
                n("#tlTagContainer").children("div.tlThingText").removeClass("mouseover");
                j(p)
            });
            g.checkImageInViewport(p, function () {
                p.unbind("mousemove.temp").bind("mousemove.temp", function () {
                    q();
                    p.unbind("mousemove.temp")
                })
            })
        }
    f.runAfter("initcomplete", function () {
            if (e.isTouchDevice) {
                n(document).unbind("touchstart.tlNubbinHide").bind("touchstart.tlNubbinHide", function (q) {
                    var p = q.target || q.srcElement;
                    if (n(p).closest(".tlImageContainer").length > 0 || n(p).closest("#tlTagContainer").length > 0) {
                        return
                    }
                    var r = new Date().getTime();
                    n(document).unbind("touchend.tlNubbinHide").bind("touchend.tlNubbinHide", function () {
                        n(this).unbind("touchend.tlNubbinHide");
                        var s = new Date().getTime() - r;
                        if (s > 200) {
                            return
                        }
                        n(".tlImageContainer.tlHover").each(function () {
                            n(this).trigger("mouseleave")
                        })
                    })
                })
            }
        });
    return {
            attach: a,
            showNubbins: o,
            hideNubbins: j
        }
});
tlRequire.define("init", ["namespace", "util", "config", "sceneCache", "statusManager"], function (c, a, b, e, d) {
    if (window.console === undefined) {
        window.console = {
            log: function () {},
            warn: function () {},
            error: function () {}
        }
    }(function () {
        c.init = function () {
            if (!document.addEventListener) {
                return
            }
            var j = document.getElementsByTagName("script"),
                g, m = j.length,
                i;
            while (m > 0) {
                    m--;
                    i = j[m].getAttribute("src");
                    if (i && (i.indexOf(".thinglink.com") != -1 || i.indexOf(".thinglink.me") != -1 || i.indexOf("thinglink.local") != -1 || (b.isThinglinkSite() && (i.indexOf("embed") != -1)))) {
                        g = j[m];
                        break
                    }
                }
            var o;
            if (g) {
                    var n = g.getAttribute("tl-script-loaded");
                    if (a.no(n) || n === "null" || n === null) {
                        o = g.src.replace(/^[^\#]+\#?/, "");
                        g.setAttribute("tl-script-loaded", true)
                    }
                }
            if (o) {
                    if (/^\d+$/.test(o)) {
                        var l = document.getElementsByTagName("img");
                        var k = l[l.length - 1];
                        k.setAttribute("tl-scene-id", o);
                        e.setCacheSceneId(k.src, o)
                    } else {
                        var p = g.getAttribute("height", 2);
                        var h = g.getAttribute("width", 2);
                        if (a.no(p) || p === "null" || p === null) {
                            p = null
                        }
                        if (a.no(h) || h === "null" || h === null) {
                            h = null
                        }
                        f(o, p, h, g)
                    }
                }
            if (a.browserIsUnsupported()) {
                    return
                }
        };

        function f(k, g, j, m) {
            var h = a.extractSceneId(k);
            var l = document.createElement("img");
            l.src = a.extractUrl(k);
            if (h.length > 0 && h !== "0") {
                l.setAttribute("tl-scene-id", h)
            }
            var i = {};
            if (g !== null) {
                i.height = g
            } else {
                i["max-height"] = window.innerHeight + "px"
            }
            if (j !== null) {
                i.width = j
            } else {
                i["max-width"] = "100%"
            }
            l.style.cssText = a.mapToCssText(i, true);
            m.parentNode.insertBefore(l, m)
        }
        d.setStatus("loadcomplete")
    }());
    if (c.config.initAfterLoad) {
        c.init()
    }
    return c.init
});
tlRequire.defineAsync("jQuery", ["init", "util", "statusManager"], function (e, b, c, a) {
    if (b.browserIsUnsupported()) {
        return
    }
    var d = (function () {
        var f;

        function i(k) {
            var o = "thinglinkJQueryScript";
            if (!window.__thinglinkInitStarted) {
                window.__thinglinkInitStarted = true;
                if (window.$tlJQ) {
                    k()
                } else {
                    var l = document.createElement("script");
                    l.type = "text/javascript";
                    l.id = o;
                    var n = function () {
                        window.$tlJQ = jQuery.noConflict(true);
                        k()
                    };
                    if (l.addEventListener) {
                        l.addEventListener("load", n, false)
                    } else {
                        l.onreadystatechange = function () {
                            if (this.readyState == "complete" || this.readyState == "loaded") {
                                n()
                            }
                        }
                    }
                    l.setAttribute("src", b.getProtocol() + "//ajax.googleapis.com/ajax/libs/jquery/1.11.3/jquery.min.js");
                    var m = document.getElementsByTagName("head")[0];
                    m.appendChild(l)
                }
            }
        }
        function j(k) {
            if (f) {
                f()
            }
            if (document.readyState === "interactive") {
                k()
            } else {
                if (typeof(document.documentElement.style.WebkitAppearance) !== "undefined" && document.readyState === "loaded") {
                    k()
                } else {
                    $tlJQ(document).ready(k)
                }
            }
        }
        function h(k) {
            i(function () {
                j(k)
            })
        }
        function g(k) {
            f = k
        }
        return {
            loadJQuery: h,
            initCallback: g
        }
    }());
    d.initCallback(function () {
        c.setStatus("initcomplete")
    });
    d.loadJQuery(function () {
        c.setStatus("jqueryready");
        a(true, window.$tlJQ)
    })
});
tlRequire.define("jQueryPostMessage", ["jQuery"], function (b) {
    /*!
     * jQuery postMessage - v0.5 - 9/11/2009
     * http://benalman.com/projects/jquery-postmessage-plugin/
     *
     * Copyright (c) 2009 "Cowboy" Ben Alman
     * Dual licensed under the MIT and GPL licenses.
     * http://benalman.com/about/license/
     */
    var a = function (k) {
        var d, e, l = 1,
            c, h = this,
            i = "postMessage",
            f = "addEventListener",
            g, j = h[i];
        k[i] = function (m, o, n) {
                if (!o) {
                    return
                }
                m = typeof m === "string" ? m : k.param(m);
                n = n || parent;
                if (j) {
                    n[i](m, o.replace(/([^:]+:\/\/[^\/]+).*/, "$1"))
                } else {
                    if (o) {
                        n.location = o.replace(/#.*$/, "") + "#" + (+new Date()) + (l++) + "&" + m
                    }
                }
            };
        k.receiveMessage = g = function (o, n, m) {
                if (j) {
                    if (o) {
                        if (typeof c === "function" && c()) {
                            g()
                        }
                        c = function (p) {
                            if ((typeof n === "string" && p.origin !== n) || (k.isFunction(n) && n(p.origin) === false)) {
                                return false
                            }
                            o(p)
                        }
                    }
                    if (h[f]) {
                        h[o ? f : "removeEventListener"]("message", c, false)
                    } else {
                        h[o ? "attachEvent" : "detachEvent"]("onmessage", c)
                    }
                } else {
                    if (d) {
                        clearInterval(d)
                    }
                    d = null;
                    if (o) {
                        m = typeof n === "number" ? n : typeof m === "number" ? m : 100;
                        d = setInterval(function () {
                            var q = document.location.hash,
                                p = /^#?\d+&/;
                            if (q !== e && p.test(q)) {
                                    e = q;
                                    o({
                                        data: q.replace(p, "")
                                    });
                                    document.location.hash = ""
                                }
                        }, m)
                    }
                }
            }
    };
    a(b);
    return b.postMessage
});
tlRequire.define("jQueryTlImage", ["jQuery", "adMatcher", "config", "globalCache"], function (d, a, c, e) {
    function b() {
        var h = /^data:/;
        var g = /^https?:\/\/mt\d+\.google\.com\//;
        var f = {
            sceneData: function (i) {
                if (!i) {
                    return this.data("scene")
                } else {
                    this.data("scene", i)
                }
            },
            hasSize: function () {
                if (this.tlImage("isLoaded")) {
                    return true
                } else {
                    var m = (this.height() !== 0) && (this.width() !== 0);
                    var l = !(this.height() === 24 && this.width() === 24);
                    var k = !(this.height() === 0 && this.width() === 0);
                    var j = !(this.height() === 1 && this.width() === 1);
                    var i = !(document.body.attachEvent && window.ActiveXObject && this.width() === 28 && this.height() === 30);
                    return m && l && i && k && j
                }
            },
            isLoaded: function () {
                return (this[0].complete || this[0].readyState === 4)
            },
            isInspectedByThinglink: function () {
                return e.getQueriedImages().is(this) || this.hasClass("thinglinkImage") || this.hasClass("thinglinkFiltered")
            },
            isWhitelabel: function () {
                var i = this.tlImage("sceneData");
                return i !== undefined && i.branding !== undefined && i.branding !== "thinglink"
            },
            hasThinglinkBadge: function () {
                var i = this.tlImage("sceneData");
                return i.indicator === undefined
            },
            isAlwaysThinglink: function () {
                var i = this;
                return i.hasClass("alwaysThinglink")
            },
            isOk: function () {
                var k = this;
                if (k.tlImage("isAlwaysThinglink")) {
                    return true
                }
                if (k.closest(".neverThinglink").length) {
                    return false
                }
                if (k.css("display") == "none") {
                    return false
                }
                var j = k.attr("src");
                if (a.test(j) || h.test(j) || g.test(j)) {
                    return false
                }
                var l = ["#lightboxImage", "#lightbox-image", ".cboxPhoto", "#fancybox-img", ".fancybox-image"];
                var i = false;
                d.each(l, function (m, n) {
                    if (k.is(n)) {
                        i = true;
                        return false
                    }
                });
                if (i) {
                    return false
                }
                if (!k.tlImage("hasSize")) {
                    return true
                }
                if (window.screen && (screen.width <= 480)) {
                    return (k.width() > screen.width / 3) && (k.height() > screen.width / 3)
                }
                return (k.height() >= c.minHeight && k.width() >= c.minWidth)
            },
            scrollTo: function () {
                var k = this;
                var j;
                if (Object.prototype.toString.call(window.HTMLElement).indexOf("Constructor") > 0) {
                    j = d("body")
                } else {
                    j = d("html,body")
                }
                var i = j.scrollTop();
                d(window).load(function () {
                    var l = k.offset().top - 40;
                    if (Math.abs(j.scrollTop() - i) < 50) {
                        j.stop().animate({
                            scrollTop: l
                        }, "fast")
                    }
                })
            }
        };
        d.fn.tlImage = function (i) {
            return f[i].apply(this, Array.prototype.slice.call(arguments, 1))
        }
    }
    b();
    return d.fn.tlImage
});
tlRequire.define("jQueryVMouse", ["jQuery"], function (a) {
    if (a.vmouse) {
        return a.vmouse
    }
    function b(y, H, g) {
        var G = "virtualMouseBindings",
            d = "virtualTouchID",
            c = ["vmouseover", "vmousedown", "vmousemove", "vmouseup", "vclick", "vmouseout", "vmousecancel"],
            x = ["clientX", "clientY", "pageX", "pageY", "screenX", "screenY"],
            D = y.event.mouseHooks ? y.event.mouseHooks.props : [],
            z = y.event.props.concat(D),
            B = {},
            I = 0,
            t = 0,
            s = 0,
            q = false,
            L = [],
            j = false,
            S = false,
            v = (g.addEventListener),
            u = y(g),
            F = 1,
            O = 0,
            e;
        y.vmouse = {
                moveDistanceThreshold: 10,
                clickDistanceThreshold: 10,
                resetTimerDuration: 1500
            };

        function r(i) {
                while (i && typeof i.originalEvent !== "undefined") {
                    i = i.originalEvent
                }
                return i
            }
        function k(U, V) {
                var ad = U.type,
                    ae, ac, W, T, aa, Z, Y, X, ab;
                U = y.Event(U);
                U.type = V;
                ae = U.originalEvent;
                ac = y.event.props;
                if (ad.search(/^(mouse|click)/) > -1) {
                        ac = z
                    }
                if (ae) {
                        for (Y = ac.length, T; Y; Y) {
                            T = ac[--Y];
                            U[T] = ae[T]
                        }
                    }
                if (ad.search(/mouse(down|up)|click/) > -1 && !U.which) {
                        U.which = 1
                    }
                if (ad.search(/^touch/) !== -1) {
                        W = r(ae);
                        ad = W.touches;
                        aa = W.changedTouches;
                        Z = (ad && ad.length) ? ad[0] : ((aa && aa.length) ? aa[0] : undefined);
                        if (Z) {
                            for (X = 0, ab = x.length; X < ab; X++) {
                                T = x[X];
                                U[T] = Z[T]
                            }
                        }
                    }
                return U
            }
        function Q(V) {
                var T = {},
                    i, U;
                while (V) {
                        i = y.data(V, G);
                        for (U in i) {
                            if (i.hasOwnProperty(U)) {
                                if (i[U]) {
                                    T[U] = T.hasVirtualBinding = true
                                }
                            }
                        }
                        V = V.parentNode
                    }
                return T
            }
        function C(U, T) {
                var i;
                while (U) {
                    i = y.data(U, G);
                    if (i && (!T || i[T])) {
                        return U
                    }
                    U = U.parentNode
                }
                return null
            }
        function K() {
                S = false
            }
        function m() {
                S = true
            }
        function R() {
                O = 0;
                L.length = 0;
                j = false;
                m()
            }
        function p() {
                K()
            }
        function w() {
                A();
                I = setTimeout(function () {
                    I = 0;
                    R()
                }, y.vmouse.resetTimerDuration)
            }
        function A() {
                if (I) {
                    clearTimeout(I);
                    I = 0
                }
            }
        function o(U, V, i) {
                var T;
                if ((i && i[U]) || (!i && C(V.target, U))) {
                    T = k(V, U);
                    y(V.target).trigger(T)
                }
                return T
            }
        function l(T) {
                var U = y.data(T.target, d);
                if (!j && (!O || O !== U)) {
                    var i = o("v" + T.type, T);
                    if (i) {
                        if (i.isDefaultPrevented()) {
                            T.preventDefault()
                        }
                        if (i.isPropagationStopped()) {
                            T.stopPropagation()
                        }
                        if (i.isImmediatePropagationStopped()) {
                            T.stopImmediatePropagation()
                        }
                    }
                }
            }
        function P(U) {
                var W = r(U).touches,
                    V, i;
                if (W && W.length === 1) {
                        V = U.target;
                        i = Q(V);
                        if (i.hasVirtualBinding) {
                            O = F++;
                            y.data(V, d, O);
                            A();
                            p();
                            q = false;
                            var T = r(U).touches[0];
                            t = T.pageX;
                            s = T.pageY;
                            o("vmouseover", U, i);
                            o("vmousedown", U, i)
                        }
                    }
            }
        function J(i) {
                if (S) {
                    return
                }
                if (!q) {
                    o("vmousecancel", i, Q(i.target))
                }
                q = true;
                w()
            }
        function f(W) {
                if (S) {
                    return
                }
                var U = r(W).touches[0],
                    T = q,
                    V = y.vmouse.moveDistanceThreshold,
                    i = Q(W.target);
                q = q || (Math.abs(U.pageX - t) > V || Math.abs(U.pageY - s) > V);
                if (q && !T) {
                        o("vmousecancel", W, i)
                    }
                o("vmousemove", W, i);
                w()
            }
        function h(V) {
                if (S) {
                    return
                }
                m();
                var i = Q(V.target),
                    U;
                o("vmouseup", V, i);
                if (!q) {
                        var T = o("vclick", V, i);
                        if (T && T.isDefaultPrevented()) {
                            U = r(V).changedTouches[0];
                            L.push({
                                touchID: O,
                                x: U.clientX,
                                y: U.clientY
                            });
                            j = true
                        }
                    }
                o("vmouseout", V, i);
                q = false;
                w()
            }
        function E(T) {
                var U = y.data(T, G),
                    i;
                if (U) {
                        for (i in U) {
                            if (U.hasOwnProperty(i)) {
                                if (U[i]) {
                                    return true
                                }
                            }
                        }
                    }
                return false
            }
        function N() {}
        function n(i) {
                var T = i.substr(1);
                return {
                    setup: function (V, U) {
                        if (!E(this)) {
                            y.data(this, G, {})
                        }
                        var W = y.data(this, G);
                        W[i] = true;
                        B[i] = (B[i] || 0) + 1;
                        if (B[i] === 1) {
                            u.bind(T, l)
                        }
                        y(this).bind(T, N);
                        if (v) {
                            B.touchstart = (B.touchstart || 0) + 1;
                            if (B.touchstart === 1) {
                                u.bind("touchstart", P).bind("touchend", h).bind("touchmove", f).bind("scroll", J)
                            }
                        }
                    },
                    teardown: function (V, U) {
                        --B[i];
                        if (!B[i]) {
                            u.unbind(T, l)
                        }
                        if (v) {
                            --B.touchstart;
                            if (!B.touchstart) {
                                u.unbind("touchstart", P).unbind("touchmove", f).unbind("touchend", h).unbind("scroll", J)
                            }
                        }
                        var W = y(this),
                            X = y.data(this, G);
                        if (X) {
                                X[i] = false
                            }
                        W.unbind(T, N);
                        if (!E(this)) {
                                W.removeData(G)
                            }
                    }
                }
            }
        var M;
        for (M = 0; M < c.length; M++) {
                y.event.special[c[M]] = n(c[M])
            }
        if (v) {
                g.addEventListener("click", function (X) {
                    var U = L.length,
                        Y = X.target,
                        aa, Z, ab, W, T, V;
                    if (U) {
                            aa = X.clientX;
                            Z = X.clientY;
                            e = y.vmouse.clickDistanceThreshold;
                            ab = Y;
                            while (ab) {
                                for (W = 0; W < U; W++) {
                                    T = L[W];
                                    V = 0;
                                    if ((ab === Y && Math.abs(T.x - aa) < e && Math.abs(T.y - Z) < e) || y.data(ab, d) === T.touchID) {
                                        X.preventDefault();
                                        X.stopPropagation();
                                        return
                                    }
                                }
                                ab = ab.parentNode
                            }
                        }
                }, true)
            }
    }
    b(a, window, document);
    return a.vmouse
});
tlRequire.define("jUtil", ["jQuery"], function (c) {
    function a(h, e) {
        var f = c(window);
        var j = f.scrollLeft(),
            d = f.scrollTop(),
            k = h.offset(),
            g = k.left,
            i = k.top;
        if (i + h.height() > d + 5 && i < d + f.height() - 5 && g + h.width() > j + 5 && g < j + f.width() - 5) {
                e()
            }
    }
    function b(f) {
        var g = c(f);
        var h, e;
        var d;
        if (g.hasClass("tlThingText")) {
            e = g;
            d = e.attr("id").match(/tl-a-([0-9]+)/)[1];
            h = c(".tagx.tl-a-" + d)
        } else {
            h = g;
            d = g.attr("tl-thing-id");
            e = c("#tl-a-" + d)
        }
        return {
            nubbin: h,
            bubble: e
        }
    }
    return {
        checkImageInViewport: a,
        getThingPieces: b
    }
});
tlRequire.define("main", ["namespace", "callbackManager", "statusManager", "jQuery", "util", "config", "cssUtil", "tagFetcher", "measure", "txt", "nubbinIconSizeManager", "nodeChangeTracker", "actionLogger", "nubbinRenderer", "eventCallback", "postMessageManager", "sceneUtil", "sceneCache", "touchManager", "hashing", "animUtil", "fourDotsButton", "editor", "sharePopup", "bubbleRenderer", "cssInjector", "jUtil", "imageEventHandlers", "positionThing", "tagEventHandlers", "eventDebounce", "abTest", "errorReporter", "globalCache", "customization"], function (w, s, n, C, a, I, u, h, f, y, v, e, x, G, z, k, H, B, j, r, l, t, i, m, g, q, A, F, c, E, b, p, D, d, o) {
    (function () {
        var ab = ["Edit", "Touch", "Share"];
        var Z = ["Touch", "Share"];
        if (I.disableEditorButton) {
            ab.splice(0, 1)
        }
        function Q(aC, aH) {
            aH = aH || ["imgHash", "scriptHash", "imgAttr"];
            var aB = null,
                aG = null;
            if (C.inArray("imgAttr", aH) !== -1) {
                    aB = aC.attr("tl-scene-id");
                    aG = aC.attr("tl-passkey")
                }
            if (!aB && C.inArray("scriptHash", aH) !== -1) {
                    var aF = aC.next().filter("script").attr("src");
                    if (!aF) {
                        aF = aC.closest(".tlImageContainer").nextUntil().filter("script").first().attr("src")
                    }
                    if ( !! aF && aF.indexOf("thinglink.") !== -1) {
                        aB = aF.replace(/^[^\#]+\#?/, "")
                    }
                }
            if (!aB && C.inArray("imgHash", aH) !== -1) {
                    var aD = aC.attr("src");
                    if ( !! aD) {
                        var aA = aD ? aD.match(/^[^\#]+\#tl-([^;]+);(.*)?$/) : null;
                        if ( !! aA) {
                            var aE = aD.match(/[\?&]tlpasskey=(\w+)/);
                            aB = aA[1];
                            aG = !! aE ? aE[1] : null
                        }
                    }
                }
            return {
                    id: aB,
                    passkey: aG
                }
        }
        function M(aE, aM, aB) {
            var aF, aJ, aK;
            if (aM) {
                aE.addClass("thinglinkImage");
                aE.removeClass("thinglinkFiltered");
                aK = [].concat(ab).concat(I.extraSidebarIcons);
                if (!I.showTouch) {
                    aJ = aK.indexOf("Touch");
                    if (aJ !== -1) {
                        aK.splice(aJ, 1)
                    }
                }
                if (!I.showShare) {
                    aF = aK.indexOf("Share");
                    if (aF !== -1) {
                        aK.splice(aF, 1)
                    }
                }
                if (!I.showFullscreen) {
                    var aC = aK.indexOf("Fullscreen");
                    if (aC !== -1) {
                        aK.splice(aC, 1)
                    }
                }
                if (aE.parents(".tlImageContainer").length === 0) {
                    var aA = '<div class="tlSidebar">',
                        aH, aD = "";
                    var aG = a.isTouchDevice ? "" : "tlNonTouchDevice";
                    var aL = '<span class="tlMenuItem tlMenuItem:curLabel :touchClass"><a class="tlMenuIcon tlMenu:curLabel" href="#"></a><span class="tlMenuLabel tlMenuLabel:curLabel">:labelText</span></span>';
                    for (aH = 0; aH < aK.length; aH++) {
                            aA += aL.replace(/:curLabel/gi, aK[aH]).replace(":touchClass", aG).replace(":labelText", y("Sidebar." + aK[aH]))
                        }
                    aA += "</div>";
                    aE.wrap('<div class="tlImageContainer">');
                    aE.parent().append('<div class="tlMenuContainer"><span class="tlMenu"></span></div>' + aA + "</div>")
                }
            } else {
                aE.addClass("thinglinkFiltered");
                aE.removeClass("thinglinkImage")
            }
            var aI = aE.parents(".tlImageContainer");
            if (aB) {
                aI.addClass("tlNoTags")
            } else {
                aI.removeClass("tlNoTags")
            }
        }
        function ap(aB) {
            var aC = [];
            var aA = [];
            C("img").each(function () {
                var aF = C(this);
                var aD = Q(aF, ["imgHash"]);
                var aE = aD.id;
                if (aE) {
                    aF.attr("tl-scene-id", aE)
                }
                if (aF.tlImage("isOk")) {
                    if (!aF.tlImage("isInspectedByThinglink")) {
                        var aH = aF.attr("tl-scene-id");
                        var aG = aF.attr("tl-passkey") || aD.passkey;
                        if ((!aH || aH.charAt(0) == "$") && window.__tlid) {
                            aH = H.getSceneUrl(this)
                        }
                        if (aH) {
                            d.addQueriedImage(aF);
                            if (C.inArray(aH, aC) === -1) {
                                aC.push(aH);
                                if (aG) {
                                    aA.push(aG)
                                }
                            }
                        }
                    }
                } else {
                    M(aF, false)
                }
            });
            if (aC.length > 0) {
                h.fetchTags(aC, aA, aB);
                q.injectEmbedCSS()
            }
        }
        w.rebuild = function (aB) {
            if (!aB) {
                C("img.thinglinkFiltered").removeClass("thinglinkFiltered");
                C("img.thinglinkImage").removeClass("thinglinkImage");
                d.clear();
                ap(true)
            } else {
                var aA = a.extractSceneId(aB),
                    aC = [];
                if (aA !== "" && aA.charAt(0) !== "$") {
                        aC = C("img[tl-scene-id=" + aA + "]")
                    }
                h.finalFetchCompleteCallback(function () {
                        var aD;
                        for (aD = 0; aD < aC.length; aD++) {
                            w.reposition(C(aC[aD]))
                        }
                        n.setStatus("tagfetchcomplete")
                    });
                d.addQueriedImage(aC);
                h.fetchTags(aB, null, true);
                q.injectEmbedCSS()
            }
        };

        function ag(aG) {
            if (!window.addEventListener) {
                return false
            }
            var aF = getComputedStyle(aG[0], null);
            if (aF.getPropertyValue("margin-left") !== "0px" || aF.getPropertyValue("left") !== "auto" || aF.getPropertyValue("right") !== "auto" || aF.getPropertyValue("float") === "left" || aF.getPropertyValue("float") === "right") {
                return false
            }
            var aB = aG.closest(".tlImageContainer").parent(),
                aA = getComputedStyle(aB[0]),
                aD = aG[0].getBoundingClientRect(),
                aC = aB[0].getBoundingClientRect();
            var aE = aD.left - aC.left - parseInt(aA.getPropertyValue("border-left-width"), 10) - parseInt(aA.getPropertyValue("padding-left"), 10) - parseInt(aF.getPropertyValue("margin-left"), 10);
            return aE > 0
        }
        function aa(aG, aB, aD, aH) {
            var aC = aB[0].style.cssText;
            aB.data("tlOriginalCss", aC);
            var aE = u.parseCssText(aC, false, true),
                aA = {};
            aA = a.extend(aA, aD);
            aA.width = aD.rawWidth + "px";
            aA.height = aD.rawHeight + "px";
            aE.padding = "0";
            aE.border = "0";
            aE.margin = "0";
            aA["z-index"] = (aH - 1);
            if (aB.css("display") == "block") {
                    aA.display = "block";
                    aG.css("display", "block");
                    if (ag(aB)) {
                        aA["margin-left"] = "auto";
                        aA["margin-right"] = "auto"
                    }
                }
            var aF = aB.css("position");
            if (aF === "absolute" || aF === "relative") {
                    aA.position = aF;
                    aA.top = aD.top;
                    aA.right = aD.right;
                    aA.bottom = aD.bottom;
                    aA.left = aD.left;
                    aE.position = "static";
                    if (aF === "absolute") {
                        aA["z-index"] = aH
                    }
                }
            var aI = aB.css("float");
            if (aI === "left" || aI === "right") {
                    aA["float"] = aI;
                    delete aE["float"]
                }
            if (aE["max-width"] && aE["max-width"] != "none") {
                    aA["max-width"] = aE["max-width"];
                    aE["max-width"] = "100%"
                }
            aE.width = "100%";
            aE.height = "100%";
            aB.css({
                    cssText: a.mapToCssText(aE, true)
                });
            aG.css({
                    cssText: a.mapToCssText(aA, true, true)
                });
            var aJ = f.getExtent(aB);
            aG.find("div.tlMenuContainer").each(function () {
                    C(this).css("cssText", "right:" + aJ.r + "px !important; bottom:" + aJ.b + "px !important; z-index:" + aH)
                });
            aG.find("div.tlSidebar").each(function () {
                    C(this).css("cssText", "right:" + aJ.r + "px !important; top:" + aJ.t + "px !important; z-index:" + (aH + 1))
                });
            t.reposition(aG, aJ, aH);
            if (I.isThinglinkSite()) {
                    if (aB.width() < 500 || aB.height() < 500) {
                        aG.addClass("tlSmallNavi");
                        C(".tlScene").addClass("tlSmallNavi")
                    } else {
                        aG.removeClass("tlSmallNavi");
                        C(".tlScene").removeClass("tlSmallNavi")
                    }
                } else {
                    if (aB.width() < 800 || aB.height() < 600) {
                        aG.addClass("tlSmallNavi");
                        C(".tlScene").addClass("tlSmallNavi")
                    } else {
                        aG.removeClass("tlSmallNavi");
                        C(".tlScene").removeClass("tlSmallNavi")
                    }
                }
            if (!a.isTouchDevice && (aB.width() < 150 || aB.height() < 300)) {
                    aG.addClass("tlVerySmallNavi");
                    C(".tlScene").addClass("tlVerySmallNavi")
                } else {
                    aG.removeClass("tlVerySmallNavi");
                    C(".tlScene").removeClass("tlVerySmallNavi")
                }
            if (aB.width() < 50 || aB.height() < 150) {
                    aG.addClass("tlNoBadgeIcon")
                } else {
                    aG.removeClass("tlNoBadgeIcon")
                }
            if (I.makeSidebarSticky) {
                    aG.find("div.tlSidebar").show()
                }
        }
        w.reposition = function (aB) {
            if (!aB) {
                var aA = C(".tlImageContainer .thinglinkImage"),
                    aF;
                for (aF = 0; aF < aA.length; aF++) {
                        w.reposition(aA.eq(aF))
                    }
            } else {
                var aH = C(aB).closest(".tlImageContainer"),
                    aG = C(aB).parent(),
                    aO = aH.find(".tagx"),
                    aI = aH.css("display"),
                    aD;
                if (aH.length === 0) {
                        return
                    }
                var aM = aH.css("z-index");
                aM++;
                aH[0].style.cssText = "display: none;";
                aH.before(aB);
                aB[0].style.cssText = aB.data("tlOriginalCss");
                var aE = {
                        w: 0,
                        h: 0
                    };
                if (aB.tlImage("hasSize")) {
                        aE = f.getDimensions(aB)
                    }
                aG.prepend(aB);
                aH.css("display", aI);
                aa(aH, aB, aE, aM);
                var aC = {
                        l: 0,
                        t: 0
                    };
                if (aH.css("box-sizing") === "content-box") {
                        var aK = f.getExtent(aH[0]);
                        aC.l = aK["padding-left"];
                        aC.t = aK["padding-top"]
                    }
                var aJ, aN, aL;
                for (aD = 0; aD < aO.length; aD++) {
                        aJ = aO.eq(aD);
                        aN = aJ.data("thing");
                        aL = f.getThingRect(aB, aN);
                        aL.l = aL.l + aC.l;
                        aL.t = aL.t + aC.t;
                        u.repositionElement(aL, aJ[0]);
                        if (aJ.hasClass("hovered")) {
                            c(aJ)
                        }
                    }
                v.resizeAllNubbinsIfTooSmall()
            }
        };
        w.removeTags = function (aB) {
            if (!aB) {
                aB = C("body")
            }
            var aA = C(aB).find(".tlThingContainer");
            C.each(aA, function (aC, aG) {
                var aD = C(aG);
                var aF = aD.find(".tagx");
                var aE = aF.attr("tl-thing-id");
                C("#tl-a-" + aE).remove();
                aD.remove()
            })
        };
        w.renderTag = function (aE, aA) {
            var aB = g.render(aA, null, c);
            aB.appendTo("#tlTagContainer");
            var aC = aB.data("bubbledata");
            var aD = G.render(aE, aA, aC.rtid);
            return {
                hoverHandler: aC.hoverHandler,
                clickHandler: aC.clickHandler,
                template: aD,
                bubble: aB
            }
        };
        w.prepareTagForDisplay = function () {
            E.prepareTagForDisplay.apply(this, arguments)
        };
        w.openEditor = function (aA, aD, aC, aB) {
            i.open(aA, aD, aC, aB)
        };
        w.openShare = function (aF, aD) {
            var aG = C(aF);
            var aC = aD ? C(aD).attr("tl-channel-id") : null;
            var aA = aG.closest(".tlImageContainer");
            if (aC) {
                var aB = {
                    id: aC
                };
                m.setup(aA, aG, aB)
            } else {
                var aE = aG.tlImage("sceneData");
                m.setup(aA, aG, aE)
            }
        };
        w.openTouch = function (aA) {
            C(aA).closest(".tlImageContainer").find(".tlMenuTouch").click()
        };
        w.addExternalCss = q.addExternalCss;
        w.closeAllStickyTags = function () {
            H.closeAllStickyTags()
        };
        w.highlightImage = function (aB) {
            function aH(aJ, aM) {
                var aK = aJ.find(".nubbin.unpinned");
                var aL = aJ.find(".nubbin .nubbinGlow");
                return setTimeout(function () {
                    var aN = 2500;
                    if (!aJ.hasClass("tlHover") && !I.makeNubbinsSticky) {
                        l.variateOpacity("hide", aK, aN)
                    }
                    l.variateOpacity("hide", aL, aN / 2);
                    aB.data("hideNubbinsTimeout", 0)
                }, aM)
            }
            var aD = aB.closest(".tlImageContainer");
            var aE = I.initialNubbinShowDuration;
            if (aB.data("hideNubbinsTimeout")) {
                clearTimeout(aB.data("hideNubbinsTimeout"));
                aB.data("hideNubbinsTimeout", aH(aD, aE))
            } else {
                var aF = aD.find(".nubbin");
                var aG = aF.find(".nubbinGlow");
                l.variateOpacity("show", aG, aE);
                l.variateOpacity("show", aF, 100);
                var aA = aH(aD, aE);
                aB.data("hideNubbinsTimeout", aA)
            }
            if (I.highlightCallback) {
                var aC = aB.tlImage("sceneData");
                if (I.highlightCallback(aC, aD)) {
                    x.logSceneView(aD)
                }
            }
            if (Math.random() < 0.001) {
                var aI = x.calcABTestString(aD);
                x.logActivity({
                    name: "sampled scene view",
                    sceneId: aD.find(".thinglinkImage").attr("tl-scene-id"),
                    isThinglinkSite: I.isThinglinkSite(),
                    ABTests: aI
                }, true)
            }
        };

        function Y(aA, aB) {
            A.checkImageInViewport(aA, function () {
                if (aB.hasClass("tlSneakPeeked")) {
                    return
                }
                aB.addClass("tlSneakPeeked");
                w.highlightImage(aA.find(".thinglinkImage"))
            })
        }
        function ar(aD, aC) {
            var aE = aD.parents(".tlImageContainer").find(".tlContextMenu");
            if (aE.children().length < 1) {
                return
            }
            aE.show();
            var aB = aC.pageX - aD.offset().left;
            var aA = aC.pageY - aD.offset().top;
            aE.css("cssText", "display: block; left: " + aB + "px !important; top: " + aA + "px !important; z-index: " + aE.css("z-index"))
        }
        function P(aB) {
            var aC = aB.find(".thinglinkImage");
            if (!I.disableContextMenu) {
                var aA = C(aB).find(".tagx");
                if (aA.length > 0) {
                    C.each([aA, aC], function (aE, aD) {
                        aD.bind("contextmenu", function (aF) {
                            if (!I.disableMenuItems) {
                                ar(aC, aF)
                            }
                            return false
                        })
                    })
                }
            }
        }
        function ai(aA) {
            setTimeout(function () {
                var aC = aA.find(".nubbin");

                function aB() {
                    setTimeout(function () {
                        Y(aA, aC)
                    }, 0)
                }
                aB();
                C(window).scroll(b({
                    after: aB,
                    threshold: 80
                }))
            }, 0)
        }
        function au(aF, aC) {
            var aB = false;
            var aD = navigator.userAgent.indexOf("Trident") !== -1;
            var aH = window.location.href.indexOf("/channelcard/") !== -1;
            if (aF && !(aD && aH)) {
                aB = true;
                if (aF.requestFullscreen) {
                    aF.requestFullscreen()
                } else {
                    if (aF.mozRequestFullScreen) {
                        aF.mozRequestFullScreen()
                    } else {
                        if (aF.webkitRequestFullscreen) {
                            aF.webkitRequestFullscreen()
                        } else {
                            if (aF.msRequestFullscreen) {
                                aF.msRequestFullscreen()
                            } else {
                                aB = false
                            }
                        }
                    }
                }
            }
            if (!aB) {
                var aA = C(aF);
                var aE = aA.find(".channelCarousel");
                var aG = "";
                if (window.location.href.indexOf("on=fb") !== -1) {
                    aG = "&on=fb"
                }
                if (aE.length > 0) {
                    window.open(I.getBaseUrl() + "/channelcard/" + aE.attr("tl-channel-id") + "?fullscreen=true" + aG, "_blank")
                } else {
                    window.open(I.getBaseUrl() + "/card/" + aC + "?fullscreen=true" + aG, "_blank")
                }
            }
        }
        function aw(aD, aC) {
            var aA = aD.height(),
                aB = aD.width(),
                aE = false,
                aF = "tlFullscreen";
            return function () {
                    var aG = aB / aA;
                    if (aE) {
                        C("#tlFullscreenUpsell").hide();
                        aD.attr("height", aA).attr("width", aB);
                        aC.removeClass(aF);
                        aC.closest(".tlFullscreenable").removeClass(aF)
                    } else {
                        aD.attr("height", screen.height).attr("width", screen.height * aG);
                        aC.addClass(aF);
                        aC.closest(".tlFullscreenable").addClass(aF);
                        C("#tlFullscreenUpsell").show()
                    }
                    aE = !aE
                }
        }
        function af(aD, aF, aE) {
            var aB = p.activeTestsForUser();
            var aC = JSON.stringify(aB);
            C(document).off("webkitfullscreenchange mozfullscreenchange fullscreenchange MSFullscreenChange").on("webkitfullscreenchange mozfullscreenchange fullscreenchange MSFullscreenChange", aw(aF, aD, aE));
            var aA, aG = aD.closest(".tlFullscreenable");
            if (aG.length > 0) {
                aA = aG[0]
            }
            au(aA, aE.id);
            x.logActivity({
                name: "clicked in-image fullscreen",
                sceneId: aD.find(".thinglinkImage").attr("tl-scene-id"),
                isThinglinkSite: I.isThinglinkSite(),
                ABTests: aC
            });
            return false
        }
        function N(aB, aE, aD) {
            j.touch(aB, H.isSceneTouched(aD.id));
            aB.find(".tlPopup").hide();
            var aA = p.activeTestsForUser();
            var aC = JSON.stringify(aA);
            x.logActivity({
                name: "clicked in-image touch",
                sceneId: aB.find(".thinglinkImage").attr("tl-scene-id"),
                isThinglinkSite: I.isThinglinkSite(),
                ABTests: aC
            });
            return false
        }
        function ae(aA, aC, aB) {
            m.setup(aA, aC, aB)
        }
        function T(aA, aC, aB) {
            if (typeof(aB.allowEdit) != "undefined" && aB.allowEdit === false) {
                aA.find(".tlMenuEdit").parent().hide()
            } else {
                aA.find(".tlMenuEdit").parent().unbind("click").click(function (aD) {
                    aD.preventDefault();
                    i.open(aC)
                })
            }
        }
        function aj(aD) {
            var aF = aD[0];
            var aC = aD[1];
            var aE = aD[2];
            var aI = H.findImageContainer(aC).find(".tlMenuItemTouch");
            var aK = aI.find(".tlMenuLabelTouch");
            var aA;
            if (aF) {
                aA = "Untouch";
                aI.removeClass("tlTouch").addClass("tlUntouch")
            } else {
                aA = "Touch";
                aI.removeClass("tlUntouch").addClass("tlTouch")
            }
            if (aE === undefined) {
                aE = 0
            }
            var aJ = aK.data("tlTouchCount");
            if (aJ) {
                aK.data("tlTouchCount", aJ + aE)
            } else {
                aK.data("tlTouchCount", aE)
            }
            aK.text(y("Sidebar." + aA));
            var aB = aK.data("tlTouchCount");
            if (aB == 1) {
                aK.prev().attr("title", aB + " touch")
            } else {
                aK.prev().attr("title", aB + " touches")
            }
            var aH;
            if (aB === 1) {
                aH = y("TouchSidebarButton.TouchesOne")
            } else {
                if (aB === 0) {
                    aH = y("TouchSidebarButton.TouchesNo")
                } else {
                    aH = y("TouchSidebarButton.TouchesOther", aB)
                }
            }
            aK.prev().attr("title", aH);
            if (I.isThinglinkSite()) {
                var aG;
                if (aB === 1) {
                    aG = y("TouchDialog.TouchesOne")
                } else {
                    if (aB === 0) {
                        aG = y("TouchDialog.TouchesNo")
                    } else {
                        aG = y("TouchDialog.TouchesOther", aB)
                    }
                }
                C("#touchCountPhrase").text(" " + aG)
            }
            return aB
        }
        function ad(aB, aF, aE) {
            if (aE.indicator) {
                var aD = I.getCDNUrl() + "/api/nubbin/" + aE.indicator + "/plain";
                var aC = 'background-image: url("' + aD + '") !important;';
                C(aB).find(".tlMenu").css("cssText", aC).parent().addClass("tlMenuCustomIndicatorContainer");
                var aG = new Image();
                var aA = function () {
                    C(aB).find(".tlMenu").css("cssText", aC + ";width:" + aG.width + "px!important;height:" + aG.height + "px!important")
                };
                if ((aG.complete || aG.readyState === 4) && (aG.width > 0)) {
                    aA()
                } else {
                    aG.onload = aA;
                    aG.src = aD
                }
            } else {
                if (aE.branding === "" || !aE.id) {
                    C(aB).find(".tlMenuContainer").remove()
                }
            }
        }
        function am(aA, aH, aG) {
            aA.find(".tlContextMenu").remove();
            var aF = C('<div class="tlContextMenu"></div>');
            aF.css("z-index", aH + 1);
            aF.bind("contextmenu", function () {
                return false
            });
            var aE = function (aI) {
                return function () {
                    aA.find(".tlMenu" + aI).click();
                    aF.hide();
                    return false
                }
            };
            var aC, aB, aD = I.isThinglinkSite();
            for (aC = 0; aC < Z.length; aC++) {
                aB = Z[aC];
                if (!aG[aB.toLowerCase()] || aD) {
                    C('<div class="tlContextMenuItem tlContextMenu' + aB + '">' + y("ContextMenu." + aB) + "</div>").bind("click", aE(aB)).appendTo(aF)
                }
            }
            aA.append(aF);
            aF.attr("unselectable", "on").css("-moz-user-select", "none").each(function () {
                this.onselectstart = function () {
                    return false
                }
            });
            C("body").click(function () {
                if (aF.css("display") !== "none") {
                    aF.hide()
                }
            });
            aF.hide()
        }
        function K(aA) {
            aA = aA.filter(".tlVariantImageThing");
            aA.find("img").bind("load", function () {
                if (aA.is(":visible")) {
                    c(A.getThingPieces(aA).nubbin)
                }
            })
        }
        function ao(aB, aD, aA, aF, aC, aE) {
            setTimeout(function () {
                var aN = f.getThingRect(aD, aA);
                var aK = {
                    l: 0,
                    t: 0
                };
                if (aB.css("box-sizing") === "content-box") {
                    var aJ = f.getExtent(aB[0]);
                    aK.l = aJ["padding-left"];
                    aK.t = aJ["padding-top"]
                }
                aN.l = aN.l + aK.l;
                aN.t = aN.t + aK.t;
                var aI = C("#tl-a-" + aA.id);
                if (aI.length === 0) {
                    aI = g.render(aA, aC, c);
                    o.applyNewCustomization(aI, aA.styles, a.getSourceDomain(aA.contentUrl));
                    aI.appendTo("#tlTagContainer")
                }
                var aM = aI.data("bubbledata");
                aB.find(".tl-a-" + aA.id).parent().remove();
                var aH = G.render(aN, aA, aM.rtid);
                aH.appendTo(aB);
                var aG = aH.find(".tl-a-" + aA.id).first();
                aG.data("thing", aA);
                aI.css("cssText", aI[0].style.cssText + "z-index: " + (aF + 1) + ";");
                var aL = aG.find(".nubbin").last();
                aL.css("z-index", aF);
                E.attach(aG, aB);
                if (aE) {
                    aE(aA)
                }
            }, 0)
        }
        function U(aA, aB) {
            aA.find(".tagx").each(function () {
                var aG = A.getThingPieces(this);
                var aF = aG.nubbin.attr("tl-thing-id");
                var aE = true;
                var aC, aD;
                if ((aB !== undefined)) {
                    for (aC = 0; aC < aB.length; aC++) {
                        aD = aB[aC];
                        if (aF === aD.id) {
                            aE = false;
                            break
                        }
                    }
                }
                if (aE) {
                    aG.bubble.remove();
                    aG.nubbin.remove()
                }
            })
        }
        function al(aS) {
            var a0, aL, aT;
            if (!aS.tlImage("isOk")) {
                M(aS, false);
                return
            }
            aL = f.getDimensions(aS);
            a0 = aS.tlImage("sceneData");
            if (!a0) {
                if (aS.tlImage("isInspectedByThinglink")) {
                    return
                }
                a0 = {
                    things: [],
                    allowEdit: true
                }
            }
            aT = (a0.things && a0.things.length !== 0);
            M(aS, true, !aT);
            try {
                aS.parents("a").addClass("tlWrappingAnchor");
                if (!a.no(a0.id)) {
                    aS.attr("tl-scene-id", a0.id)
                }
                var a4 = aS.closest(".tlImageContainer");
                var aX = aS.tlImage("isWhitelabel");
                if (!aX && a0.showFourDotsMenu && I.fourDotsInfo) {
                    t.setup(a4, a0);
                    a0.branding = ""
                } else {
                    if (aS.tlImage("hasThinglinkBadge")) {
                        a4.find(".tlMenu").wrap('<a href="https://www.thinglink.com?buttonSource=badgeButtonBoxPro"></a>')
                    }
                }
                var aR = aS.css("z-index") || 0;
                var aM = 1;
                aR = (aR === "auto") ? 1 : parseInt(aR, 10) + aM;
                if (a0.titleUrl !== undefined) {
                    var aW = f.getExtent(aS);
                    var aB = a.getDomain(a0.titleUrl);
                    var aZ = C('<div class="tlFirstseen"><a href="' + a0.titleUrl + '">' + y("OriginallyThinglinked", aB) + "</a></div>");
                    a4.append(aZ);
                    aZ.css("cssText", "bottom: " + aW["padding-bottom"] + "px !important; left: " + aW["padding-left"] + "px !important;");
                    aZ.click(function () {
                        window.location = C(this).find("a").attr("href")
                    })
                }
                aa(a4, aS, aL, aR);
                T(a4, aS, a0);
                var aQ = (aL.w < 130 || aL.h < 130);
                var aF = (C(window).width() < 300 || C(window).height() < 140);
                var aD = function () {
                    a4.find(".tlMenuItemShare,.tlMenuItemTouch").hide()
                };
                var aV = I.isThinglinkSite();
                var a3 = a0.hideitems || {
                    touch: false,
                    share: false
                };
                var aH = function () {
                    if (aV) {
                        C.ajax({
                            url: window.contextPath + "/api/user/me/channels?contains=" + a0.id + "&scope=groups",
                            success: function (bc) {
                                var bh = C(".tlMenuItemPost").length > 0 ? C(".tlMenuItemPost") : C("#scenePost"),
                                    bd = bc.results,
                                    be = true,
                                    bi = function (bm, bl) {
                                        if (bm.title > bl.title) {
                                            return 1
                                        }
                                        if (bm.title < bl.title) {
                                            return -1
                                        }
                                        return 0
                                    };
                                bd.sort(bi);

                                function a5(bl) {
                                        return bl.map(function (bm) {
                                            return '<div id="progress-' + escapeHtml(bm.id) + '" class="channelProgress"></div><div class="channel"><input type="checkbox" class="addToChannel" id="' + escapeHtml(bm.id) + '"' + (bm.contains[a0.id] ? ' checked="true"' : "") + '/> <div class="title">' + escapeHtml(bm.title) + '</div><div id="checked-' + escapeHtml(bm.id) + '" class="_icon_checked checked" style="display: ' + (bm.contains[a0.id] ? "inline-block" : "none") + '"></div><div id="unchecked-' + escapeHtml(bm.id) + '" class="_icon_unchecked checked" style="display: ' + (bm.contains[a0.id] ? "none" : "inline-block") + '"></div></div>'
                                        }).join("")
                                    }
                                function a8(bn, bl) {
                                        var bm = [];
                                        if (bn && bn !== " ") {
                                            bl.map(function (bo) {
                                                if (bo.title.toLowerCase().indexOf(bn.toLowerCase()) !== -1) {
                                                    bm.push(bo)
                                                }
                                            })
                                        } else {
                                            bm = bl
                                        }
                                        return bm
                                    }
                                function bf(bl) {
                                        return '<input dir="auto" id="channelSearch" name="channelSearch" type="text" placeholder="Find or create channel" maxlength="60"/>'.concat('<button style="display:none" id="addChannel" class="btn btn-primary _icon_add"> Create new channel</button>').concat('<div id="channelError" style="display: none"></div>').concat('<div id="channelList">').concat(a5(bl)).concat("</div>")
                                    }
                                function bg(bm) {
                                        if (bm) {
                                            var bl = document.getElementById("channelSearch").value;
                                            if (bl && bd.map(function (bn) {
                                                return bn.title.toLowerCase().trim() !== bl.toLowerCase().trim()
                                            }).reduce(function (bn, bo) {
                                                return bn && bo
                                            })) {
                                                document.getElementById("addChannel").setAttribute("style", "display: inline")
                                            } else {
                                                document.getElementById("addChannel").setAttribute("style", "display: none")
                                            }
                                            return bm
                                        } else {
                                            document.getElementById("addChannel").setAttribute("style", "display: inline");
                                            return ""
                                        }
                                    }
                                function a6() {
                                        be = true;
                                        bh.popover("hide")
                                    }
                                function bk(bm, bl) {
                                        bl.map(function (bn) {
                                            if (bn.id === bm) {
                                                bn.contains[a0.id] = true
                                            }
                                        });
                                        document.getElementById(bm.toString()).checked = true;
                                        document.getElementById("checked-" + bm).setAttribute("style", "display: inline-block");
                                        document.getElementById("unchecked-" + bm).setAttribute("style", "display: none")
                                    }
                                function bj(bm, bl) {
                                        bl.map(function (bn) {
                                            if (bn.id === bm) {
                                                bn.contains[a0.id] = false
                                            }
                                        });
                                        document.getElementById("checked-" + bm).setAttribute("style", "display: none");
                                        document.getElementById("unchecked-" + bm).setAttribute("style", "display: inline-block")
                                    }
                                function a7(bn, bl) {
                                        var bm = document.getElementById("channelList");
                                        while (bm.firstChild) {
                                            bm.removeChild(bm.firstChild)
                                        }
                                        C(bm).append(bg(a5(a8(bn, bl), bl)))
                                    }
                                function bb() {
                                        bh.popover({
                                            container: "body",
                                            placement: "left",
                                            title: '<span class="_icon_images"></span> Post to channel<span id="closeAddChannel" class="_icon_close"></span>',
                                            content: bf(bd),
                                            trigger: "click",
                                            html: true
                                        })
                                    }
                                function a9(bm) {
                                        var bl = document.getElementById("channelError");
                                        bl.textContent = JSON.parse(bm.responseText).error.description;
                                        bl.setAttribute("style", "display: block")
                                    }
                                bb();
                                bh.on("vclick", function () {
                                        if (be) {
                                            if (bd.length > 15) {
                                                C("body").addClass("fixPopover")
                                            }
                                            if (!(document.documentElement.hasOwnProperty("ontouchstart"))) {
                                                C("#channelSearch").focus()
                                            }
                                        } else {
                                            bh.popover("destroy");
                                            bb()
                                        }
                                        be = !be
                                    });

                                function ba() {
                                        var bm = document.getElementById("channelSearch"),
                                            bl = document.getElementById("addChannel"),
                                            bn = bm.value.trim();
                                        bm.setAttribute("disabled", "true");
                                        bl.setAttribute("disabled", "true");
                                        C.ajax({
                                                url: window.contextPath + "/api/user/me/channels",
                                                type: "POST",
                                                data: {
                                                    title: bn
                                                },
                                                success: function (bo) {
                                                    bl.setAttribute("style", "display: none");
                                                    if (!bo.results.contains) {
                                                        bo.results.contains = {};
                                                        bo.results.contains[a0.id.toString()] = false
                                                    }
                                                    if (bn !== bo.results.title) {
                                                        bm.value = bo.results.title
                                                    }
                                                    bd.push(bo.results);
                                                    bd.sort(bi);
                                                    a7(bm.value, bd)
                                                },
                                                error: function (bo) {
                                                    a9(bo)
                                                },
                                                complete: function () {
                                                    bm.removeAttribute("disabled");
                                                    bl.removeAttribute("disabled")
                                                }
                                            })
                                    }
                                C("body").on("vclick", "#addChannel", ba);
                                C("body").on("change", ".addToChannel", function (bo) {
                                        var bn = bo.target,
                                            bm = bn.id;
                                        bn.setAttribute("disabled", "true");
                                        var bl = document.getElementById("progress-" + bm);
                                        if (document.addEventListener) {
                                                bl.setAttribute("style", "width: 25%")
                                            }
                                        if (bo.target.checked) {
                                                C.ajax({
                                                    url: window.contextPath + "/api/channel/" + bm + "/content",
                                                    data: {
                                                        itemIds: a0.id
                                                    },
                                                    xhr: function () {
                                                        var bp = C.ajaxSettings.xhr();

                                                        function bq(br) {
                                                            if (br.lengthComputable) {
                                                                var bs = br.loaded / br.total;
                                                                bl.setAttribute("style", "width: " + bs * 100 + "%")
                                                            }
                                                        }
                                                        if (bp.addEventListener) {
                                                            bp.addEventListener("progress", bq, false)
                                                        }
                                                        return bp
                                                    },
                                                    type: "POST",
                                                    success: function () {
                                                        bk(bm, bd)
                                                    },
                                                    error: function (bp) {
                                                        a9(bp)
                                                    },
                                                    complete: function () {
                                                        bn.removeAttribute("disabled");
                                                        if (bl.classList) {
                                                            bl.classList.add("progressDone");
                                                            setTimeout(function () {
                                                                bl.removeAttribute("style");
                                                                bl.classList.remove("progressDone")
                                                            }, 400)
                                                        }
                                                    }
                                                })
                                            } else {
                                                C.ajax({
                                                    url: window.contextPath + "/api/channel/" + bm + "/content?itemIds=" + a0.id,
                                                    type: "DELETE",
                                                    xhr: function () {
                                                        var bp = C.ajaxSettings.xhr();

                                                        function bq(br) {
                                                            if (br.lengthComputable) {
                                                                var bs = br.loaded / br.total;
                                                                bl.setAttribute("style", "width: " + bs * 100 + "%")
                                                            }
                                                        }
                                                        if (bp.addEventListener) {
                                                            bp.addEventListener("progress", bq, false)
                                                        }
                                                        return bp
                                                    },
                                                    success: function () {
                                                        bj(bm, bd)
                                                    },
                                                    error: function (bp) {
                                                        a9(bp)
                                                    },
                                                    complete: function () {
                                                        bn.removeAttribute("disabled");
                                                        if (bl.classList) {
                                                            bl.classList.add("progressDone");
                                                            setTimeout(function () {
                                                                bl.removeAttribute("style");
                                                                bl.classList.remove("progressDone")
                                                            }, 400)
                                                        }
                                                    }
                                                })
                                            }
                                    });
                                C("body").on("keyup", "#channelSearch", function (bl) {
                                        document.getElementById("channelError").setAttribute("style", "display: none");
                                        if (bl.keyCode === 13) {
                                            ba(bl)
                                        } else {
                                            if (bl.keyCode === 27) {
                                                a6()
                                            } else {
                                                a7(bl.target.value, bd)
                                            }
                                        }
                                    });
                                C("body").on("vclick", "#closeAddChannel", a6);
                                if (!document.documentElement.hasOwnProperty("ontouchstart")) {
                                        C(window).resize(a6)
                                    }
                                C(document).on("vclick", function (bl) {
                                        if (bl.target.className.toLowerCase().indexOf("post") === -1 && !C(bl.target).closest("div.popover").length && C("div.popover").is(":visible")) {
                                            a6()
                                        }
                                    })
                            }
                        })
                    }
                };
                if (a0.id) {
                    aH();
                    var aG = function (a5) {
                        return function (a6) {
                            a6.stopPropagation();
                            var a7;
                            if (a5 === "Share") {
                                a7 = ae
                            } else {
                                if (a5 === "Touch") {
                                    a7 = N
                                } else {
                                    if (a5 === "Fullscreen") {
                                        a7 = af
                                    }
                                }
                            }
                            a7(a4, aS, a0, aR);
                            return false
                        }
                    };
                    if (I && I.extraSidebarIcons && I.extraSidebarIcons.indexOf("Fullscreen") !== -1) {
                        a4.find(".tlMenuFullscreen").parent().unbind("vclick").bind("vclick", aG("Fullscreen"))
                    }
                    var aU, aN;
                    for (aU = 0; aU < Z.length; aU++) {
                        aN = Z[aU];
                        if (!a3[aN.toLowerCase()] || aV) {
                            a4.find(".tlMenu" + aN).parent().unbind("vclick").bind("vclick", aG(aN));
                            if (aN === "Touch") {
                                aj([a0.touched, a0.id, a0.touches])
                            }
                        } else {
                            a4.find(".tlMenuItem" + aN).hide()
                        }
                    }
                    if (aQ || aF || a0.visibility === "PRIVATE") {
                        aD()
                    }
                } else {
                    aD()
                }
                ad(a4, aS, a0);
                if (!I.manualViewStats) {
                    x.installTracker(a0, a4)
                }
                if (!I.disableContextMenu && !I.disableMenuItems) {
                    am(a4, aR, a3)
                }
                if (aV) {
                    a4.addClass("tlThinglinkSite")
                }
                var a1 = function (a5) {
                    return function (a6) {
                        var a7 = C(this);
                        if (a6.type === "touchend") {
                            a7.click();
                            return false
                        }
                        if (a6.type === "mouseenter") {
                            a7.addClass(a5)
                        } else {
                            a7.removeClass(a5)
                        }
                    }
                };
                C(".tlSidebar .tlMenuItem").bind("mouseenter mouseleave touchend", a1("tlMenuItemHover"));
                if (a0 && a.no(a0.error)) {
                    F.attach(a4);
                    if (aX) {
                        a4.find(".tlMenuItemTouch").hide()
                    }
                    if (I.makeSidebarSticky) {
                        C(".tlSidebar").show()
                    }
                    var aC = function (a5) {
                        var a7 = ["contentUrl", "icon", "thingUrl"],
                            a6, a8;
                        for (a6 = 0; a6 < a7.length; a6++) {
                                a8 = a7[a6];
                                if (a5[a8] && a5[a8].substring(0, 2) === "//") {
                                    a5[a8] = a.getProtocol() + a5[a8]
                                }
                            }
                    };
                    var aO = a0.things,
                        a2, aK;
                    if (aO !== undefined) {
                            var aP = 0;
                            var aE = function (a5) {
                                v.resizeNubbinsForThing(a5.id, a5.nubbin);
                                aP = aP + 1;
                                if (I.nubbinSneakPeek && (aP === aO.length)) {
                                    ai(a4);
                                    P(a4)
                                } else {
                                    if (I.makeNubbinsSticky) {
                                        setTimeout(function () {
                                            l.variateOpacity("show", a4.find("div.nubbin"), 1)
                                        }, 1)
                                    }
                                }
                            };
                            var aJ;
                            for (a2 = 0; a2 < aO.length; a2++) {
                                aK = aO[a2];
                                aC(aK);
                                if (C.type(aK.styles) != "object") {
                                    aJ = "";
                                    try {
                                        aJ = aK.styles ? JSON.parse(aK.styles) : {}
                                    } catch (aY) {}
                                    aK.styles = C.extend(o.defaultCustomStyles(), aJ)
                                }
                                if (C.type(aK.properties) != "object") {
                                    var aA = {};
                                    try {
                                        aA = aK.properties ? JSON.parse(aK.properties) : aA
                                    } catch (aY) {}
                                    aK.properties = aA
                                }
                                ao(a4, aS, aK, aR, aX, aE)
                            }
                        }
                    U(a4, aO)
                }
            } catch (aI) {
                console.log(aI)
            }
        }
        function R(aA) {
            if (aA.lang) {
                I.setRequestLanguage(aA.lang)
            }
            if (aA.owner === true || aA.owner === false) {
                j.setUserLoggedIn(true)
            }
            d.getQueriedImages().each(function () {
                var aF = C(this);
                var aG = H.getSceneUrl(this);
                var aE = aA[Q(aF).id];
                if (!aE) {
                    aE = aA[aG]
                }
                if (!aE) {
                    aE = aA[a.cleanURIEncoding(aG)]
                }
                if (!aE) {
                    aE = aA[encodeURIComponent(aG)]
                }
                if (!aE) {
                    try {
                        aE = aA[decodeURIComponent(aG)]
                    } catch (aI) {}
                }
                if (!aE) {
                    aE = null
                }
                var aD = (aE && aE.things && aE.things.length !== 0);
                var aC = (aE && aF.tlImage("isAlwaysThinglink"));
                if (aA.owner || (aE && aE.allowEdit) || aD || aC) {
                    s.triggerEvent("tlScenesFound");
                    aF.parents(".tlImageContainer").find(".tlMenu").show();
                    aF.tlImage("sceneData", aE);
                    if (aF.tlImage("hasSize")) {
                        al(aF)
                    } else {
                        aF.load(function () {
                            al(aF)
                        })
                    }
                } else {
                    if (aE) {
                        var aB = aF.parents(".tlImageContainer");
                        aB.find(".tlMenu, .tlSidebar").hide(200);
                        aB.unbind("mouseenter mouseleave");
                        var aH = {
                            w: 0,
                            h: 0
                        };
                        if (aF.tlImage("hasSize")) {
                            aH = f.getDimensions(aF)
                        }
                        aB.css({
                            cssText: "width:" + aH.w + "px!important; height:" + aH.h + "px!important;"
                        })
                    }
                }
            })
        }
        function ay() {
            var aA = window.location.href.replace(/^[^\#]+\#?/, "");
            if (aA.match(/tl[\-\=]/)) {
                aA = aA.slice(3);
                C("img").each(function () {
                    var aC = r.generateImageHash(this);
                    if (aC == aA) {
                        var aB = I.activateImage;
                        if (aB) {
                            aB(C(this))
                        }
                        return false
                    }
                })
            }
        }
        function aq() {
            C.extend(C.easing, {
                easeOutCubic: function (aB, aC, aA, aE, aD) {
                    return aE * ((aC = aC / aD - 1) * aC * aC + 1) + aA
                }
            })
        }
        function ah(aB) {
            if (aB.tlImage("isOk")) {
                d.addQueriedImage(aB);
                var aA = Q(aB).id;
                if (!aA) {
                    if (window.__tlid) {
                        w.rebuild(H.getSceneUrl(aB))
                    } else {
                        var aC = B.getCacheSceneId(H.getSceneUrl(aB));
                        if (aC) {
                            aB.attr("tl-scene-id", aC);
                            w.rebuild(aC)
                        }
                    }
                } else {
                    w.rebuild(aA)
                }
            }
        }
        function O(aC) {
            var aB = C(aC);
            var aA = aB.closest(".tlImageContainer");
            if (aA.length > 0) {
                w.removeTags(aA);
                aB.removeAttr("tl-scene-id");
                aA.find(".tlEmbedPopup, .tlSharePopup").remove()
            }
            ah(aB)
        }
        var an = function (aG, aF, aC) {
            if (!aG) {
                return
            }
            var aB = aG.attr("tl-thing-id"),
                aE = C("img[tl-scene-id=" + aF + "]").first(),
                aA = J(aB, aE.tlImage("sceneData"));
            var aD = function (aH) {
                    x.logClick(aB, aF, aE, aH)
                };
            if (aC) {
                    aC = decodeURIComponent(aC);
                    g.relocateOrOpen(aC, aD, aA, window.top === window.self)
                } else {
                    aD()
                }
        };
        var J = function (aC, aA) {
            var aB;
            if (aA) {
                aA.things.map(function (aD) {
                    if (aD.id === aC) {
                        aB = aD
                    }
                })
            }
            return aB
        };
        var at = function (aH, aC) {
            if (!aH) {
                return
            }
            var aB = aH.attr("tl-thing-id");
            var aG = C("#tl-a-" + aB).find("iframe");
            var aF = aH.data("thing").styles || aH.data("tlStyles") || {};
            aF = a.extend(o.defaultCustomStyles(), aF);
            var aE = aH.data("thing").productName || aH.tlTag("getRawDescription") || "";
            var aD = aH.data("thing").properties || aH.tlTag("getRawProperties") || {};
            var aA = o.mergeParcelData(aF, aE, aD);
            aA = a.extend(aA, (aH.tlTag("getParcel") || {}));
            o.sendParcelToIframe(aG, aA, aC)
        };
        var V = function () {
            C(".tlSharePopup").hide()
        };
        var S = function (aE, aB) {
            if (!aE) {
                return
            }
            aB = decodeURIComponent(aB);
            var aC = A.getThingPieces(aE);
            var aA = aC.bubble.data("bubbledata");
            var aD = aA.rtid;
            k.registerThing(aB, aD)
        };
        var ac = function (aC, aB) {
            if (!aC) {
                return
            }
            if (aB == "true") {
                aB = true
            } else {
                if (aB == "false") {
                    aB = false
                } else {
                    aB = null
                }
            }
            var aA = aC.attr("tl-thing-id");
            C("#tl-a-" + aA).toggleClass("tlPlaying tlSticky", aB)
        };
        var X = function (aB, aA) {
            if (!aB) {
                return
            }
            aA = decodeURIComponent(aA);
            if (/^http:\/\//.test(aA)) {
                aB.attr("href", aA)
            } else {
                aB.removeAttr("href")
            }
        };
        var W = function (aJ, aB, aM) {
            if (!aJ) {
                return
            }
            var aK = parseInt(aB, 10);
            var aE = parseInt(aM, 10);
            if (isNaN(aK) && isNaN(aE)) {
                return
            }
            var aF = aJ.attr("tl-thing-id");
            var aH = C("#tl-a-" + aF).find(".tlThingContent");
            var aL = aH.find(".tlSpinner");
            var aD = aH.find("iframe");
            var aA = u.parseCssText(aD.attr("style"), true, true);
            var aG = aA["max-width"];
            var aN = aA["max-height"];
            if (aK > 0) {
                if (aK < 50) {
                    aK = 50
                } else {
                    if (aK > 800) {
                        aK = 800
                    }
                }
                if (aG && aK > aG) {
                    aK = aG
                }
                aA.width = aK + "px;";
                var aI = u.parseCssText(aH.attr("style"), false, false);
                aI.width = aK + "px !important";
                aH.css({
                    cssText: a.mapToCssText(aI)
                })
            } else {
                aA.width = aD.width() + "px;"
            }
            if (aE > 0) {
                if (aE < 20) {
                    aE = 20
                } else {
                    if (aE > 600) {
                        aE = 600
                    }
                }
                if (aN && aE > aN) {
                    aE = aN
                }
                aA.height = aE + "px;"
            } else {
                aA.height = aD.height() + "px;"
            }
            aA["max-width"] = aA["max-width"] + "px";
            aA["max-height"] = aA["max-height"] + "px";
            var aC = "";
            if (aA.opacity) {
                aC += " opacity: " + aA.opacity + ";";
                aA.opacity = null
            }
            aL.css({
                cssText: a.mapToCssText(aA, true)
            });
            aD.css({
                cssText: a.mapToCssText(aA, true) + aC
            });
            if (aJ.hasClass("hovered")) {
                c(aJ)
            }
        };
        var az = function (aA) {
            if (w.editorPopup) {
                w.editorPopup.close();
                w.editorPopup = null
            }
            C("#thinglinkCBClose").click();
            if (w.editorCloseCallback) {
                w.editorCloseCallback.call(this, aA)
            }
        };

        function ak(aB) {
            var aD = aB[0];
            var aA = aB[1];
            var aC = aB[2];
            switch (aD) {
            case "resize":
                W(aA, aC[0], aC[1]);
                break;
            case "setSticky":
                ac(aA, aC[0]);
                break;
            case "closeEditor":
                az(aC[0]);
                break;
            case "setNubbinClickUrl":
                X(aA, aC[0]);
                break;
            case "changeTagContentUrl":
                S(aA, aC[0]);
                break;
            case "touchLogin":
                j.touchLoginCallback(null, aC[0]);
                break;
            case "sharingLinkOpened":
                V(aC[0], aC[1]);
                break;
            case "tagClick":
                an(aA, aC[0], aC[1]);
                break;
            case "getStyles":
                at(aA, aC[0]);
                break;
            default:
                console.warn("Unknown postmessage command " + aD)
            }
        }
        function ax(aC) {
            if (w.status != "loadcomplete") {
                var aA = aC.parent().parent();
                w.removeTags(aA);
                aA.find(".tlMenuItemShare,.tlMenuItemTouch").show();
                var aB = aC.attr("tl-scene-id");
                var aD = H.getSceneUrl(aC);
                if (!aB) {
                    w.rebuild(aD)
                } else {
                    w.rebuild(aB)
                }
            }
        }
        function L() {
            var aB = true;
            var aC = 0;
            var aE = a.isTouchDevice ? "tlTouchDevice" : "";
            var aD = C("#tlTagContainer");
            if (aD.length === 0) {
                aD = C('<div id="tlTagContainer" class="' + aE + '"/>').appendTo("body")
            } else {
                aD.addClass(aE)
            }
            var aA = {
                tagify: function (aP) {
                    var aN = C.extend({
                        complete: null,
                        everyLink: false,
                        maxAge: null
                    }, aP);
                    var aH = function () {
                        aC++;
                        return aC
                    };
                    var aL = function (aR, aT, aS) {
                        C.getJSON(I.getApiBaseUrl() + "/api/resolvetag?client_id=" + I.clientId + "&url=" + aR.map(encodeURIComponent).join("|") + (aN.maxAge ? "&maxAge=" + aN.maxAge : "") + (aS ? "&appId=" + aS : "") + (I.isThinglinkSite() ? "" : "&callback=?"), aT)
                    };
                    var aO = function (aR, aW, aX) {
                        var aS = ((aW !== undefined) ? aW.content : {});
                        if (C.isEmptyObject(aS) && aR.attr("href") !== "") {
                            aS.title = aR[0].hostname;
                            aS.thingUrl = aR.attr("href")
                        }
                        aS.id = aR.attr("tl-thing-id");
                        aS.productName = aR.attr("title") || "";
                        var aT = aR.attr("data-tagopacity");
                        aS.opacity = (aT == null || aT.length === 0) ? "1.0" : parseFloat(aT);
                        aR.data("thing", aS);
                        if (!aX && A.getThingPieces(aR).nubbin[0].offsetLeft > 0) {
                            var aV = g.render(aS, null, c);
                            K(aV);
                            var aU = aV.data("bubbledata").rtid;
                            aR.addClass("rtid-" + aU);
                            aD.append(aV)
                        }
                        E.attach(aR)
                    };
                    var aK = function (aR) {
                        aR.removeAttr("tl-thing-id").removeClass("tagx");
                        aR[0].className = aR[0].className.replace(/tl-a-000\d+ ?/, "")
                    };
                    var aG = function (aW, aV) {
                        var aT, aS, aX = [];
                        var aU, aR;
                        for (aT in aV) {
                            if (aV.hasOwnProperty(aT)) {
                                aU = aV[aT];
                                for (aS = 0; aS < aU.length; aS++) {
                                    if (!C.isEmptyObject(aW[aT]) || aN.everyTag) {
                                        aR = (aS !== 0);
                                        aO(aU[aS], aW[aT], aR);
                                        aX.push(aU[aS])
                                    } else {
                                        aK(aU[aS])
                                    }
                                }
                            }
                        }
                        if (typeof aN.complete == "function") {
                            aN.complete.call(document, aX)
                        }
                    };
                    if (aB) {
                        aB = false;
                        q.injectEmbedCSS()
                    }
                    var aQ = this.filter("a[href],a[tl-tagify-url]");
                    var aM = {};
                    var aJ = [];
                    var aF;
                    aQ.each(function () {
                        var aR = C(this);
                        var aU = aR.attr("tl-tagify-url");
                        var aS = aU || (aR.attr("href") != null ? this.href : "#");
                        var aT;
                        aF = aR.attr("tl-tagify-appid");
                        if (aN.everyTag || (aS.length > 5 && aS.substring(0, 1) != "#")) {
                            if (aM[aS]) {
                                aT = aM[aS][0].attr("tl-thing-id");
                                aM[aS].push(aR)
                            } else {
                                aT = "000" + aH();
                                aM[aS] = [aR];
                                aJ.push(aS)
                            }
                            aR.addClass("tl-a-" + aT).addClass("tagx").attr("tl-thing-id", aT)
                        }
                    });
                    var aI = function (aR) {
                        aG(aR, aM)
                    };
                    if (aQ.length > 0) {
                        aL(aJ, aI, aF)
                    }
                },
                isImageTag: function () {
                    var aF = this.attr("tl-thing-id");
                    if (aF.substring(0, 3) == "000") {
                        return false
                    }
                    return true
                },
                reposition: function () {
                    this.each(function () {
                        c(C(this))
                    });
                    return this
                },
                updateBubbleToParcel: function (aF) {
                    aF.each(function (aJ, aK) {
                        var aM = C(this);
                        var aH = aM.attr("tl-thing-id");
                        var aI = C("#tl-a-" + aH);
                        var aL = "";
                        if (aM.data("thing")) {
                            aL = a.getSourceDomain(aM.data("thing").contentUrl)
                        }
                        var aG = aM.tlTag("getParcel");
                        o.applyNewCustomization(aI, aG, aL)
                    })
                },
                setStyles: function (aG) {
                    this.data("tl-styles", aG);
                    var aF = this.data("tl-parcel") || {};
                    aF = a.extend(aF, aG);
                    this.data("tl-parcel", aF);
                    aA.updateBubbleToParcel(this)
                },
                getStyles: function () {
                    return this.data("tl-styles")
                },
                getParcel: function () {
                    return this.data("tl-parcel")
                },
                getRawDescription: function () {
                    return this.data("tl-raw-description")
                },
                setProperties: function (aG) {
                    this.data("tl-raw-properties", aG);
                    var aF = this.data("tl-parcel") || {};
                    aF = a.extend(aF, {
                        properties: aG
                    });
                    this.data("tl-parcel", aF);
                    aA.updateBubbleToParcel(this)
                },
                getRawProperties: function () {
                    return this.data("tl-raw-properties")
                },
                setDescription: function (aI, aF) {
                    this.data("tl-raw-description", aI);
                    aI = aI.replace(/\n\n+/g, "\n\n");
                    aI = aI.replace(/\n/g, "<br>");
                    var aH = this.data("thing");
                    var aG = (aH && aH.hideDescription === true);
                    this.each(function () {
                        var aN = C(this);
                        var aL = aN.attr("tl-thing-id");
                        var aM = C("#tl-a-" + aL);
                        if (aM.hasClass("tlThemeIframeThing")) {
                            if (!aG) {
                                if (aM.find(".tlIframeDescription").length === 0) {
                                    if (aI.length > 0) {
                                        aM.find(".tlThingContent").prepend('<div class="tlIframeDescription" /><hr class="tlHrDescription" />')
                                    }
                                } else {
                                    if (aI === "") {
                                        aM.find(".tlIframeDescription").remove();
                                        aM.find(".tlHrDescription").remove()
                                    }
                                }
                                aM.find(".tlIframeDescription").html(aI)
                            } else {
                                if (aM.find(".tlIframeDescription").length > 0) {
                                    aM.find(".tlIframeDescription").remove()
                                }
                            }
                        } else {
                            if (aM.hasClass("tlThemeRichThing")) {
                                aM.find(".tlThingTitle").html(aI)
                            } else {
                                var aK = aM.find(".tlThingContent");
                                aK.html(aI);
                                g.setBubbleTagTextStyle(aM, aI);
                                if (aF.length > 0) {
                                    if (aI.length > 0) {
                                        aK.append("<br>")
                                    }
                                    var aJ = C('<a class="tlThingLink" href="' + aF + '"></a>');
                                    aJ.text(aJ[0].hostname);
                                    aK.append(aJ)
                                }
                            }
                        }
                    });
                    return this
                },
                open: function (aF) {
                    this.each(function () {
                        var aG = C(this);
                        if (!aG.hasClass("hovered")) {
                            C("#tl-a-" + aG.attr("tl-thing-id")).addClass(aF ? "tlSticky" : "");
                            aG.mouseenter();
                            c(aG)
                        }
                    });
                    return this
                },
                close: function () {
                    this.each(function () {
                        var aF = C(this);
                        var aG = aF.attr("tl-thing-id");
                        aF.removeClass("tlSticky mouseover linked hovered");
                        if (C("#tl-a-" + aG).hide().hasClass("tlPlaying")) {
                            C("#tl-a-" + aG).find(".tlThingClose").click()
                        }
                    });
                    return this
                },
                isOpen: function () {
                    return this.hasClass("hovered")
                }
            };
            C.fn.tlTag = function (aF) {
                return aA[aF].apply(this, Array.prototype.slice.call(arguments, 1))
            }
        }
        function av() {
            h.finalFetchCompleteCallback(function () {
                n.setStatus("tagfetchcomplete")
            });
            h.dataReceivedCallback(R);
            k.init();
            k.addListener("postMessageCommand", ak);
            j.addListener("updateSceneTouchStatus", aj);
            i.addListener("editorClose", ax);
            L();
            var aA = function (aC) {
                ah(C(aC))
            };
            var aB = function (aC) {
                O(C(aC))
            };
            e.track("img", "src", aA, aB);
            C(window).bind("resize", b({
                after: function () {
                    w.reposition()
                },
                threshold: 200,
                allowPropagation: true
            }));
            window.addEventListener("hashchange", function () {
                w.rebuild()
            }, false);
            aq();
            ay();
            ap()
        }
        av()
    }());
    return w
});
tlRequire.define("measure", ["jQuery", "util"], function (c, a) {
    var b = {
        limitSizeHelper: function (f, e, k) {
            var i = 18;
            var h = f[1] - f[0];
            if (h < i) {
                var d = (i - h) / 2;
                f[0] = f[0] - d;
                f[1] = f[1] + d;
                var j = (e - f[0]);
                if (j > 0) {
                    f[0] = e;
                    f[1] = f[1] + j
                }
                var g = (f[1] - k);
                if (g > 0) {
                    f[0] = f[0] - g;
                    f[1] = k
                }
            }
            return f
        },
        getThingRect: function (e, k) {
            var d = c(e);
            if (d.length) {
                var l = b.getExtent(d),
                    h = d.width(),
                    f = d.height(),
                    j = [Math.round(h * k.x1), Math.round(h * k.x2)],
                    i = [Math.round(f * k.y1), Math.round(f * k.y2)];
                j = b.limitSizeHelper(j, 0, h);
                i = b.limitSizeHelper(i, 0, f);
                var g = {
                        t: i[0] + l.t,
                        l: j[0] + l.l,
                        w: (j[1] - j[0]),
                        h: (i[1] - i[0])
                    };
                return g
            } else {
                return {
                    t: 0,
                    l: 0,
                    w: 0,
                    h: 0
                }
            }
        },
        getCoordinates: function (g) {
            var e = c(g);
            if (e.length) {
                var f = b.getExtent(e);
                var d = f.l;
                var h = f.t;
                return {
                    x: d,
                    y: h
                }
            } else {
                return {
                    x: 0,
                    y: 0
                }
            }
        },
        getDimensions: function (i) {
            var f = c(i);
            var e = {
                w: 0,
                h: 0,
                rawWidth: 0,
                rawHeight: 0
            };
            if (f.length) {
                var h = b.getExtent(f);
                e = a.extend(h);
                e.rawWidth = f.width();
                e.rawHeight = f.height();
                var d = e.rawWidth + h.l + h.r;
                var g = e.rawHeight + h.t + h.b;
                e.w = d;
                e.h = g
            }
            return e
        },
        getExtent: function (e, p) {
            var d = c(e);
            if (!p) {
                p = ["margin", "padding", "border"]
            }
            var n = ["box-sizing", "border-left-color", "border-top-color", "border-right-color", "border-bottom-color", "border-left-style", "border-top-style", "border-right-style", "border-bottom-style", "border-left-width", "border-top-width", "border-right-width", "border-bottom-width", "padding-left", "padding-top", "padding-right", "padding-bottom", "background-color", "left", "top", "right", "bottom"];
            var k = {
                l: 0,
                t: 0,
                r: 0,
                b: 0
            },
                f, g, l;
            if (d.length) {
                    for (f = 0; f < n.length; f++) {
                        k[n[f]] = d.css(n[f]) || 0
                    }
                    for (f = 0; f < p.length; f++) {
                        g = p[f];
                        l = (g == "border") ? "-width" : "";
                        var h = g + "-left" + l;
                        var m = g + "-top" + l;
                        var j = g + "-right" + l;
                        var o = g + "-bottom" + l;
                        k[h] = parseInt(d.css(h), 10) || 0;
                        k[m] = parseInt(d.css(m), 10) || 0;
                        k[j] = parseInt(d.css(j), 10) || 0;
                        k[o] = parseInt(d.css(o), 10) || 0;
                        k.l += k[h];
                        k.t += k[m];
                        k.r += k[j];
                        k.b += k[o]
                    }
                }
            return k
        }
    };
    return b
});
tlRequire.define("namespace", [], function () {
    if (window.__thinglink === undefined) {
        window.__thinglink = {}
    }
    if (window.__tlconfig !== undefined) {
        window.__thinglink.config = window.__tlconfig
    }
    return window.__thinglink
});
tlRequire.define("nodeChangeTracker", ["browserFeats"], function (e) {
    function a(f, h, g) {
        return f.each(function () {
            var k = this;
            var j = k[h];
            var i = function (m) {
                if (m && m.attrName && m.attrName != h) {
                    return
                }
                var n = k[h];
                if (n != j) {
                    var l = j;
                    j = n;
                    g(k, n, l)
                }
            };
            if (typeof(this.onpropertychange) === "object") {
                $tlJQ(this).unbind("propertychange").bind("propertychange", i)
            } else {
                if (e.hasDomAttrModified()) {
                    $tlJQ(this).unbind("DOMAttrModified").bind("DOMAttrModified", i)
                }
            }
        })
    }
    function b(f, j, i, h) {
        if (!h) {
            h = 1000
        }
        var g = function () {
            $tlJQ(f).each(function () {
                var m = $tlJQ(this);
                var l = this[j];
                var k = m.data("store-value-" + j);
                if (!k) {
                    m.data("store-value-" + j, l)
                } else {
                    if (l != k) {
                        m.data("store-value-" + j, l);
                        i(this, l, k)
                    }
                }
            })
        };
        g();
        setInterval(g, h)
    }
    function d(j, g, h, k, i) {
        if (!i) {
            i = 1000
        }
        var f = function (l) {
            setTimeout(function () {
                var m = $tlJQ(l);
                if (m.closest(".tlImageContainer").length !== 0 && !$tlJQ._data(m.closest(".tlImageContainer").get(0), "events")) {
                    k(l)
                } else {
                    if (!m.tlImage("isInspectedByThinglink") && m.tlImage("isOk")) {
                        if (m.tlImage("hasSize")) {
                            g(l)
                        } else {
                            m.load(function () {
                                g(l)
                            })
                        }
                    }
                }
                if (h) {
                    h(l)
                }
            }, 1)
        };
        if (e.hasDomNodeInserted()) {
            $tlJQ(document).bind("DOMNodeInserted", function (m) {
                var l = $tlJQ(m.target).find(j).each(function () {
                    f(this)
                });
                if (m.target.nodeName.toLowerCase() === j) {
                    f(m.target)
                }
            })
        } else {
            setInterval(function () {
                $tlJQ(j).each(function () {
                    f(this)
                })
            }, i)
        }
    }
    function c(i, g, f, h) {
        if (e.hasDomAttrModified() || typeof(document.body.onpropertychange) === "object") {
            a($tlJQ(i), g, h);
            d(i, f, function (j) {
                a($tlJQ(j), g, h)
            }, h)
        } else {
            b(i, g, h);
            d(i, f, null, h)
        }
    }
    return {
        track: c
    }
});
tlRequire.define("nubbinIconSizeManager", ["jQuery", "cssUtil"], function (c, b) {
    var a = (function () {
        var f = {};
        var h = function (m, k, j) {
            var i = 0;
            var l = 0;
            var n = false;
            if (f[m]) {
                i = f[m].w;
                l = f[m].h
            }
            if (j.width > i) {
                i = j.width;
                n = true
            }
            if (j.height > l) {
                l = j.height;
                n = true
            }
            if (n) {
                f[m] = {
                    w: i,
                    h: l
                };
                g(c(".tagx.nubbin-" + m), m, i, l)
            }
        };
        var g = function (l, j, i, k) {
            if (j && j.indexOf("svg") === -1) {
                l.each(function () {
                    var q = c(this);
                    var p = b.parseCssText(q.attr("style"), true, true);
                    var m = false;
                    if (i > p.width) {
                        m = true;
                        var o = parseInt(p.left, 10) + p.width / 2;
                        p.left = o - i / 2;
                        p.width = i
                    }
                    if (k > p.height) {
                        m = true;
                        var n = parseInt(p.top, 10) + p.height / 2;
                        p.top = n - k / 2;
                        p.height = k
                    }
                    if (m) {
                        var r = {
                            l: p.left,
                            t: p.top,
                            w: p.width,
                            h: p.height
                        };
                        b.repositionElement(r, q[0])
                    }
                })
            }
        };
        var d = function () {
            var i;
            for (i in f) {
                if (f.hasOwnProperty(i)) {
                    g(c(".tagx.nubbin-" + i), i, f[i].w, f[i].h)
                }
            }
        };
        var e = function (j, i) {
            var k = c(".tagx.tl-a-" + j);
            if (f[i] !== undefined) {
                g(k, i, f[i].w, f[i].h)
            }
        };
        return {
            registerIcon: h,
            resizeAllNubbinsIfTooSmall: d,
            resizeNubbinsForThing: e
        }
    }());
    return a
});
tlRequire.define("nubbinRenderer", ["nubbinIconSizeManager", "config", "util", "cssUtil"], function (c, b, a, e) {
    var d = (function () {
        var i = ["plain", "hover", "hoverlink", "highlight"];
        var h = {};

        function j(k) {
            return b.getCDNUrl() + "/api/nubbin/" + k
        }
        function g(n, m) {
            if (n) {
                var l = j(n) + "/" + m,
                    k = new Image();
                k.onload = function () {
                        c.registerIcon(n, m, this)
                    };
                k.src = l;
                return "style=\"background-image: url('" + l + "') !important;\" "
            } else {
                return ""
            }
        }
        return function (n) {
            if (!h[n]) {
                var l = {};
                var k;
                for (k = 0; k < i.length; k++) {
                    var m = i[k];
                    l[m] = g(n, m)
                }
                h[n] = l
            }
            return h[n]
        }
    }());

    function f(l, n, k) {
        var h = "tl-a-" + n.id;
        var g = n.nubbin ? "nubbin-" + n.nubbin + " " : "";
        var m = $tlJQ('<div class="tagx ' + g + h + '" tl-thing-id="' + n.id + '"></div>');
        e.repositionElement(l, m[0]);
        var o = d(n.nubbin);
        var j = n.thingUrl || "";
        m.attr("href", j);
        var i;
        if (j) {
            i = o.hoverlink
        } else {
            i = o.hover
        }
        var q = $tlJQ('<div class="nubbin"><div class="' + (n && n.nubbin && n.nubbin.indexOf("svg") !== -1 ? "" : "nubbinGlow") + '" ' + o.highlight + '></div><div class="nubbinIcon" ' + o.plain + '></div><div class="nubbinHoverIcon" ' + i + "></div></div>");
        if ( !! n.pinned) {
            q.addClass("pinned")
        } else {
            q.addClass("unpinned")
        }
        q.appendTo(m);
        var p;
        if (k) {
            p = $tlJQ('<div id="' + k + '" class="tlThingContainer"></div>')
        } else {
            p = $tlJQ('<div class="tlThingContainer" ></div>')
        }
        m.appendTo(p);
        return p
    }
    return {
        render: f
    }
});
tlRequire.define("popup", ["config", "txt"], function (b, a) {
    function c(e, g, m, f) {
        var d = $tlJQ(m, e).first();
        if (d.length === 0) {
            var j = $tlJQ.trim(m.replace(/\./g, " "));
            d = $tlJQ('<div class="' + j + ' tlPopup"></div>');
            var l = $tlJQ('<a href="#" class="tlCloseBtn"></a>');
            var k = $tlJQ('<div class="tlPopupInner"></div>');
            l.bind("vmouseup", function (n) {
                d.hide();
                return false
            });
            if (f) {
                f(k)
            }
            if (b.showPoweredBy && !g.tlImage("isWhitelabel")) {
                var i = b.address + "/?buttonSource=" + m;
                var h = $tlJQ('<a href="' + i + '" class="thinglinkInfo">' + a("poweredBy") + "</a>");
                h.click(function (n) {
                    window.open(i)
                });
                k.append(h)
            }
            d.append(k);
            d.append(l);
            e.append(d);
            d.click(function (n) {
                var o = $tlJQ(n.target);
                if (o.hasClass("shareIframeHelpIcon") && o.attr("href").length > 0) {
                    o.click()
                }
                n.stopPropagation();
                return false
            });
            $tlJQ("body").click(function (n) {
                if (d.css("display") !== "none") {
                    d.fadeOut(250)
                }
            })
        }
        e.find(".tlPopup").hide();
        d.show();
        return false
    }
    return {
        setup: c
    }
});
tlRequire.define("positionThing", ["jQuery", "positionThingAlg", "config", "util", "cssUtil", "measure", "sceneUtil"], function (h, f, b, a, g, e, d) {
    function c(v) {
        var m = v.attr("tl-thing-id");
        var p = h("#tl-a-" + m);
        var I = p.find(".tlArrow");
        var D = 13;
        var E = p.height();
        var j = Math.round(((v.height() / 2) - E - D));
        var M = v.closest(".tlImageContainer");
        var L;
        if (b.hOverflow !== null) {
            L = b.hOverflow
        } else {
            L = true
        }
        var F;
        if (b.vOverflow !== null) {
            F = b.vOverflow
        } else {
            F = true
        }
        var n = v.offset(),
            N = h(document.body);
        var K = {
                left: 0,
                top: 0
            };
        if (h.inArray(N.css("position"), ["absolute", "relative"]) !== -1) {
                K = a.getOffsetRect(document.body);
                n.left = n.left - K.left;
                n.top = n.top - K.top
            }
        var U = p.find(".tlThingClose").length > 0 ? 17 : 5;
        var S = 5;
        var i = function () {
                var aa;
                var W;
                if (F === false) {
                    var X = parseInt(v.css("top").replace("px", ""), 10);
                    aa = X + j - U;
                    var V = M.height();
                    var ac = V - X - v.height();
                    W = ac + j - S
                } else {
                    var ab = h(window).scrollTop() - K.top;
                    var Y = h(window).height() + ab;
                    aa = n.top + j - U - ab;
                    var Z = Y - n.top - v.height();
                    W = Z + j - S
                }
                return {
                    t: aa,
                    b: W
                }
            };
        var A = i();
        var C = p.find(".tlUpArrow");
        var H = p.find(".tlCenterArrow");
        if (A.t < 0) {
                I.css("cssText", "display:none;");
                if (A.b > 0) {
                    j = Math.round((v.height() / 2) + 13);
                    I = C;
                    if (I.length === 0) {
                        I = h('<div class="tlUpArrow"></div>');
                        p.prepend(I)
                    }
                } else {
                    C.css("cssText", "display:none;");
                    j = j - A.t;
                    I = H;
                    if (I.length === 0) {
                        I = h('<div class="tlCenterArrow"></div>');
                        h(".tlThingContent", p).before(I)
                    }
                }
            } else {
                C.css("cssText", "display: none;")
            }
        var z = I[0] ? g.parseCssText(I[0].style.cssText) : {};
        z.display = "";
        I.css("cssText", "");
        var R = p[0] ? g.parseCssText(p[0].style.cssText, true) : {};
        var o = "min-width: " + R["min-width"] + "px !important; z-index: " + p.css("z-index") + "; display: block;";
        if (R["max-width"]) {
                o = o + "max-width: " + R["max-width"] + "px !important;"
            }
        if (R.opacity) {
                o = o + "opacity: " + R.opacity + ";"
            }
        if (R.visibility) {
                o = o + "visibility: " + R.visibility + ";"
            }
        var P = e.getDimensions(p).w;
        var k = (window.ActiveXObject || "ActiveXObject" in window) ? "width: " + P.toString() + "px !important;" : "";
        var G = v.width();
        var l = Math.round((G - P) / 2);
        var O = parseInt(v.css("left").replace("px", ""), 10);
        if (M.css("box-sizing") === "content-box") {
                var J = e.getExtent(M[0]);
                var T = J["padding-left"];
                O = O - T
            }
        var y = M.width();
        var t = 5;
        var s = p.find(".tlThingClose").length > 0 ? 17 : 5;
        var u = O + l - t;
        var Q = y - s - (O + l + P);
        var x = 0;
        var r;
        if (L === false && u < 0 && Q > 0) {
                x = -u
            } else {
                if (L === false && Q < 0 && u > 0) {
                    x = Q
                } else {
                    if (window.ActiveXObject || "ActiveXObject" in window) {
                        I.css("cssText", k)
                    }
                }
            }
        C = p.find(".tlUpArrow");
        if (C.length && C.css("display") != "none") {
                p.addClass("tlUpArrowInside")
            } else {
                p.removeClass("tlUpArrowInside")
            }
        p.css("cssText", "display:none !important;");
        var w = function () {
                var W = h(window).scrollLeft() - K.left;
                var Z = a.getWindowSize().w + W;
                var Y = (n.left + l + x);
                var V = Y - t - W;
                var X = Z - (Y + P + s);
                return {
                    l: V,
                    r: X
                }
            };
        var B = w();
        if ((B.l + B.r) < 0) {
                t -= 5;
                s -= 5;
                B = w()
            }
        x = f.applyHorizontalWindowLimitsToDisplacement(x, B, K, p.hasClass("tlPlaying"));
        z.left = (-x) + "px !important;";
        if (x !== 0) {
                l = l + x
            }
        if (I.length > 0) {
                I.css("cssText", I[0].style.cssText + a.mapToCssText(z))
            }
        var q = {
                left: 0,
                top: 0
            };
        if ((d.isThinglinkSceneView()) || (h("#tlTagContainer").closest(".tlFullscreen").length > 0)) {
                q = h("#tlTagContainer").offset()
            }
        p.css("cssText", o + "top: " + (n.top + j - q.top).toString() + "px !important; left: " + (n.left + l - q.left).toString() + "px !important;")
    }
    return c
});
tlRequire.define("positionThingAlg", ["util"], function (b) {
    function a(c, i, k, f) {
        var l = c;
        if (i.l < 0 && i.r > 0) {
            l = l - i.l
        } else {
            if (i.r < 0 && f) {
                var g = 0;
                if (i.l < i.r) {
                    g = i.r - i.l;
                    if (g > 5) {
                        g = 5
                    }
                }
                i.r -= g;
                l = l + i.r
            } else {
                if (i.r < 0 && i.l > 0) {
                    l = l + i.r
                } else {
                    if (i.r < 0 && i.l < 0) {
                        var j = $tlJQ(window).scrollLeft() - k.left;
                        var e = b.getWindowSize().w + j;
                        var m = -k.left;
                        var h = $tlJQ(window).width() + m;
                        var n = j + i.l - m;
                        var d = (h - e) + i.r;
                        if (d < 0) {
                            l = l + d
                        } else {
                            if (n < 0) {
                                l = l - n
                            }
                        }
                    }
                }
            }
        }
        return l
    }
    return {
        applyHorizontalWindowLimitsToDisplacement: a
    }
});
tlRequire.define("postMessageManager", ["namespace", "jQueryPostMessage", "EventDispatcher", "config", "util"], function (c, o, a, b, g) {
    var q = c.postMessageManager;
    if (typeof q === "undefined" || typeof q.addListener === "undefined") {
        var e = {};
        var p = {};
        var l = function () {
            e = {};
            p = {}
        };
        var m = function (s, t) {
            var r = g.getSourceDomain(s);
            p[r] = true;
            if (!t) {
                var u = false;
                while (!u) {
                    t = (" " + Math.random()).substr(3);
                    if ($tlJQ("#" + t).length === 0) {
                        u = true
                    }
                }
            }
            e[t] = r;
            return t
        };
        var k = function (r) {
            if (p[r]) {
                return true
            }
            return false
        };
        var h = function (r) {
            return r.replace(/^https?:/, "")
        };
        var d = function (v) {
            var r = v.data;
            if (typeof(r) !== "string") {
                return
            }
            var y = r.split("/");
            var w = y[0];
            var s = y[1];
            var t = y.slice(2);
            var x = v.origin;
            if (x) {
                var u = e[w];
                if (!u || h(x) !== h(u)) {
                    return
                }
            }
            var z = [s, f(w), t];
            q.trigger("postMessageCommand", z)
        };
        var f = function (s) {
            var r = $tlJQ("#" + s);
            var t;
            if (r.length === 0) {
                t = $tlJQ(".rtid-" + s)
            } else {
                t = r.find(".tagx")
            }
            if (t.length === 0) {
                return
            }
            return t
        };
        var j = function () {
            $tlJQ.receiveMessage(d, k)
        };
        var i = function (s) {
            var w = window.location.href.split("#")[0];
            var t = "";
            var v = "";
            var r = "";
            try {
                t = m(s);
                v = encodeURIComponent(w);
                r = "#rtid=" + t + "&target=" + v;
                if ( !! b.referer) {
                    r += "&referer=" + encodeURIComponent(b.referer)
                }
                if (b.preventNavigation) {
                    r += "&preventNavigation=true"
                }
                if (s.indexOf("#") > 0) {
                    r = "&" + r.substring(1)
                }
            } catch (u) {}
            return {
                rtid: t,
                target: v,
                srcPmParams: r
            }
        };
        var n = function () {};
        n.prototype = new a();
        n.prototype.init = j;
        n.prototype.reset = l;
        n.prototype.prepareAndGetParameters = i;
        n.prototype.registerThing = m;
        q = new n();
        c.postMessageManager = q
    }
    return q
});
tlRequire.define("sceneCache", [], function () {
    var b = {};

    function a(e, d) {
        b[e] = d
    }
    function c(d) {
        return b[d]
    }
    return {
        getCacheSceneId: c,
        setCacheSceneId: a
    }
});
tlRequire.define("sceneUtil", ["jQuery", "util"], function (h, d) {
    function a(j) {
        return h("img[tl-scene-id=" + j + "]").closest(".tlImageContainer")
    }
    function c(j) {
        return j.find("img").attr("tl-scene-id")
    }
    function g(j) {
        return a(j).find(".tlMenuItem").hasClass("tlUntouch")
    }
    function f(j) {
        return a(j).find(".tlMenuLabelTouch").data("tlTouchCount")
    }
    function i(l, j) {
        var k = h(l);
        var m = k[0].src.replace(/#.*$/, "");
        if (j) {
            m = m + ";" + j
        }
        return m
    }
    function b() {
        return h("body").hasClass("permaScene") || h("body").hasClass("permaVideo")
    }
    function e() {
        h(".tlThingClose").mouseup()
    }
    return {
        findImageContainer: a,
        getContainerSceneId: c,
        isSceneTouched: g,
        getSceneTouchCount: f,
        isThinglinkSceneView: b,
        getSceneUrl: i,
        closeAllStickyTags: e
    }
});
tlRequire.define("sharePopup", ["util", "config", "postMessageManager", "popup", "hashing", "sceneUtil", "measure"], function (g, d, j, b, c, f, a) {
    function h(k) {
        return d.sslAddress + "/scene/" + k
    }
    function i(n) {
        var r = n.tlImage("sceneData");
        var s = n.closest(".tlImageContainer");
        if (!n) {
            return
        }
        var m = n.attr("tl-scene-id");
        var p = c.generateImageHash(n[0]);
        var k = encodeURIComponent(h(m));
        var o;
        var t = $tlJQ('head meta[name="identifier-URL"]').attr("content");
        if ( !! t) {
            o = t
        }
        if (d.isThinglinkSite() && !o) {
            o = k
        } else {
            if (!o) {
                o = window.location.href
            }
            var q = o.indexOf("#");
            if (q === -1) {
                o = encodeURIComponent(o) + "%23tl-" + p
            } else {
                if (q == o.length - 1 || o.substring(q, q + 4) === "#tl-") {
                    o = encodeURIComponent(o.substring(0, q)) + "%23tl-" + p
                } else {
                    o = encodeURIComponent(o)
                }
            }
        }
        return o
    }
    function e(s, q, v) {
        f.closeAllStickyTags();
        var o = $tlJQ("#tlOverlayContainer");
        if (o.length === 0) {
            o = $tlJQ('<div id="tlOverlayContainer"/>').appendTo("body")
        }
        var n = ".tlShareIframePopup.tl-item-" + v.id;
        var m = $tlJQ(n, o);
        if (m.length > 0) {
            m.show()
        } else {
            b.setup(o, q, ".tlShareIframePopup.tlSharePopup.tl-item-" + v.id, function (z) {
                var y = d.getBaseUrl() + "/embed/share/" + v.id;
                var D = j.prepareAndGetParameters(y).srcPmParams;
                var A = g.getDomain(window.location.href);
                var C = A ? c.adler32(A) : "";
                var B = $tlJQ(document).innerHeight();
                var x = Math.min(B - 50, 400);
                var w = $tlJQ('<iframe id="tlSharingFrame" src="' + y + "?shareUrl=" + i(q) + "&domainHash=" + C + D + '" type="text/html" height="' + x + 'px" + frameBorder="0"></iframe>');
                z.append(w)
            })
        }
        if (m.length === 0) {
            m = $tlJQ(n, o)
        }
        var k = a.getDimensions(q).w;
        var r = q.offset();
        var u = a.getDimensions(m).w;
        var p = parseInt(r.left + (k / 2) - (u / 2), 10);
        var l = $tlJQ(window).width();
        if (p < 0) {
            p = 0
        } else {
            if (p - u > l) {
                p = l - u
            }
        }
        var t = r.top < 13 ? 13 : r.top;
        m.css("cssText", m[0].style.cssText + "; left: " + p + "px !important; top: " + t + "px !important;")
    }
    return {
        setup: e
    }
});
tlRequire.define("statusManager", ["namespace", "config", "callbackManager"], function (d, c, b) {
    function a(e) {
        d.status = e;
        if (c.eventManager && c.eventManager.trigger) {
            c.eventManager.trigger("statusChanged", e)
        }
        b.triggerEvent(e)
    }
    return {
        setStatus: a
    }
});
tlRequire.define("tagEventHandlers", ["jQuery", "callbackManager", "eventDebounce", "positionThing", "actionLogger", "imageEventHandlers", "config", "jUtil", "util", "cssUtil", "customization"], function (o, j, d, c, l, q, t, n, a, k, g) {
    var h = a.isTouchDevice;
    var s = function (w, v, y) {
        var x = w.find(".thinglinkImage").first();
        var u = x.attr("tl-scene-id");
        l.logClick(v, u, x, y)
    },
        b = function (w, v) {
            var x = w.find(".thinglinkImage").first();
            var u = x.attr("tl-scene-id");
            l.logHover(v, u, x)
        },
        p = function (w, v) {
            var x = w.find(".thinglinkImage").first();
            var u = x.attr("tl-scene-id");
            l.logHoverEnd(v, u, x)
        };
    var e = function (A, y, C, w, x) {
            var B;
            if (A.nubbin.tlTag("isImageTag")) {
                B = function (D) {
                    s(w, C.id, D)
                }
            }
            var z = (t.preventNavigation || C.openlink === "NONE") && !(C.theme == "rich" && C.contentUrl && A.bubble.find(".tlSpinner").length === 0);
            if (!z && C.theme == "iframe") {
                z = !A.bubble.hasClass("iframeLoaded")
            }
            var v = x.target.tagName.toLowerCase() === "img" ? null : x.target.href;
            if (!v && x.target.tagName.toLowerCase() === "span") {
                v = x.target.parentNode.href
            }
            var u = v || A.nubbin.attr("href");
            if (!z) {
                z = !u
            }
            if (!z) {
                y.clickHandler.call(this, u, A.nubbin, B);
                return true
            }
            if (B) {
                B()
            }
            return false
        },
        i = function (u) {
            u = u || n.getThingPieces(this);
            if (!u.bubble.hasClass("tlPlaying")) {
                setTimeout(function () {
                    if (!u.bubble.hasClass("mouseover") && !u.nubbin.hasClass("mouseover")) {
                        if (u.nubbin.hasClass("hovered")) {
                            var v = u.nubbin.attr("tl-thing-id");
                            var w = u.nubbin.parents(".tlImageContainer");
                            p(w, v)
                        }
                        u.nubbin.removeClass("linked hovered");
                        u.bubble.hide()
                    }
                }, 50)
            }
        },
        r = function (w, u, x) {
            var v = u;
            if (w && w.clientX) {
                v = document.elementFromPoint(w.clientX, w.clientY)
            }
            if (v == x.nubbin.find(".nubbinHoverIcon")[0]) {
                if (!x.nubbin.hasClass("mouseover")) {
                    x.nubbin.addClass("mouseover")
                }
                if (!u.hasClass("mouseover")) {
                    u.addClass("mouseover")
                }
            } else {
                if ((v === u) || (v == u.find(".thinglinkImage")[0])) {
                    if (!u.hasClass("mouseover")) {
                        u.addClass("mouseover")
                    }
                    i(x)
                } else {
                    i(x);
                    q.hideNubbins(u)
                }
            }
        };
    j.runAfter("initcomplete", function () {
            if (h) {
                o(document).unbind("vclick.tlBubbleHide").bind("vclick.tlBubbleHide", function (v) {
                    var u = v.target || v.srcElement;
                    o(".tlImageContainer .tagx.hovered").each(function () {
                        var w = n.getThingPieces(this);
                        w.bubble.mouseleave();
                        if (w.bubble.hasClass("mouseover")) {
                            w.bubble.trigger("mouseleave")
                        }
                        if (w.nubbin.hasClass("mouseover")) {
                            if (o("#tlTagContainer").has(v.target).length === 0) {
                                w.nubbin.removeClass("mouseover");
                                r(v, o(u).closest(".tlImageContainer"), w)
                            }
                        }
                    })
                })
            }
        });

    function m(w, A) {
            A = A || n.getThingPieces(this);
            var z = A.bubble.data("bubbledata");
            var B = A.nubbin.data("thing");
            if (z && z.hoverHandler) {
                w = z.hoverHandler
            }
            if (w) {
                w()
            }
            c(A.nubbin);
            var v, x;
            if (B && typeof(B.styles) !== "undefined") {
                x = B.styles;
                v = g.mergeParcelData(B.styles, B.productName, B.properties)
            } else {
                if (A.nubbin.data("tlParcel")) {
                    v = A.nubbin.data("tlParcel")
                }
            }
            var y = a.getSourceDomain(B.contentUrl);
            g.applyNewCustomization(A.bubble, v, y);
            var u = (B && typeof(B.opacity) !== "undefined") ? B.opacity : 1;
            if (u > 0.01) {
                A.bubble.show();
                A.bubble.css("opacity", u)
            } else {
                A.bubble.css("visibility", "hidden")
            }
            if (A.nubbin.attr("href")) {
                if (B.openlink !== "NONE" || B.theme === "rich") {
                    A.nubbin.addClass("linked")
                }
            }
            A.nubbin.addClass("hovered")
        }
    function f(F, x) {
            var B = n.getThingPieces(F),
                A = B.bubble.data("bubbledata"),
                E = B.nubbin.data("thing"),
                w = false;
            x = x || B.nubbin.closest(".tlImageContainer");
            var y = function (H, G) {
                    G = G || B;
                    G.nubbin.removeClass("mouseover");
                    r(H, x, G)
                };
            var z = {};
            var C = function (H, I) {
                    z.hideBubblesForAllExcept(B.nubbin);
                    if (!H) {
                        var G = null;
                        if (A && A.hoverHandler) {
                            G = A.hoverHandler
                        }
                        m(G, B);
                        if (I) {
                            b(x, E.id)
                        }
                    }
                    B.nubbin.addClass("mouseover");
                    if (!x.hasClass("mouseover")) {
                        x.addClass("mouseover")
                    }
                };
            var v = function (G) {
                    x.find(".tagx").not(G).each(function () {
                        var H = n.getThingPieces(this);
                        H.bubble.removeClass("mouseover");
                        H.nubbin.removeClass("mouseover");
                        i(H)
                    })
                };
            z = {
                    mouseOverNubbin: C,
                    attemptTagClick: e,
                    hideBubblesForAllExcept: v
                };
            var D = false;
            var u = false;
            B.nubbin.unbind("vmouseout vmousecancel").bind("vmouseout vmousecancel", d({
                    after: function (G, H) {
                        D = false
                    },
                    threshold: 50
                }));
            if (B.nubbin.tlTag("isImageTag")) {
                    B.nubbin.unbind("mouseenter vclick").bind("mouseenter vclick", d({
                        before: function (G, H) {
                            H.nubbinsVisible = x.hasClass("tlHover");
                            H.bubbleVisible = B.nubbin.hasClass("hovered");
                            D = D || !H.nubbinsVisible;
                            if (!H.nubbinsVisible) {
                                H.nubbinsVisible = (B.nubbin.find(".nubbinGlow").css("display") != "none");
                                q.showNubbins(x)
                            }
                            if (H.nubbinsVisible) {
                                z.mouseOverNubbin(H.bubbleVisible, true)
                            }
                            w = true
                        },
                        everyTime: function (H, L, K) {
                            if (H === "mouseenter") {
                                if (h && (!L.bubbleVisible) && (!L.vclickInThisSequence)) {
                                    u = true
                                }
                            }
                            if ((H === "vclick") && (L.vclickInThisSequence)) {
                                return
                            }
                            if (H === "vclick") {
                                L.vclickInThisSequence = true
                            }
                            var J = (typeof(E.opacity) !== "undefined") && (E.opacity < 0.01);
                            var G = (!h || !D) && L.nubbinsVisible && L.bubbleVisible;
                            if ((G || J) && !u && (H === "vclick")) {
                                L.vclickInThisSequence = true;
                                var I = z.attemptTagClick(B, A, E, x, K);
                                if (I) {
                                    B.nubbin.trigger("mouseleave")
                                }
                            } else {
                                if (H == "mouseenter") {
                                    w = true
                                }
                            }
                            if (L.lastOrigEventType === "touchend") {
                                u = false
                            }
                        },
                        after: function (H, I) {
                            var G = (typeof w == "function");
                            if (!I.nubbinsVisible && !h && !G) {
                                z.mouseOverNubbin(I.bubbleVisible, true)
                            } else {
                                if (G) {
                                    w()
                                }
                            }
                            w = false
                        },
                        threshold: 70
                    }))
                } else {
                    B.nubbin.unbind("mouseenter vclick").bind("mouseenter vclick", d({
                        before: function (G, H) {
                            H.nubbinsVisible = x.hasClass("tlHover");
                            H.bubbleVisible = B.nubbin.hasClass("hovered");
                            D = D || !H.nubbinsVisible;
                            z.mouseOverNubbin(H.bubbleVisible, false)
                        },
                        everyTime: function (G, H) {
                            if (H.bubbleVisible && G == "vclick") {
                                z.attemptTagClick(B, A, E, x)
                            }
                        },
                        threshold: 50
                    }))
                }
            B.nubbin.unbind("mouseleave").bind("mouseleave", function (G) {
                    if (w) {
                        w = y
                    } else {
                        y(G)
                    }
                });
            B.bubble.unbind("mouseenter").bind("mouseenter", function (G) {
                    B.bubble.addClass("mouseover")
                });
            B.bubble.unbind("mouseleave").bind("mouseleave", function (G) {
                    B.bubble.removeClass("mouseover");
                    r(G, x, n.getThingPieces(B.bubble))
                });
            B.bubble.unbind("vmouseup").bind("vmouseup", d({
                    before: function (G, H) {
                        H.tagBubbleClickHandled = false
                    },
                    everyTime: function (G, I, H) {
                        if (!I.tagBubbleClickHandled) {
                            z.attemptTagClick(B, A, E, x, H);
                            I.tagBubbleClickHandled = true
                        }
                    },
                    after: function (G, H) {
                        B.bubble.trigger("mouseenter");
                        y(null)
                    },
                    threshold: 20
                }));
            B.bubble.unbind("vclick").bind("vclick", function (G) {
                    return false
                });
            B.bubble.find(".tlHashTag").unbind("vmouseup").bind("vmouseup", function (G) {
                    window.open(this.href);
                    return false
                });
            if (E.theme == "rich") {
                    B.bubble.find(".tlThingFooter a").unbind("vmouseup").bind("vmouseup", function (G) {
                        window.open(this.href);
                        return false
                    })
                }
            B.bubble.find(".tlThingClose").bind("vmouseup", function (I) {
                    I.preventDefault();
                    I.stopPropagation();
                    B.bubble.removeClass("tlPlaying iframeLoaded");
                    var G = B.bubble.find(".tlRichIframe");
                    G.hide().remove();
                    var H = B.bubble.find(".tlIframe");
                    if (H.length > 0) {
                        H.hide().remove();
                        B.bubble.find(".tlSpinner").removeClass("loaded").show()
                    }
                    B.bubble.removeClass("mouseover").hide();
                    y(I, B);
                    if (h && !x.hasClass("mouseover")) {
                        x.addClass("mouseover")
                    }
                    return false
                });
            return {
                    _i: z
                }
        }
    return {
            attach: f,
            prepareTagForDisplay: m
        }
});
tlRequire.define("tagFetcher", ["jQuery", "util", "config"], function (d, b, c) {
    var a = function () {
        var n;
        var i;

        function l(u, p) {
            var t = [];
            var s = "",
                q;
            if (u) {
                    for (q = 0; q < u.length; q++) {
                        var v = b.cleanURIEncoding(u[q]);
                        if ((s.length + v.length + 2) < p) {
                            if (s.length > 0) {
                                s += "|"
                            }
                            s += v
                        } else {
                            t.push(s);
                            s = v
                        }
                    }
                    if (s.length > 0) {
                        t.push(s)
                    }
                }
            return t
        }
        var g = [];
        var m;
        var o = [];

        function e(r, p, q) {
            g = g.concat(r);
            if (p) {
                o = o.concat(p)
            }
            if (m) {
                clearTimeout(m);
                m = null
            }
            m = setTimeout(function () {
                j(g, {
                    forceSecure: c.forceSecure,
                    referer: c.referer,
                    reload: q,
                    manualViewStats: c.manualViewStats,
                    passkeys: o
                });
                g = [];
                m = null
            }, 80)
        }
        function j(B, s) {
            var A = c.getApiBaseUrl();
            var r = l(B, 1650);
            var t = r.length;
            var z = function (C) {
                if (n) {
                    n(C)
                }
                t = t - 1;
                if (t === 0 && i) {
                    i()
                }
            };
            var v;
            var q = d(window);
            var y = q.width();
            var w = q.height();
            var p = l(s.passkeys, 2000);
            for (v = 0; v < r.length; v++) {
                var x = r[v];
                var u = {
                    url: x,
                    p: v,
                    passkeys: p[0]
                };
                u.vw = y;
                u.vh = w;
                if (window.__tlid !== undefined) {
                    u.massId = window.__tlid
                }
                if (s.forceSecure) {
                    u.forceSecure = true
                }
                if (s.referer) {
                    u.referer = s.referer
                }
                if (s.manualViewStats) {
                    u.skipStats = true
                }
                if (s.reload) {
                    u.reloadNonce = Math.floor(Math.random() * 10000000)
                }
                d.ajax({
                    url: A + "/api/tags",
                    data: u,
                    dataType: "jsonp",
                    success: z
                })
            }
        }
        function k(s, q, r) {
            var p = b.extractSceneId(s);
            if (p !== "" && p.charAt(0) !== "$") {
                s = p
            }
            if ((s.length === undefined) || typeof(s) === "string") {
                s = [s]
            } else {
                if (s.length > 1) {
                    s = s.sort()
                }
            }
            e(s, q, r)
        }
        function f(p) {
            i = p
        }
        function h(p) {
            n = p
        }
        return {
            fetchTags: k,
            dataReceivedCallback: h,
            finalFetchCompleteCallback: f,
            listify: l
        }
    };
    return a()
});
tlRequire.define("touchManager", ["config", "txt", "sceneUtil", "postMessageManager", "EventDispatcher"], function (s, h, o, c, t) {
    var j;
    var g;
    var d;
    var e;

    function a(v) {
        var u = {
            title: "",
            content: ""
        };
        u.title = h("TouchDialogPreSignup.TitleDoYouLikeThisImage");
        u.content = h("TouchDialogPreSignup.ContentDoYouLikeThisImage", '<a href="#">', "</a>");
        return u
    }
    function r(v, w) {
        var u = o.getContainerSceneId(v);
        if (!v) {
            v = o.findImageContainer(u)
        }
        if (e) {
            b(v, u, w)
        } else {
            f(v, u)
        }
    }
    function q(x, v, u) {
        if (g) {
            clearTimeout(g);
            g = null
        }
        if (u && u > 100) {
            return
        }
        var w;
        if (!u) {
            w = 3000;
            u = 0
        } else {
            if (u < 60) {
                w = 1000
            } else {
                w = 3000
            }
            $tlJQ.ajax({
                url: s.getApiBaseUrl() + "/api/me",
                cache: false,
                dataType: "jsonp",
                success: function (y) {
                    if (y.name) {
                        clearTimeout(g);
                        g = null;
                        if (d) {
                            d.close();
                            d = null
                        }
                        n(x, v)
                    } else {
                        if (!d || (d && d.closed === true)) {
                            clearTimeout(g);
                            g = null
                        }
                    }
                }
            })
        }
        g = setTimeout(function () {
            q(x, v, u + 1)
        }, w)
    }
    function f(w, v) {
        var z = "tlTouchPreSignupPopup";
        var A = o.getSceneTouchCount(v);
        var B = a(A);
        var u = w.find("." + z).first();
        if (u.length === 0) {
            u = $tlJQ('<div class="' + z + ' tlTouchPopup tlPopup"></div>');
            var D = $tlJQ('<div class="tlPopupInner"><h3></h3><p class="tlTouchPopupContent" style="text-align:center !important;"></p></div>');
            var y = $tlJQ('<a href="#" class="tlCloseBtn"></a>');
            y.bind("vmouseup", function (E) {
                u.hide();
                return false
            });
            u.append(D);
            u.append(y);
            var x = u.find("p.tlTouchPopupContent");
            x.append(B.content);
            x.find("a").click(function () {
                m(w, v)
            });
            w.append(u)
        }
        w.find(".tlPopup").hide();
        var C = u.find("h3");
        C.html(B.title);
        setTimeout(function () {
            u.show()
        }, 10)
    }
    function m(w, u) {
        var A = s.sslAddress + "/embed/touchLogin";
        var x = c.prepareAndGetParameters(A);
        var y = x.rtid;
        var z = x.target;
        var v = s.sslAddress + "/auth/connect?response_type=code&client_id=" + s.clientId + "&state=" + y + "/touchLogin/" + u + ";" + z + "&redirect_uri=" + encodeURIComponent(A);
        d = window.open(v, null, "width=950,height=588,scrollbars=yes");
        q(w, u)
    }
    function b(v, u, w) {
        var x;
        if (w) {
            x = "untouch"
        } else {
            x = "touch"
        }
        $tlJQ.ajax({
            url: s.sslAddress + "/api/scene/" + u + "/touch?method=" + x,
            cache: false,
            dataType: "jsonp",
            success: function (A) {
                var y;
                if (!A.error) {
                    var z;
                    if (!A.results.touched && x === "untouch") {
                        z = -1
                    } else {
                        if (A.results.touched && x === "touch") {
                            z = 1
                        }
                    }
                    i.trigger("updateSceneTouchStatus", [A.results.touched, u, z]);
                    y = o.getSceneTouchCount(u)
                }
                l(v, A, u, y)
            }
        })
    }
    function l(x, w, v, A) {
        var z = "tlTouchStatusPopup";
        if (A < 0) {
            A = 0
        }
        var u = x.find("." + z).first();
        if (u.length === 0) {
            u = $tlJQ('<div class="' + z + ' tlTouchPopup tlPopup"></div>');
            var C = $tlJQ('<div class="tlPopupInner"><h3></h3><p></p><</div>');
            u.append(C);
            x.append(u)
        }
        x.find(".tlPopup").hide();
        var B = u.find("h3");
        var y = u.find("p");
        if (w.error) {
            B.text(h("TouchDialog.TitleError"))
        } else {
            if (w.results.touched) {
                B.text(h("TouchDialog.TitleTouch"))
            } else {
                B.text(h("TouchDialog.TitleUntouch"))
            }
            if (A === 1) {
                y.text(h("TouchDialog.TouchesOne"))
            } else {
                if (A === 0) {
                    y.text(h("TouchDialog.TouchesNo"))
                } else {
                    y.text(h("TouchDialog.TouchesOther", A))
                }
            }
        }
        u.stop(true, true).show();
        if (j) {
            clearTimeout(j);
            j = null
        }
        j = setTimeout(function () {
            u.hide(500);
            j = null
        }, 1300)
    }
    function n(v, u) {
        e = true;
        r(v, o.isSceneTouched(u))
    }
    function k(u) {
        e = u
    }
    var p = function () {};
    p.prototype = new t();
    p.prototype.touch = r;
    p.prototype.touchLoginCallback = n;
    p.prototype.setUserLoggedIn = k;
    var i = new p();
    return i
});
tlRequire.define("txt", ["jQuery", "config"], function (d, c) {
    var a = {
        poweredBy: {
            en: "Powered by ThingLink",
            fi: "Teknologiasta vastaa ThingLink",
            ru: "Технология ThingLink",
            pt: "Desenvolvido por ThingLink",
            es: "Ofrecido por ThingLink",
            pl: "Zasilane przez ThingLink",
            it: "Gestito da ThingLink",
            ja: "ThingLink提供",
            fr: "Développé par ThingLink",
            de: "Betrieben von ThingLink",
            hi: "ThingLink द्वारा संचालित",
            zh: "由 ThingLink 提供技术支持",
            sv: "Utvecklat av ThingLink"
        },
        CopyToClipBoard: {
            en: "Copy to clipboard",
            fi: "Kopioi leikekirjaan",
            ru: "в буфер обмена",
            pt: "Copiar para a área de transferência",
            es: "Copiar al portapapeles",
            pl: "Skopiuj do schowka",
            it: "Copia negli appunti",
            ja: "クリップボードにコピー",
            fr: "Copier dans le presse-papiers",
            de: "In Zwischenablage kopieren",
            hi: "क्लिपबोर्ड में कॉपी करें",
            zh: "复制到剪贴板",
            sv: "Kopiera till urklipp"
        },
        Copied: {
            en: "Copied",
            fi: "Kopioitu",
            ru: "Скопировано",
            pt: "Copiado!",
            es: "¡Copiado!",
            pl: "Skopiowano!",
            it: "Copiato!",
            ja: "コピー完了！",
            fr: "Copié!",
            de: "Kopiert!",
            hi: "कॉपी हो गया",
            zh: "已复制",
            sv: "Kopierad"
        },
        "Share.OrJustShareThisAddress": {
            en: "Or just share this address:",
            fi: "Tai jaa tämä osoite:",
            ru: "Или поделиться этой ссылкой:",
            pt: "Ou apenas partilhar este endereço:",
            es: "O comparte solamente esta dirección:",
            pl: "Lub podziel się tylko tym adresem:",
            it: "Oppure condividi solo questo indirizzo:",
            ja: "または次のアドレスのみを共有：",
            fr: "Ou partager seulement cette adresse:",
            de: "Oder nur diese Adresse teilen:",
            hi: "या केवल इस पते को साझा करें:",
            zh: "或仅分享此地址：",
            sv: "Eller dela den här adressen:"
        },
        OriginallyThinglinked: {
            en: "Source {0}",
            de: "Quelle {0}",
            es: "Fuente {0}",
            fi: "Lähde {0}",
            fr: "Source {0}",
            hi: "स्रोत {0}",
            it: "Fonte {0}",
            ja: "ソース {0}",
            pl: "Źródło {0}",
            pt: "Fonte {0}",
            ru: "Источник {0}",
            sv: "Källa {0}",
            zh: "来源 {0}"
        },
        "ContextMenu.Fullscreen": {
            en: "Fullscreen",
            fi: "Esitystila",
            sv: "Helskärm",
            de: "Vollbild",
            es: "Pantalla total",
            fr: "Plein écran",
            hi: "पूर्ण स्क्रीन",
            it: "Tutto schermo",
            ja: "全画面表示",
            pl: "Pełny ekran",
            pt: "Ecrã inteiro",
            ru: "Полный экран",
            zh: "全屏"
        },
        "ContextMenu.Touch": {
            en: "Touch image",
            fi: "Kosketa kuvaa",
            de: "Bild berühren",
            es: "Dar un Toque a la imagen",
            fr: "Touchez l'image",
            hi: "छवि छुएं (टच करें)",
            it: "Tocca l'immagine",
            ja: "イメージをタッチ",
            pl: "Dotknij obraz",
            pt: "Toque na imagem",
            ru: "Коснуться изображения",
            sv: "Peka på bilden",
            zh: "接触图片"
        },
        "ContextMenu.Share": {
            en: "Share image...",
            fi: "Jaa kuva...",
            ru: "Поделиться этим изображением...",
            pt: "Partilhar Imagem...",
            es: "Compartir imagen...",
            pl: "Podziel się obrazkiem...",
            it: "Condividi l'Immagine...",
            ja: "画像の共有...",
            fr: "Partager l'image...",
            de: "Share Image...",
            hi: "छवि साझा करें ...",
            zh: "分享图像...",
            sv: "Dela bilden..."
        },
        "ContextMenu.Embed": {
            en: "Embed image...",
            fi: "Upota kuva...",
            ru: "Встроить это изображение...",
            pt: "Inserir Imagem...",
            es: "Insertar imagen...",
            pl: "Umieść obrazek...",
            it: "Incorpora l'Immagine...",
            ja: "リンク画像...",
            fr: "Image incorporée...",
            de: "Bild einbetten...",
            hi: "छवि एम्बेड करें ...",
            zh: "嵌入图像...",
            sv: "Infoga bilden..."
        },
        "Sidebar.Touch": {
            en: "Touch",
            fi: "Kosketa",
            de: "Berühren",
            es: "Tocar",
            fr: "Toucher",
            hi: "स्पर्श करें",
            it: "Tocca",
            ja: "タッチ",
            pl: "Stuknij",
            pt: "Tocar",
            ru: "Нажать",
            sv: "Peka på",
            zh: "触摸"
        },
        "Sidebar.Untouch": {
            en: "Untouch",
            fi: "Poista kosketus",
            de: "Berührung aufheben",
            es: "No tocar",
            fr: "Dé-Toucher",
            hi: "स्पर्श न करेंं",
            it: "Annulla Tocca",
            ja: "アンタッチ",
            pl: "Odhacz stuknięcie",
            pt: "Intacto",
            ru: "Не нажимать",
            sv: "Peka av",
            zh: "不可触摸"
        },
        "Sidebar.Share": {
            en: "Share",
            fi: "Jaa",
            ru: "Поделиться",
            pt: "Partilhar",
            es: "Compartir",
            pl: "Udostępnij",
            it: "Condividi",
            ja: "共有",
            fr: "Partager",
            de: "Teilen",
            hi: "साझा करें",
            zh: "共享",
            sv: "Dela"
        },
        "Sidebar.Edit": {
            en: "Edit",
            fi: "Muokkaa",
            ru: "Редактировать",
            pt: "Editar",
            es: "Editar",
            pl: "Edytuj",
            it: "Modifica",
            ja: "編集",
            fr: "Éditer",
            de: "Bearbeiten",
            hi: "संपादित करें",
            zh: "编辑",
            sv: "Redigera"
        },
        "Sidebar.Delete": {
            en: "Delete",
            fi: "Poista",
            ru: "Удалить",
            es: "Borrar",
            pt: "Excluir",
            pl: "Usuń",
            it: "Elimina",
            ja: "削除",
            fr: "Effacer",
            de: "Löschen",
            se: "Ta bort",
            hi: "हटाएं",
            zh: "删除"
        },
        "Sidebar.Remix": {
            en: "Remix",
            fi: "Remiksaa",
            ru: "Ремикс",
            es: "Remezclar",
            pt: "Recombinar",
            pl: "Remiksuj",
            it: "Remixa",
            ja: "リミックス",
            fr: "Remixer",
            se: "Blanda igen",
            hi: "रीमिक्स करें",
            zh: "混音"
        },
        "Sidebar.Report": {
            en: "Report",
            fi: "Raportoi",
            ru: "Отчет",
            es: "Informe",
            pt: "Relatar",
            pl: "Zgłoś",
            it: "Riporta",
            ja: "報告",
            fr: "Rapporter",
            de: "Remixen",
            se: "Rapportera",
            hi: "रिपोर्ट करें",
            zh: "报告"
        },
        "Sidebar.Create": {
            en: "Create",
            fi: "Tee uusi",
            ru: "Создать",
            es: "Crear",
            pt: "Criar",
            pl: "Utwórz",
            it: "Crea",
            ja: "作成",
            fr: "Créer",
            de: "Melden",
            se: "Skapa",
            hi: "सृजित करें",
            zh: "创建"
        },
        "Sidebar.Comment": {
            en: "Comment",
            fi: "Kommentoi",
            ru: "Комментарий",
            es: "Cometar",
            pt: "Comentar",
            pl: "Komentuj",
            it: "Commenta",
            ja: "コメント",
            fr: "Commenter",
            de: "Kommentieren",
            se: "Kommentera",
            hi: "टिप्पणी करें",
            zh: "评论"
        },
        "Sidebar.Fullscreen": {
            en: "Fullscreen",
            fi: "Esitystila",
            sv: "Helskärm",
            de: "Vollbild",
            es: "Pantalla total",
            fr: "Plein écran",
            hi: "पूर्ण स्क्रीन",
            it: "Tutto schermo",
            ja: "全画面表示",
            pl: "Pełny ekran",
            pt: "Ecrã inteiro",
            ru: "Полный экран",
            zh: "全屏"
        },
        "Sidebar.Like": {
            en: "Like",
            fi: "Tykkää",
            ru: "Лайк",
            es: "Me gusta",
            pt: "Gostar",
            pl: "Polub",
            it: "Mi piace",
            ja: "いいね",
            fr: "Aimer",
            de: "Liken",
            se: "Gilla",
            hi: "पसंद करें",
            zh: "赞"
        },
        "Sidebar.Stats": {
            en: "Stats",
            fi: "Tilastot",
            ru: "Статистика",
            es: "Estadísticas",
            pt: "Estatísticas",
            pl: "Statystyki",
            it: "Statistiche",
            ja: "統計",
            fr: "Stats",
            de: "Statistiken",
            se: "Statistik",
            hi: "आंकड़ें बताएं",
            zh: "统计"
        },
        "Sidebar.Post": {
            en: "Post",
            fi: "Julkaise",
            ru: "Отправить",
            sv: "Publicera",
            es: "Publicar",
            pt: "Publicar",
            pl: "Prześlij",
            ja: "投稿する",
            de: "Posten",
            hi: "पोस्ट करें",
            it: "Pubblica",
            fr: "Diffuser",
            zh: "发布"
        },
        "TouchDialogPreSignup.ContentOriginal": {
            en: "To touch {0}Sign in!{1} Touching marks the image as a favorite and shares it with those who follow you.",
            fi: "{0}Kirjaudu sisään{1} koskettaaksesi! Kun kosketat kuvaa, se tallentuu itsellesi ja näkyy niille, jotka seuraavat sinua.",
            ru: "{0}Войдите{1}, чтобы нажать! Нажатие помечает изображение как избранное и делится им с теми, кто следует за вами.",
            es: "¡Para tocar {0}Inscríbete!{1} Al tocarla se marca la imagen como favorita y se comparte con aquellos que te siguen.",
            pt: "Para tocar {0}Inicie sessão!{1} Tocar assinala a imagem como favorita e partilha-a com aqueles que o seguem.",
            pl: "Aby stuknąć, {0}zaloguj się!{1} Stuknięcie zaznacza obraz jako ulubiony i udostępnia go tym, którzy Cię obserwują.",
            it: "Per toccare, {0}Accedi!{1} L'immagine toccata verrà aggiunta ai preferiti e verrà condivisa con le persone che ti seguono.",
            ja: "タッチするには{0}サインインしてください{1} タッチすると画像がお気に入りに追加され、フォローしている人々と共有されます。",
            fr: "Pour toucher {0}inscrivez-vous!{1} Le fait de toucher classe l'image dans les favoris et vous la partagez avec ceux qui vous suivent.",
            de: "Zum Berühren {0}anmelden!{1} Durch Berührung wird das Bild als Favorit markiert und mit allen, die dir folgen, geteilt.",
            se: "Peka på {0}Registrera dig!{1} Detta markerar bilden som favorit och delar den med de som följer dig.",
            hi: "स्पर्श करने के लिए {0}साइन इन!{1} स्पर्श करने से छवि पसंदीदा के रूप में चिह्नित हो जाती है और फिर उनके साथ साझा करें जो आपका अनुसरण करते हैं।",
            zh: "触摸{0}登录！{1}触摸图像将其标记为收藏，然后与关注你的好友共享。"
        },
        "TouchDialog.TitleError": {
            en: "Error touching",
            fi: "Kosketus ei onnistunut"
        },
        "TouchDialog.TitleTouch": {
            en: "Touched image",
            fi: "Kosketettu",
            de: "Berührtes Bild",
            es: "Imagen con Toques",
            fr: "Image touchée",
            hi: "छुई गई छवि",
            it: "immagine toccata",
            ja: "タッチされたイメージ",
            pl: "Dotknięty obraz",
            pt: "Imagem tocada",
            ru: "Тронутое изображение",
            sv: "Pekat på bilden",
            zh: "接触了该图片"
        },
        "TouchDialog.TitleUntouch": {
            en: "Untouched image",
            fi: "Kosketus poistettu",
            de: "Unberührtes Bild",
            es: "Imagen sin Toques",
            fr: "Image dé-touchée",
            hi: "अछूती छवि",
            it: "immagine con tolto il tocco",
            ja: "タッチされていないイメージ",
            pl: "Dotknięcie cofnięte",
            pt: "Imagem intocada",
            ru: "Нетронутое изображение",
            sv: "Pekat av bilden",
            zh: "取消接触了图片"
        },
        "TouchDialog.TouchesOne": {
            en: "One touch on the image",
            fi: "Yksi kosketus",
            de: "1 Berührung des Bildes",
            es: "1 Toque en la imagen",
            fr: "1 Touche sur cette image",
            hi: "छवि को 1 व्यक्ति ने छुआ है",
            it: "1 Tocco sull'immagine",
            ja: "このイメージには1件のタッチがあります",
            pl: "1 dotyk na obrazie",
            pt: "1 Toque na imagem",
            ru: "1 касание изображения",
            sv: "1 pekning på bilden",
            zh: "该图片有1个接触"
        },
        "TouchDialog.TouchesNo": {
            en: "No touches on the image",
            fi: "Ei kosketuksia",
            de: "Kein „es gefällt mir” auf dem Bild.",
            es: "La imagen no tiene Toques",
            fr: "Pas de Touche sur cette image",
            hi: "छवि पर कोई स्पर्श नहीं",
            it: "Nessun Tocco sull'immagine",
            ja: "この画像にはタッチがありません",
            pl: "Brak dotyków na obrazie",
            pt: "Sem toques na imagem",
            ru: "Нет касаний изображения",
            sv: "Bilden har inte pekats på",
            zh: "图片未经修饰"
        },
        "TouchDialog.TouchesOther": {
            en: "{0} touches on the image",
            fi: "{0} kosketusta",
            de: "{0} Berührungen des Bildes",
            es: "{0} Toques en la imagen",
            fr: "{0} Touches sur cette image",
            hi: "छवि को {0} व्यक्तियों ने छुआ है",
            it: "{0} Tocchi sull'immagine",
            ja: "このイメージには{0}件のタッチがあります",
            pl: "{0} dotyków na obrazie",
            pt: "{0} Toques na imagem",
            ru: "{0} касания (й) изображения",
            sv: "{0} pekningar på bilden",
            zh: "该图片有{0}个接触"
        },
        "TouchSidebarButton.TouchesOne": {
            en: "One touch on the image",
            fi: "Yksi kosketus",
            de: "1 Berührung des Bildes",
            es: "1 Toque en la imagen",
            fr: "1 Touche sur cette image",
            hi: "छवि को 1 व्यक्ति ने छुआ है",
            it: "1 Tocco sull'immagine",
            ja: "このイメージには1件のタッチがあります",
            pl: "1 dotyk na obrazie",
            pt: "1 Toque na imagem",
            ru: "1 касание изображения",
            sv: "1 pekning på bilden",
            zh: "该图片有1个接触"
        },
        "TouchSidebarButton.TouchesNo": {
            en: "Collect images you like!",
            fi: "Kerää kuvia, joista pidät!",
            de: "Sammle Bilder, die Dir gefallen!",
            es: "¡Colecciona las imágenes que te gusten!",
            fr: "Collectionez les images que vous aimez",
            hi: "अपनी पसंदीदा छवियाँ एकत्र करें!",
            it: "Raccogli le immagini che ti piacciono!",
            ja: "好きな画像を集めましょう！",
            pl: "Zbieraj obrazy, które lubisz!",
            pt: "Recolha imagens de que gosta!",
            ru: "Собирайте изображения, которые вам нравятся!",
            sv: "Samla bilder du gillar!",
            zh: "收集您喜欢的图片！"
        },
        "TouchSidebarButton.TouchesOther": {
            en: "{0} touches on the image",
            fi: "{0} kosketusta",
            de: "{0} Berührungen des Bildes",
            es: "{0} Toques en la imagen",
            fr: "{0} Touches sur cette image",
            hi: "छवि को {0} व्यक्तियों ने छुआ है",
            it: "{0} Tocchi sull'immagine",
            ja: "このイメージには{0}件のタッチがあります",
            pl: "{0} dotyków na obrazie",
            pt: "{0} Toques na imagem",
            ru: "{0} касания (й) изображения",
            sv: "{0} pekningar på bilden",
            zh: "该图片有{0}个接触"
        },
        "TouchDialogPreSignup.TitleDoYouLikeThisImage": {
            en: "Do you like this image? <p style='font-weight: bold !important; display: inline;'>TOUCH it!</p>",
            fi: "Pidätkö tästä kuvasta? <p style='font-weight: bold !important; display: inline;'>KOSKETA sitä!</p>",
            de: "Mögen Sie dieses Bild? <p style='font-weight: bold !important; display: inline;'>Bild berühren</p>",
            es: "¿Te gusta esta imagen? <p style='font-weight: bold !important; display: inline;'>Dar un Toque a la imagen</p>",
            fr: "Aimez vous cette image? <p style='font-weight: bold !important; display: inline;'>Touchez l'image</p>",
            hi: "क्या आपको यह छवि पसंद है? <p style='font-weight: bold !important; display: inline;'>छवि छुएं (टच करें)</p>",
            it: "Ti piace questa immagine? <p style='font-weight: bold !important; display: inline;'>Tocca l'immagine</p>",
            ja: "このイメージが好きですか？ <p style='font-weight: bold !important; display: inline;'>イメージをタッチ</p>",
            pl: "Lubisz ten obraz? <p style='font-weight: bold !important; display: inline;'>Dotknij obraz</p>",
            pt: "Gosta desta imagem? <p style='font-weight: bold !important; display: inline;'>Toque na imagem</p>",
            ru: "Вам нравится это изображение? <p style='font-weight: bold !important; display: inline;'>Коснуться изображения</p>",
            sv: "Gillar du denna bild? <p style='font-weight: bold !important; display: inline;'>Peka på bilden</p>",
            zh: "你喜欢该图片吗？ <p style='font-weight: bold !important; display: inline;'>接触图片</p>"
        },
        "TouchDialogPreSignup.ContentDoYouLikeThisImage": {
            en: "{0}Sign in{1}to ThingLink to create your own interactive images!",
            fi: "{0}Kirjaudu sisään{1}Thinglink-palveluun ja tee omia interaktiivisia kuvia!",
            de: "Bei ThingLink {0}anmelden{1}, um eigene interaktive Bilder zu erstellen!",
            es: "- ¡{0}Regístrate{1} en ThingLink para crear tus propias imágenes interactivas!",
            fr: "{0}Enregistrez vous{1} à ThingLink pour créer vos propres images intéractives",
            hi: "अपनी खुद की इंटरैक्टिव छवियां बनाने के लिए ThingLink पर  {0} साइन इन {1}  करें!",
            it: "{0}Accedi{1} a ThingLink per creare le tue immagini interattive!",
            ja: "ThingLink にサインインして、インタ{0}アクティブ・イメ{1}ジを作ろう！",
            pl: "{0}Zaloguj się{1} do ThingLink, aby tworzyć własne interaktywne obrazy!",
            pt: "{0}Inscreva{1}se- no ThingLink para criar as suas próprias imagens interativas!",
            ru: "{0}Войдите в{1} ThingLink, чтобы создать свои интерактивные изображения!",
            sv: "{0}Logga in{1} till ThingLink för att skapa dina egna interaktiva bilder!",
            zh: "{0}登陆{1} ThingLink创建你的互动图片"
        },
        "FourDotsButton.MadeWithOrMakeYourOwn": {
            en: "Made with",
            fi: "Tee oma",
            ru: "Сделано с помощью",
            pt: "Feito com o",
            es: "Hecho con",
            pl: "Zrób to sam",
            it: "Creato con",
            ja: "自分の作品を作りましょう",
            fr: "Réalisé avec",
            de: "Hergestellt mit",
            hi: "आपका अपना बनाए",
            zh: "制作你自己的",
            sv: "Skapat med"
        },
        "FourDotsButton.SignUpShort": {
            en: "Sign up!",
            fi: "Rekisteröidy!",
            ru: "Зарегистрируйтесь!",
            pt: "Inscrever-se!",
            es: "¡Regístrate!",
            pl: "Zarejestruj się!",
            it: "Registrati!",
            ja: "サインアップ！",
            fr: "S'inscrire!",
            de: "Melde dich an!",
            hi: "साइन अप करें!",
            zh: "注册吧！",
            sv: "Registrera dig!"
        },
        "FourDotsButton.SignUpLong": {
            en: "Sign up, it's free!",
            fi: "Rekisteröidy, se on ilmaista!",
            ru: "Зарегистрируйтесь, это бесплатно!",
            pt: "Inscreva-se, é grátis!",
            es: "Regístrate, ¡es gratis!",
            pl: "Zarejestruj się, jest to darmowe!",
            it: "Registrati, è gratis!",
            ja: "サインアップ、無料です！",
            fr: "Inscrivez-vous, c'est gratuit!",
            de: "Melde dich an, es ist kostenlos!",
            hi: "साइन अप करें, यह मुफ्त है!",
            zh: "注册吧，免费！",
            sv: "Registrera dig, det är gratis!"
        },
        "FourDotsButton.LearnMore": {
            en: "Learn more",
            fi: "Lue lisää",
            ru: "Узнать больше",
            pt: "Saber mais",
            es: "Descubra más",
            pl: "Dowiedz się więcej",
            it: "Per saperne di più",
            ja: "さらに詳しく",
            fr: "En savoir plus",
            de: "Mehr erfahren",
            hi: "अधिक जानें",
            zh: "了解更多",
            sv: "Lär mer"
        }
    };
    var e = "en";

    function b(g) {
        var j = 1,
            f;
        var h = a[g][c.language || e];
        if (!h) {
                h = a[g]["en"];
                if (!h) {
                    return "§§§" + g + "§§§"
                }
            }
        for (f = j; f < arguments.length; f++) {
                h = h.replace("{" + (f - j) + "}", arguments[f])
            }
        return h
    }
    return b
});
tlRequire.define("util", [], function () {
    function o(q) {
        var s = q.indexOf("://");
        if (s === -1) {
            if (q.substring(0, 2) === "//") {
                s = 2
            } else {
                s = 0
            }
        } else {
            s = s + 3
        }
        var r = q.indexOf("/", s);
        if (r === -1) {
            r = q.indexOf("?", s);
            if (r === -1) {
                r = q.length
            }
        }
        q = q.substring(s, r);
        r = q.indexOf(":");
        if (r != -1) {
            q = q.substring(0, r)
        }
        return q
    }
    function f() {
        return ("https:" == document.location.protocol) ? "https:" : "http:"
    }
    function h(t) {
        if (!t) {
            return ""
        }
        var r = t.indexOf("/", 8);
        var s = t.indexOf("?", 8);
        var q = r < 0 ? s : s < 0 ? r : Math.min(r, s);
        if (q > 0) {
            return t.substring(0, q)
        }
        return t
    }
    function p(s) {
        var r;
        try {
            r = decodeURIComponent(s)
        } catch (t) {
            r = null
        }
        return r ? encodeURI(r) : encodeURI(s)
    }
    function d(r) {
        return r.replace(/;\$?\d+$/, "")
    }
    function g(s) {
        s = String(s);
        var r = s.lastIndexOf(";");
        if (r > 0 && r < s.length - 1) {
            var t = s.slice(r + 1);
            return t
        }
        if (/^\d+$/.test(s)) {
            return s
        }
        return ""
    }
    function c(v, u, t) {
        var s = "";
        var q = u ? "!important" : "";
        var r, w;
        for (r in v) {
            if (v.hasOwnProperty(r)) {
                w = v[r];
                if (t && !isNaN(w) && parseInt(w, 10) !== 0) {
                    w = w + "px"
                }
                s += (r + ":" + w + q + ";")
            }
        }
        return s
    }
    function i() {
        if (typeof(document.addEventListener) === "undefined") {
            return true
        }
        return false
    }
    function e(q) {
        return (q === undefined)
    }
    function n() {
        var q = 0;
        var r = 0;
        if (!window.innerWidth) {
            if (document.documentElement.clientWidth !== 0) {
                q = document.documentElement.clientWidth;
                r = document.documentElement.clientHeight
            } else {
                q = document.body.clientWidth;
                r = document.body.clientHeight
            }
        } else {
            q = window.innerWidth;
            r = window.innerHeight
        }
        return {
            w: q,
            h: r
        }
    }
    function k(t) {
        var w = t.getBoundingClientRect();
        var x = document.body;
        var r = document.documentElement;
        var q = window.pageYOffset || r.scrollTop || x.scrollTop;
        var u = window.pageXOffset || r.scrollLeft || x.scrollLeft;
        var v = r.clientTop || x.clientTop || 0;
        var y = r.clientLeft || x.clientLeft || 0;
        var z = w.top + q - v;
        var s = w.left + u - y;
        return {
            top: Math.round(z),
            left: Math.round(s)
        }
    }
    var m = (function () {
        return document.documentElement && typeof(document.documentElement.ontouchstart) != "undefined"
    }());

    function l(q) {
        return q.parents("div[tl-channel-id]").attr("tl-channel-id")
    }
    function b(r, q) {
        var s;
        for (s in q) {
            if (q.hasOwnProperty(s)) {
                r[s] = q[s]
            }
        }
        return r
    }
    function j() {
        var q = navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./);
        return q ? parseInt(q[2], 10) : false
    }
    function a(r, q) {
        return (q === 150) && (r === 300 || r === 150)
    }
    return {
        cleanURIEncoding: p,
        extractUrl: d,
        extractSceneId: g,
        mapToCssText: c,
        browserIsUnsupported: i,
        no: e,
        getWindowSize: n,
        getOffsetRect: k,
        getDomain: o,
        getProtocol: f,
        getSourceDomain: h,
        isTouchDevice: m,
        getChannelId: l,
        extend: b,
        isSVG: a,
        getChromeVersion: j
    }
});
