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
  chars[0].parentNode.insertBefore(caret, chars[0]);

  line.classList.add("is-ready");
  var step = 1500 / chars.length;
  var i = 0;

  function tick() {
    if (i >= chars.length) {
      line.classList.add("is-done");
      if (caret.parentNode) {
        caret.parentNode.removeChild(caret);
      }
      return;
    }
    chars[i].classList.add("is-on");
    chars[i].after(caret);
    i += 1;
    window.setTimeout(tick, step);
  }

  tick();
})();
