(function () {
  var smirk =
    "%c¬‿¬\n%coh. you opened the console. of course you did.\n%cgithub.com/devdotninja-prog";
  var smirkStyle = "color:#8a8276;font-family:ui-serif,Georgia,serif;line-height:1.55;";
  console.log(smirk, smirkStyle + "font-size:18px;", smirkStyle + "font-size:12px;", smirkStyle + "font-size:12px;");

  var hint = document.querySelector(".hint");
  var more = document.getElementById("more");
  if (hint && more) {
    hint.addEventListener("click", function () {
      var open = more.hasAttribute("hidden");
      if (open) {
        more.removeAttribute("hidden");
        more.classList.add("is-open");
        hint.setAttribute("aria-expanded", "true");
      } else {
        more.setAttribute("hidden", "");
        more.classList.remove("is-open");
        hint.setAttribute("aria-expanded", "false");
      }
    });
  }

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }

  var line = document.querySelector("h1");
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
