(function () {
  var smirk =
    "%c¬‿¬\n%coh. you opened the console. of course you did.\n%ctype ls.\n%cgithub.com/devdotninja-prog";
  var smirkStyle = "color:#8a8276;font-family:ui-serif,Georgia,serif;line-height:1.55;";
  console.log(
    smirk,
    smirkStyle + "font-size:18px;",
    smirkStyle + "font-size:12px;",
    smirkStyle + "font-size:12px;",
    smirkStyle + "font-size:12px;"
  );

  function nowMs() {
    return window.__now == null ? Date.now() : window.__now;
  }

  function jakartaHour() {
    var hour = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Jakarta",
      hour: "2-digit",
      hourCycle: "h23"
    }).format(new Date(nowMs()));
    return Number(hour);
  }

  var things = [
    {
      slug: "link-to-epub",
      name: "link-to-epub",
      href: "https://epub.achgz.dev",
      note: "turn any article into an epub"
    },
    {
      slug: "merpad",
      name: "merpad",
      href: "https://merpad.achgz.dev",
      note: "a mermaid diagram editor"
    },
    {
      slug: "xteink-tools",
      name: "xteink tools",
      note: "soon"
    },
    {
      slug: "more-soon",
      name: "more soon",
      lsOnly: true
    }
  ];

  function hostTitle(href) {
    try {
      return new URL(href).host;
    } catch (err) {
      return href;
    }
  }

  function wordLink(href, text) {
    var a = document.createElement("a");
    a.className = "word";
    a.href = href;
    a.title = hostTitle(href);
    a.textContent = text;
    return a;
  }

  function fillList(el) {
    if (!el) {
      return;
    }
    el.textContent = "";
    things.forEach(function (item) {
      if (item.lsOnly) {
        return;
      }
      var li = document.createElement("li");
      if (item.href) {
        li.appendChild(wordLink(item.href, item.name));
      } else {
        var name = document.createElement("span");
        name.textContent = item.name;
        li.appendChild(name);
      }
      if (item.note) {
        var note = document.createElement("span");
        note.className = "note";
        note.textContent = item.note;
        li.appendChild(document.createTextNode(" "));
        li.appendChild(note);
      }
      el.appendChild(li);
    });
  }

  function fillListing(el) {
    if (!el) {
      return;
    }
    el.textContent = "";
    things.forEach(function (item) {
      var text = item.slug + "/";
      if (item.href) {
        el.appendChild(wordLink(item.href, text));
      } else {
        var span = document.createElement("span");
        span.textContent = text;
        el.appendChild(span);
      }
    });
  }

  function setPanel(el, open) {
    if (!el) {
      return;
    }
    if (open) {
      el.removeAttribute("hidden");
      el.classList.add("is-open");
    } else {
      el.setAttribute("hidden", "");
      el.classList.remove("is-open");
    }
  }

  var line = document.querySelector("h1");
  var something = document.getElementById("something");
  var built = document.getElementById("things");
  var listing = document.getElementById("listing");

  fillList(built);
  fillListing(listing);

  if (line && something && jakartaHour() < 5) {
    line.setAttribute("aria-label", "you don't know me, but i'm still building something");
    var em = line.querySelector("em");
    if (em) {
      em.textContent = "";
      em.appendChild(document.createTextNode("i'm still building "));
      em.appendChild(something);
    }
  }

  function setThingsOpen(open) {
    setPanel(built, open);
    if (something) {
      something.setAttribute("aria-expanded", open ? "true" : "false");
    }
  }

  if (something && built) {
    something.addEventListener("click", function () {
      setThingsOpen(built.hasAttribute("hidden"));
    });
  }

  var typed = "";

  function setListing(open) {
    setPanel(listing, open);
  }

  function isField(el) {
    if (!el) {
      return false;
    }
    if (el.isContentEditable) {
      return true;
    }
    var tag = el.tagName;
    return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
  }

  document.addEventListener("keydown", function (e) {
    if (isField(e.target)) {
      return;
    }
    if (e.key === "Escape") {
      setListing(false);
      setThingsOpen(false);
      typed = "";
      return;
    }
    if (e.ctrlKey || e.metaKey || e.altKey || e.key.length !== 1) {
      return;
    }
    typed = (typed + e.key).slice(-2);
    if (typed === "ls") {
      setListing(listing && listing.hasAttribute("hidden"));
      typed = "";
    }
  });

  var stay = document.getElementById("stay");
  var stayShown = false;
  var stayDelay = window.__stayDelay == null ? 30000 : window.__stayDelay;

  function showStay() {
    if (stayShown || !stay) {
      return;
    }
    stayShown = true;
    stay.removeAttribute("hidden");
    stay.classList.add("is-in");
  }

  window.setTimeout(showStay, stayDelay);

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }

  var soundBtn = document.querySelector(".sound");
  if (!line) {
    return;
  }

  function wrap(el) {
    Array.prototype.slice.call(el.childNodes).forEach(function (node) {
      if (node.nodeType === 3) {
        if (!node.textContent.trim()) {
          node.parentNode.removeChild(node);
          return;
        }
        var frag = document.createDocumentFragment();
        Array.prototype.forEach.call(node.textContent, function (ch) {
          var span = document.createElement("span");
          span.className = "ch";
          span.textContent = ch;
          frag.appendChild(span);
        });
        node.parentNode.replaceChild(frag, node);
      } else if (node.nodeType === 1 && !node.classList.contains("caret")) {
        wrap(node);
      }
    });
  }

  wrap(line);
  var chars = line.querySelectorAll(".ch");
  if (!chars.length) {
    document.documentElement.classList.remove("js-type");
    return;
  }

  var caret = document.createElement("span");
  caret.className = "caret";
  caret.setAttribute("aria-hidden", "true");
  var run = 0;
  var soundOn = false;
  var audioCtx = null;
  var cornersIn = false;

  function tap(ch) {
    if (!soundOn || !audioCtx || audioCtx.state !== "running") {
      return;
    }
    var now = audioCtx.currentTime;
    var n = Math.floor(audioCtx.sampleRate * 0.016);
    var buf = audioCtx.createBuffer(1, n, audioCtx.sampleRate);
    var data = buf.getChannelData(0);
    var i;
    for (i = 0; i < n; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (n * 0.14));
    }
    var src = audioCtx.createBufferSource();
    src.buffer = buf;
    var filter = audioCtx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 1300 + Math.random() * 1700;
    filter.Q.value = 0.8 + Math.random() * 0.9;
    var gain = audioCtx.createGain();
    var vol = (ch === " " ? 0.016 : 0.038) * (0.7 + Math.random() * 0.55);
    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.028);
    src.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);
    src.start(now);
  }

  function playType() {
    var my = ++run;
    var i = 0;
    var step = 1500 / chars.length;
    line.classList.remove("is-done");
    Array.prototype.forEach.call(chars, function (ch) {
      ch.classList.remove("is-on");
    });
    if (!caret.parentNode) {
      chars[0].parentNode.insertBefore(caret, chars[0]);
    }
    line.classList.add("is-ready");

    function tick() {
      if (my !== run) {
        return;
      }
      if (i >= chars.length) {
        line.classList.add("is-done");
        if (caret.parentNode) {
          caret.parentNode.removeChild(caret);
        }
        if (!cornersIn) {
          cornersIn = true;
          if (soundBtn) {
            soundBtn.classList.add("is-in", "is-nudge");
          }
        }
        return;
      }
      chars[i].classList.add("is-on");
      tap(chars[i].textContent);
      chars[i].after(caret);
      i += 1;
      window.setTimeout(tick, Math.max(18, step + (Math.random() - 0.5) * 20));
    }

    tick();
  }

  if (soundBtn) {
    soundBtn.addEventListener("click", function () {
      soundOn = !soundOn;
      soundBtn.setAttribute("aria-pressed", soundOn ? "true" : "false");
      soundBtn.setAttribute("aria-label", soundOn ? "sound on" : "sound off");
      var label = soundBtn.querySelector(".ctrl-label");
      if (label) {
        label.textContent = soundOn ? "sound on" : "sound off";
      }
      if (!soundOn) {
        return;
      }
      var Ctx = window.AudioContext || window.webkitAudioContext;
      if (Ctx && !audioCtx) {
        audioCtx = new Ctx();
      }
      if (audioCtx && audioCtx.resume) {
        audioCtx.resume();
      }
      playType();
    });
  }

  playType();
})();
