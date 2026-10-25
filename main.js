// Interactive layer. The site still reads and works without JavaScript.
(function () {
  "use strict";

  var doc = document;
  var root = doc.documentElement;
  var reduceMotion =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  root.classList.add("js");

  /* ------------------------------------------------------------------
     "Redact" / "Declassify" toggle for the intro text
     ------------------------------------------------------------------ */
  (function () {
    var lede = doc.getElementById("lede");
    var toggle = doc.getElementById("redact-toggle");
    if (!lede || !toggle) return;

    toggle.hidden = false;
    toggle.addEventListener("click", function () {
      var redacted = lede.classList.toggle("is-redacted");
      toggle.textContent = redacted ? "Declassify" : "Redact";
    });
  })();

  /* ------------------------------------------------------------------
     Footer year
     ------------------------------------------------------------------ */
  (function () {
    var year = doc.getElementById("year");
    if (year) year.textContent = String(new Date().getFullYear());
  })();

  /* ------------------------------------------------------------------
     Scroll progress bar
     ------------------------------------------------------------------ */
  (function () {
    var bar = doc.getElementById("progress");
    if (!bar) return;
    var ticking = false;

    function update() {
      var max = root.scrollHeight - window.innerHeight;
      var p = max > 0 ? window.scrollY / max : 0;
      bar.style.transform = "scaleX(" + Math.min(1, Math.max(0, p)) + ")";
      ticking = false;
    }

    window.addEventListener(
      "scroll",
      function () {
        if (!ticking) {
          ticking = true;
          window.requestAnimationFrame(update);
        }
      },
      { passive: true }
    );
    window.addEventListener("resize", update);
    update();
  })();

  /* ------------------------------------------------------------------
     Hero network: drifting nodes that link up and chase the cursor
     ------------------------------------------------------------------ */
  (function () {
    var canvas = doc.getElementById("net");
    if (!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext("2d");
    if (!ctx) return;

    var hero = canvas.parentNode;
    var LINK = 130;
    var REACH = 170;
    var FLAG = "255,255,255";
    var nodeRgb = "78,93,107";
    var w = 0;
    var h = 0;
    var nodes = [];
    var raf = 0;
    var visible = true;
    var mouse = { x: -9999, y: -9999, active: false };
    var last = 0;

    function hexToRgb(hex) {
      var m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex.trim());
      return m ? parseInt(m[1], 16) + "," + parseInt(m[2], 16) + "," + parseInt(m[3], 16) : null;
    }

    function readColors() {
      var steel = window.getComputedStyle(root).getPropertyValue("--steel");
      nodeRgb = hexToRgb(steel || "") || nodeRgb;
      if (reduceMotion) draw(0);
    }

    function makeNode() {
      var angle = Math.random() * Math.PI * 2;
      var speed = 0.15 + Math.random() * 0.25;
      return {
        x: Math.random() * w,
        y: Math.random() * h,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        r: 1.5 + Math.random() * 1.5
      };
    }

    function resize() {
      var rect = hero.getBoundingClientRect();
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = rect.width;
      h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      var target = Math.max(18, Math.min(70, Math.round((w * h) / 14000)));
      while (nodes.length < target) nodes.push(makeNode());
      nodes.length = target;
      nodes.forEach(function (n) {
        if (n.x > w) n.x = Math.random() * w;
        if (n.y > h) n.y = Math.random() * h;
      });
      draw(0);
    }

    function draw(dt) {
      ctx.clearRect(0, 0, w, h);
      var i, j, n, m, dx, dy, d, a;

      for (i = 0; i < nodes.length; i++) {
        n = nodes[i];

        if (dt && mouse.active) {
          dx = mouse.x - n.x;
          dy = mouse.y - n.y;
          d = Math.sqrt(dx * dx + dy * dy);
          if (d < REACH && d > 1) {
            n.vx += (dx / d) * 0.012 * dt;
            n.vy += (dy / d) * 0.012 * dt;
          }
        }

        if (dt) {
          var speed = Math.sqrt(n.vx * n.vx + n.vy * n.vy);
          if (speed > 0.9) {
            n.vx = (n.vx / speed) * 0.9;
            n.vy = (n.vy / speed) * 0.9;
          }
          n.x += n.vx * dt;
          n.y += n.vy * dt;
          if (n.x < 0 || n.x > w) n.vx *= -1;
          if (n.y < 0 || n.y > h) n.vy *= -1;
          n.x = Math.min(w, Math.max(0, n.x));
          n.y = Math.min(h, Math.max(0, n.y));
        }
      }

      ctx.lineWidth = 1;
      for (i = 0; i < nodes.length; i++) {
        n = nodes[i];
        for (j = i + 1; j < nodes.length; j++) {
          m = nodes[j];
          dx = n.x - m.x;
          dy = n.y - m.y;
          d = Math.sqrt(dx * dx + dy * dy);
          if (d < LINK) {
            a = (1 - d / LINK) * 0.35;
            ctx.strokeStyle = "rgba(" + nodeRgb + "," + a + ")";
            ctx.beginPath();
            ctx.moveTo(n.x, n.y);
            ctx.lineTo(m.x, m.y);
            ctx.stroke();
          }
        }
      }

      for (i = 0; i < nodes.length; i++) {
        n = nodes[i];
        var near = false;
        if (mouse.active) {
          dx = mouse.x - n.x;
          dy = mouse.y - n.y;
          d = Math.sqrt(dx * dx + dy * dy);
          if (d < REACH) {
            near = true;
            a = (1 - d / REACH) * 0.9;
            ctx.strokeStyle = "rgba(" + FLAG + "," + a + ")";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(n.x, n.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
            ctx.lineWidth = 1;
          }
        }
        ctx.fillStyle = near ? "rgb(" + FLAG + ")" : "rgba(" + nodeRgb + ",0.7)";
        ctx.beginPath();
        ctx.arc(n.x, n.y, near ? n.r + 1.5 : n.r, 0, Math.PI * 2);
        ctx.fill();
      }

      if (mouse.active) {
        ctx.strokeStyle = "rgb(" + FLAG + ")";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 9, 0, Math.PI * 2);
        ctx.stroke();
        ctx.lineWidth = 1;
      }
    }

    function frame(now) {
      raf = 0;
      if (!visible || doc.hidden) return;
      var dt = last ? Math.min(3, (now - last) / 16.7) : 1;
      last = now;
      draw(dt);
      raf = window.requestAnimationFrame(frame);
    }

    function start() {
      if (reduceMotion || raf || !visible || doc.hidden) return;
      last = 0;
      raf = window.requestAnimationFrame(frame);
    }

    hero.addEventListener("pointermove", function (e) {
      var rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
    });
    hero.addEventListener("pointerleave", function () {
      mouse.active = false;
    });

    window.addEventListener("resize", resize);
    doc.addEventListener("visibilitychange", function () {
      if (doc.hidden) {
        if (raf) window.cancelAnimationFrame(raf);
        raf = 0;
      } else {
        start();
      }
    });

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
        if (visible) start();
      }).observe(hero);
    }

    if (typeof window.matchMedia === "function") {
      var dark = window.matchMedia("(prefers-color-scheme: dark)");
      if (dark.addEventListener) dark.addEventListener("change", readColors);
    }

    resize();
    readColors();
    start();
  })();

  /* ------------------------------------------------------------------
     Hero image: tilt towards the cursor, click to change
     ------------------------------------------------------------------ */
  (function () {
    var fig = doc.querySelector(".hero-art[data-images]");
    if (!fig) return;
    var img = fig.querySelector("img");
    if (!img) return;

    var list = fig.getAttribute("data-images").split(/\s+/).filter(Boolean);
    if (list.length < 2) return;

    var idx = Math.max(0, list.indexOf(img.getAttribute("src")));

    var btn = doc.createElement("button");
    btn.type = "button";
    btn.className = "hero-art-btn";
    btn.setAttribute("aria-label", "Show the next image");
    fig.insertBefore(btn, img);
    btn.appendChild(img);

    var cap = doc.createElement("figcaption");
    cap.textContent = "Tap the image to switch";
    fig.appendChild(cap);

    img.addEventListener("load", function () {
      img.classList.remove("swap");
    });

    btn.addEventListener("click", function () {
      idx = (idx + 1) % list.length;
      if (reduceMotion) {
        img.src = list[idx];
        return;
      }
      img.classList.add("swap");
      window.setTimeout(function () {
        img.src = list[idx];
      }, 180);
    });

    if (!reduceMotion) {
      btn.addEventListener("pointermove", function (e) {
        if (e.pointerType === "touch") return;
        var r = btn.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;
        var y = (e.clientY - r.top) / r.height - 0.5;
        btn.style.transform =
          "perspective(700px) rotateX(" + (-y * 9).toFixed(2) + "deg) rotateY(" + (x * 11).toFixed(2) + "deg)";
      });
      btn.addEventListener("pointerleave", function () {
        btn.style.transform = "";
      });
    }
  })();

  /* ------------------------------------------------------------------
     Terminal: answers are read from the page, so edits flow through
     ------------------------------------------------------------------ */
  (function () {
    var section = doc.getElementById("terminal");
    var out = doc.getElementById("term-out");
    var form = doc.getElementById("term-form");
    var input = doc.getElementById("term-input");
    if (!section || !out || !form || !input) return;

    section.hidden = false;

    var history = [];
    var cursor = 0;
    var timers = [];

    function norm(text) {
      return (text || "").replace(/\s+/g, " ").trim();
    }

    function safeHref(href) {
      return /^(https?:|mailto:)/i.test(href) ? href : null;
    }

    function addLine(item) {
      var row = doc.createElement("div");
      row.className = "term-line" + (item.cls ? " " + item.cls : "");
      if (item.text) row.appendChild(doc.createTextNode(item.text));
      if (item.href && safeHref(item.href)) {
        var a = doc.createElement("a");
        a.href = item.href;
        a.textContent = item.label || item.href;
        if (/^https?:/i.test(item.href)) {
          a.target = "_blank";
          a.rel = "noopener noreferrer";
        }
        row.appendChild(a);
      }
      out.appendChild(row);
      out.scrollTop = out.scrollHeight;
    }

    function emit(items) {
      items.forEach(function (item, i) {
        if (typeof item === "string") item = { text: item };
        if (reduceMotion) {
          addLine(item);
        } else {
          timers.push(window.setTimeout(function () { addLine(item); }, i * 40));
        }
      });
    }

    function text(sel) {
      var el = doc.querySelector(sel);
      return el ? norm(el.textContent) : "";
    }

    var commands = {
      help: function () {
        return [
          "Commands:",
          "  whoami     who I am",
          "  skills     what I can do",
          "  projects   things I've built",
          "  education  where I study",
          "  contact    how to reach me",
          "  clear      wipe the screen",
          { text: "There may be one or two hidden ones.", cls: "term-muted" }
        ];
      },
      whoami: function () {
        var lines = [text("h1"), text(".role"), text("#lede")].filter(Boolean);
        doc.querySelectorAll(".file-summary div").forEach(function (row) {
          var dt = row.querySelector("dt");
          var dd = row.querySelector("dd");
          if (dt && dd) lines.push("  " + norm(dt.textContent) + ": " + norm(dd.textContent));
        });
        return lines;
      },
      skills: function () {
        var lines = [];
        doc.querySelectorAll(".skill-group").forEach(function (group) {
          var items = [];
          group.querySelectorAll("li").forEach(function (li) { items.push(norm(li.textContent)); });
          lines.push(norm(group.querySelector("h3").textContent) + ": " + items.join(", "));
        });
        return lines;
      },
      projects: function () {
        var lines = [];
        doc.querySelectorAll(".exhibit").forEach(function (ex) {
          var marker = norm(ex.querySelector(".marker").textContent);
          var title = ex.querySelector("h3").cloneNode(true);
          var sample = title.querySelector(".sample, .status");
          if (sample) sample.parentNode.removeChild(sample);
          var desc = ex.querySelector(".exhibit-body > p");
          lines.push("Exhibit " + marker + ": " + norm(title.textContent));
          if (desc) lines.push({ text: "  " + norm(desc.textContent), cls: "term-muted" });
        });
        return lines;
      },
      education: function () {
        var lines = [];
        doc.querySelectorAll(".path > div").forEach(function (row) {
          lines.push(norm(row.querySelector("dt").textContent) + ": " + norm(row.querySelector("dd").textContent));
        });
        return lines;
      },
      contact: function () {
        var lines = [];
        var email = doc.querySelector(".email");
        if (email) lines.push({ text: "Email: ", label: norm(email.textContent), href: email.getAttribute("href") });
        doc.querySelectorAll(".socials a").forEach(function (a) {
          var spans = a.querySelectorAll("span");
          if (spans.length > 1) {
            lines.push({ text: norm(spans[0].textContent) + ": ", label: norm(spans[1].textContent), href: a.href });
          }
        });
        return lines;
      },
      hire: function () {
        return [
          { text: "Access granted. Good call.", cls: "term-cmd" }
        ].concat(commands.contact());
      },
      clear: function () {
        timers.forEach(function (t) { window.clearTimeout(t); });
        timers = [];
        out.textContent = "";
        return [];
      }
    };

    function run(raw) {
      var cmd = norm(raw);
      if (!cmd) return;
      history.push(cmd);
      cursor = history.length;

      var lowered = cmd.toLowerCase();
      var parts = lowered.split(" ");
      var isClear = lowered === "clear";
      if (!isClear) emit([{ text: "$ " + cmd, cls: "term-cmd" }]);

      var result;
      if (parts[0] === "sudo") {
        result = parts[1] === "hire" ? commands.hire() : [{ text: "Permission denied. Nice try, though.", cls: "term-muted" }];
      } else if (Object.prototype.hasOwnProperty.call(commands, parts[0]) && parts[0] !== "hire") {
        result = commands[parts[0]]();
      } else if (lowered === "ls") {
        result = ["about.txt  skills.txt  projects/  contact.txt", { text: "Try: skills, projects, contact", cls: "term-muted" }];
      } else {
        result = [{ text: "command not found: " + cmd + ". Type help.", cls: "term-muted" }];
      }
      if (result.length) emit(result);
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      run(input.value);
      input.value = "";
    });

    input.addEventListener("keydown", function (e) {
      if (e.key === "ArrowUp" && history.length) {
        e.preventDefault();
        cursor = Math.max(0, cursor - 1);
        input.value = history[cursor] || "";
      } else if (e.key === "ArrowDown" && history.length) {
        e.preventDefault();
        cursor = Math.min(history.length, cursor + 1);
        input.value = history[cursor] || "";
      }
    });

    section.querySelectorAll(".term-chips button").forEach(function (b) {
      b.addEventListener("click", function () {
        run(b.getAttribute("data-cmd"));
      });
    });

    addLine({ text: "Welcome. This terminal reads its answers from this page.", cls: "term-muted" });
    addLine({ text: "Type help, or tap a command below.", cls: "term-muted" });
  })();

  /* ------------------------------------------------------------------
     Reveal sections as they scroll into view
     ------------------------------------------------------------------ */
  (function () {
    if (reduceMotion || !("IntersectionObserver" in window)) return;

    var targets = doc.querySelectorAll(
      ".section h2, .term-note, .prose p, .skill-group, .exhibit, .path > div, " +
      ".contact-lead, .email, .social-title, .socials li, .term"
    );

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -5% 0px" }
    );

    Array.prototype.forEach.call(targets, function (el) {
      var pos = Array.prototype.indexOf.call(el.parentNode.children, el);
      el.style.transitionDelay = (pos % 6) * 70 + "ms";
      el.classList.add("reveal");
      io.observe(el);
    });
  })();
})();
