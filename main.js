(function () {
  "use strict";

  var header = document.querySelector(".site-header");
  var sidebar = document.getElementById("sidebar-nav");
  var backdrop = document.getElementById("nav-backdrop");
  var navToggle = document.querySelector(".nav-toggle");
  var navLinks = document.querySelectorAll(".sidebar__link");

  function closeMobileNav() {
    if (!sidebar || !backdrop || !navToggle) return;
    sidebar.classList.remove("is-open");
    backdrop.hidden = true;
    backdrop.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  }

  function openMobileNav() {
    if (!sidebar || !backdrop || !navToggle) return;
    sidebar.classList.add("is-open");
    backdrop.hidden = false;
    requestAnimationFrame(function () {
      backdrop.classList.add("is-open");
    });
    navToggle.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
  }

  function toggleMobileNav() {
    if (sidebar && sidebar.classList.contains("is-open")) closeMobileNav();
    else openMobileNav();
  }

  if (navToggle) {
    navToggle.addEventListener("click", toggleMobileNav);
  }
  if (backdrop) {
    backdrop.addEventListener("click", closeMobileNav);
  }
  navLinks.forEach(function (link) {
    link.addEventListener("click", function () {
      if (window.matchMedia("(max-width: 900px)").matches) closeMobileNav();
    });
  });

  window.addEventListener("resize", function () {
    if (window.innerWidth > 900) closeMobileNav();
  });

  /* Header shadow on scroll */
  function onScrollHeader() {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  }
  window.addEventListener("scroll", onScrollHeader, { passive: true });
  onScrollHeader();

  /* Smooth anchor with offset for fixed header */
  var headerOffset = function () {
    return header ? header.offsetHeight : 60;
  };

  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener("click", function (e) {
      var id = anchor.getAttribute("href");
      if (!id || id === "#") return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      var top = target.getBoundingClientRect().top + window.scrollY - headerOffset() - 12;
      window.scrollTo({ top: top, behavior: "smooth" });
      history.pushState(null, "", id);
    });
  });

  /* Active nav from scroll (scroll spy) */
  var sectionEls = Array.prototype.slice.call(document.querySelectorAll("section.section[id]"));
  function updateActiveNav() {
    if (!sectionEls.length || !navLinks.length) return;
    var y = window.scrollY + headerOffset() + 24;
    var activeId = sectionEls[0].id;
    for (var j = sectionEls.length - 1; j >= 0; j--) {
      if (sectionEls[j].offsetTop <= y) {
        activeId = sectionEls[j].id;
        break;
      }
    }
    navLinks.forEach(function (a) {
      a.classList.toggle("is-active", a.getAttribute("href") === "#" + activeId);
    });
  }
  window.addEventListener("scroll", updateActiveNav, { passive: true });
  updateActiveNav();

  /* Copy to clipboard */
  function flashButton(btn) {
    btn.classList.add("is-done");
    var label = btn.querySelector(".btn-copy__label");
    var prev = label ? label.textContent : "";
    if (label) label.textContent = "Copiado!";
    setTimeout(function () {
      btn.classList.remove("is-done");
      if (label) label.textContent = prev || "Copiar";
    }, 1800);
  }

  document.querySelectorAll("[data-copy]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var text = btn.getAttribute("data-copy");
      if (!text) return;
      navigator.clipboard.writeText(text).then(
        function () {
          flashButton(btn);
        },
        function () {
          flashButton(btn);
        }
      );
    });
  });

  document.querySelectorAll("[data-copy-target]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var id = btn.getAttribute("data-copy-target");
      var el = id ? document.getElementById(id) : null;
      if (!el) return;
      var text = el.textContent || "";
      navigator.clipboard.writeText(text.trim()).then(
        function () {
          flashButton(btn);
        },
        function () {
          flashButton(btn);
        }
      );
    });
  });

  /* JSON syntax highlight — tokenize without executing */
  function escapeHtml(s) {
    return s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function highlightJson(raw) {
    var s = raw.trim();
    var out = "";
    var i = 0;
    while (i < s.length) {
      var c = s[i];
      if (c === " " || c === "\n" || c === "\r" || c === "\t") {
        out += c;
        i++;
        continue;
      }
      if (c === '"') {
        var end = i + 1;
        while (end < s.length) {
          if (s[end] === "\\") {
            end += 2;
            continue;
          }
          if (s[end] === '"') break;
          end++;
        }
        var str = s.slice(i, end + 1);
        var after = s.slice(end + 1).match(/^\s*:/);
        var cls = after ? "hl-key" : "hl-string";
        out += '<span class="' + cls + '">' + escapeHtml(str) + "</span>";
        i = end + 1;
        continue;
      }
      if (s.slice(i, i + 4) === "true") {
        i += 4;
        out += '<span class="hl-boolean">true</span>';
        continue;
      }
      if (s.slice(i, i + 5) === "false") {
        i += 5;
        out += '<span class="hl-boolean">false</span>';
        continue;
      }
      if (s.slice(i, i + 4) === "null") {
        i += 4;
        out += '<span class="hl-null">null</span>';
        continue;
      }
      if (/[-\d]/.test(c) || (c === "-" && /[\d]/.test(s[i + 1]))) {
        var start = i;
        if (c === "-") i++;
        while (i < s.length && /[\d.eE+-]/.test(s[i])) i++;
        var num = s.slice(start, i);
        out += '<span class="hl-number">' + escapeHtml(num) + "</span>";
        continue;
      }
      out += '<span class="hl-punct">' + escapeHtml(c) + "</span>";
      i++;
    }
    return out;
  }

  document.querySelectorAll("code.language-json").forEach(function (code) {
    var raw = code.textContent;
    code.innerHTML = highlightJson(raw);
  });
})();
