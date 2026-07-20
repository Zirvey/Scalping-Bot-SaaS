(function () {
  "use strict";

  var EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
  var BAR_HEIGHTS = [20, 35, 28, 45, 40, 55, 50, 65, 58, 72, 68, 85, 78, 92, 88, 100];
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function initNavScroll() {
    var nav = document.getElementById("deck-nav");
    if (!nav) return;

    function onScroll() {
      nav.classList.toggle("nav-scrolled", window.scrollY > 24);
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  function initReveal() {
    var nodes = document.querySelectorAll("[data-reveal]");
    if (!nodes.length) return;

    if (reduced) {
      nodes.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "-60px 0px", threshold: 0.08 }
    );

    nodes.forEach(function (el) { io.observe(el); });
  }

  function initStagger() {
    var groups = document.querySelectorAll("[data-stagger]");
    if (!groups.length) return;

    if (reduced) {
      groups.forEach(function (g) {
        g.classList.add("is-visible");
        g.querySelectorAll(".stagger-item").forEach(function (c) { c.classList.add("is-visible"); });
      });
      return;
    }

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var group = entry.target;
          group.classList.add("is-visible");
          var items = group.querySelectorAll(".stagger-item");
          var stagger = parseFloat(group.dataset.stagger || "0.08");
          if (Number.isNaN(stagger)) stagger = 0.08;
          items.forEach(function (item, i) {
            item.style.transitionDelay = (i * stagger) + "s";
            item.classList.add("is-visible");
          });
          io.unobserve(group);
        });
      },
      { rootMargin: "-40px 0px", threshold: 0.06 }
    );

    groups.forEach(function (g) { io.observe(g); });
  }

  function formatCount(value, decimals) {
    if (decimals > 0) return value.toFixed(decimals);
    return Math.round(value).toLocaleString();
  }

  function initCountUp() {
    var nodes = document.querySelectorAll("[data-count-up]");
    if (!nodes.length) return;

    nodes.forEach(function (el) {
      var target = parseFloat(el.dataset.countUp || "0");
      var prefix = el.dataset.prefix || "";
      var suffix = el.dataset.suffix || "";
      var decimals = parseInt(el.dataset.decimals || "0", 10);
      var duration = parseFloat(el.dataset.duration || "1.2");
      var immediate = el.dataset.countImmediate === "true";

      if (reduced) {
        el.textContent = prefix + formatCount(target, decimals) + suffix;
        return;
      }

      var started = false;

      function run() {
        if (started) return;
        started = true;
        var start = null;
        function step(ts) {
          if (start === null) start = ts;
          var progress = Math.min((ts - start) / (duration * 1000), 1);
          var eased = 1 - Math.pow(1 - progress, 3);
          el.textContent = prefix + formatCount(target * eased, decimals) + suffix;
          if (progress < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      }

      if (immediate) {
        run();
        return;
      }

      var io = new IntersectionObserver(
        function (entries) {
          if (entries[0].isIntersecting) {
            run();
            io.disconnect();
          }
        },
        { rootMargin: "-40px" }
      );
      io.observe(el);
    });
  }

  function initAnimatedBars() {
    var wrap = document.querySelector(".hero-chart-bars");
    if (!wrap) return;

    BAR_HEIGHTS.forEach(function (h) {
      var bar = document.createElement("span");
      bar.className = "hero-chart-bar";
      bar.style.setProperty("--bar-h", h + "%");
      wrap.appendChild(bar);
    });

    if (reduced) {
      wrap.querySelectorAll(".hero-chart-bar").forEach(function (bar) {
        bar.style.height = bar.style.getPropertyValue("--bar-h");
      });
      return;
    }

    var io = new IntersectionObserver(
      function (entries) {
        if (!entries[0].isIntersecting) return;
        wrap.querySelectorAll(".hero-chart-bar").forEach(function (bar, i) {
          bar.style.transition = "height 0.5s " + EASE + " " + (i * 0.04) + "s";
          bar.style.height = bar.style.getPropertyValue("--bar-h");
        });
        io.disconnect();
      },
      { rootMargin: "-40px" }
    );
    io.observe(wrap);
  }

  document.addEventListener("DOMContentLoaded", function () {
    initNavScroll();
    initReveal();
    initStagger();
    initCountUp();
    initAnimatedBars();
  });
})();
