const $ = (sel, el = document) => el.querySelector(sel);
const app = $("#app");

const store = {
  get(k, fallback) {
    try { return JSON.parse(localStorage.getItem(k)) ?? fallback; }
    catch { return fallback; }
  },
  set(k, v) { localStorage.setItem(k, JSON.stringify(v)); }
};

function currentUser() { return store.get("tn_user", null); }
function matches() { return store.get("tn_matches", []); }
function likes() { return store.get("tn_likes", []); }
function chats() { return store.get("tn_chats", {}); }

const routes = {
  landing() {
    return `
      <div class="wrap">
        <nav class="nav">
          <div class="brand"><span class="mark">T</span> Tuko Near</div>
          <div class="nav-actions">
            <button class="btn ghost" data-go="login">Log in</button>
            <button class="btn primary" data-go="signup">Create account</button>
          </div>
        </nav>
        <section class="hero">
          <div>
            <h1>Meet someone<br>in your county.</h1>
            <p class="lead">Location-based matchmaking for Kenya. Nairobi to Nyali, Ruiru to Kisumu — people close enough to actually meet.</p>
            <button class="btn primary" data-go="signup">Start nearby</button>
            <div class="pills">
              <span class="pill">GPS nearby</span>
              <span class="pill">County filters</span>
              <span class="pill">Chat</span>
              <span class="pill">Safety tools</span>
              <span class="pill">M-Pesa ready*</span>
            </div>
          </div>
          <aside class="preview">
            <img src="${DEMO_PROFILES[0].photo}" alt="Preview profile" />
            <div class="meta">
              <h3>${DEMO_PROFILES[0].name}, ${DEMO_PROFILES[0].age}</h3>
              <p class="sub">${DEMO_PROFILES[0].town} · ${DEMO_PROFILES[0].county} · ${DEMO_PROFILES[0].distanceKm} km</p>
            </div>
          </aside>
        </section>
        <div class="grid-3">
          <article class="card"><h3>1. Profile</h3><p>Photos, age, bio, county, interests, religion, student or professional mode.</p></article>
          <article class="card"><h3>2. Nearby</h3><p>We use your coordinates and county to surface people you can actually meet this week.</p></article>
          <article class="card"><h3>3. Match & chat</h3><p>Like, match, talk. Report and block when something feels off.</p></article>
        </div>
        <p class="notice">This is a working demo (accounts and chats stay in your browser). A production build would use Supabase + Netlify + M-Pesa.</p>
      </div>`;
  },

  signup() {
    return `
      <div class="app-shell">
        <div class="topbar"><h2>Karibu</h2><button class="btn ghost" data-go="landing">Back</button></div>
        <p class="notice">Create a demo profile. Nothing leaves this device.</p>
        <form class="form" id="signup-form">
          <div><label>Name</label><input name="name" required placeholder="e.g. Achieng" /></div>
          <div><label>Email</label><input name="email" type="email" required placeholder="you@email.com" /></div>
          <div><label>Password</label><input name="password" type="password" required minlength="4" /></div>
          <div><label>Age</label><input name="age" type="number" min="18" max="80" value="25" required /></div>
          <div><label>County</label>
            <select name="county">${COUNTIES.map(c => `<option>${c}</option>`).join("")}</select>
          </div>
          <div><label>Town / estate</label><input name="town" placeholder="Kilimani, Nyali, Milimani…" /></div>
          <div><label>Bio</label><textarea name="bio" rows="3" placeholder="What should someone know?"></textarea></div>
          <div><label>Religion</label>
            <select name="religion">${RELIGIONS.map(r => `<option>${r}</option>`).join("")}</select>
          </div>
          <div>
            <label>Interests</label>
            <div class="chips" id="interest-chips">
              ${INTERESTS.map(i => `<button type="button" class="chip" data-int="${i}">${i}</button>`).join("")}
            </div>
          </div>
          <button class="btn primary full" type="submit">Create profile</button>
        </form>
      </div>`;
  },

  login() {
    return `
      <div class="app-shell">
        <div class="topbar"><h2>Log in</h2><button class="btn ghost" data-go="landing">Back</button></div>
        <form class="form" id="login-form">
          <div><label>Email</label><input name="email" type="email" required /></div>
          <div><label>Password</label><input name="password" type="password" required /></div>
          <button class="btn primary full" type="submit">Enter</button>
        </form>
        <p class="notice">No account yet? <button class="btn ghost" data-go="signup">Sign up</button></p>
      </div>`;
  },

  discover() {
    const u = currentUser();
    const deck = store.get("tn_deck", DEMO_PROFILES.map(p => p.id));
    const card = DEMO_PROFILES.find(p => deck[0] === p.id);
    const loc = store.get("tn_loc", null);
    return `
      <div class="app-shell">
        <div class="topbar">
          <h2>Nearby</h2>
          <button class="btn" data-go="filters">Filters</button>
        </div>
        <div class="loc" id="loc-line">${loc ? `≈ ${loc.lat.toFixed(3)}, ${loc.lng.toFixed(3)} · ${u?.county || ""}` : "Location off — using county only"}</div>
        ${card ? `
          <div class="swipe-card">
            <img src="${card.photo}" alt="${card.name}" />
            <div class="swipe-grad">
              <h2>${card.name}, ${card.age}</h2>
              <p>${card.town} · ${card.county} · ${card.distanceKm} km</p>
              <p>${card.bio}</p>
              <div class="pills">${card.interests.map(i => `<span class="pill">${i}</span>`).join("")}</div>
            </div>
          </div>
          <div class="swipe-actions">
            <button class="round no" id="pass">✕</button>
            <button class="round yes" id="like">♥</button>
          </div>
        ` : `<div class="empty">That’s everyone nearby for now. Adjust filters or check Matches.</div>`}
        ${tabbar("discover")}
      </div>`;
  },

  filters() {
    const f = store.get("tn_filters", { county: "", minAge: 18, maxAge: 40, religion: "" });
    return `
      <div class="app-shell">
        <div class="topbar"><h2>Filters</h2><button class="btn ghost" data-go="discover">Done</button></div>
        <form class="form" id="filter-form">
          <div><label>County</label>
            <select name="county"><option value="">Any Kenya</option>${COUNTIES.map(c => `<option ${f.county===c?"selected":""}>${c}</option>`).join("")}</select>
          </div>
          <div><label>Min age</label><input name="minAge" type="number" value="${f.minAge}" /></div>
          <div><label>Max age</label><input name="maxAge" type="number" value="${f.maxAge}" /></div>
          <div><label>Religion</label>
            <select name="religion"><option value="">Any</option>${RELIGIONS.map(r => `<option ${f.religion===r?"selected":""}>${r}</option>`).join("")}</select>
          </div>
          <button class="btn primary full" type="submit">Apply</button>
        </form>
        ${tabbar("discover")}
      </div>`;
  },

  matches() {
    const list = matches();
    return `
      <div class="app-shell">
        <div class="topbar"><h2>Matches</h2></div>
        ${list.length ? list.map(id => {
          const p = DEMO_PROFILES.find(x => x.id === id);
          if (!p) return "";
          return `<button class="match-row" data-chat="${p.id}">
            <img src="${p.photo}" alt="" />
            <div class="grow"><strong>${p.name}</strong><br><small>${p.town} · ${p.county}</small></div>
          </button>`;
        }).join("") : `<div class="empty">No matches yet. Like someone on Nearby.</div>`}
        ${tabbar("matches")}
      </div>`;
  },

  chat(id) {
    const p = DEMO_PROFILES.find(x => x.id === id);
    const thread = chats()[id] || [{ from: "them", text: `Sasa 👋 It’s ${p.name}. You nearby for real?` }];
    return `
      <div class="app-shell">
        <div class="topbar">
          <h2>${p ? p.name : "Chat"}</h2>
          <div>
            <button class="btn danger" data-report="${id}">Report</button>
            <button class="btn ghost" data-go="matches">Back</button>
          </div>
        </div>
        <div class="chat">
          <div class="bubbles" id="bubbles">
            ${thread.map(m => `<div class="bubble ${m.from==="me"?"me":""}">${escapeHtml(m.text)}</div>`).join("")}
          </div>
          <form class="composer" id="chat-form">
            <input name="text" placeholder="Write something…" autocomplete="off" required />
            <button class="btn primary" type="submit">Send</button>
          </form>
        </div>
      </div>`;
  },

  profile() {
    const u = currentUser();
    return `
      <div class="app-shell">
        <div class="topbar"><h2>You</h2></div>
        ${u ? `
          <div class="card">
            <h3>${u.name}, ${u.age}</h3>
            <p>${u.town || ""} · ${u.county}</p>
            <p class="notice">${u.bio || "No bio yet."}</p>
            <p class="notice">${(u.interests||[]).join(" · ")}</p>
          </div>
        ` : `<p class="notice">Not signed in.</p>`}
        <div class="card" style="margin-top:14px">
          <h3>Premium (soon)</h3>
          <p>Boost your profile, Super Like, and see who liked you. Pay with M-Pesa.</p>
        </div>
        <p style="margin-top:16px"><button class="btn" id="geo">Use my location</button></p>
        <p style="margin-top:10px"><button class="btn danger" id="logout">Log out</button></p>
        ${tabbar("profile")}
      </div>`;
  }
};

function tabbar(active) {
  const items = [
    ["discover", "Nearby"],
    ["matches", "Matches"],
    ["profile", "You"],
    ["landing", "Home"]
  ];
  return `<nav class="tabbar">${items.map(([k,l]) => `<button data-go="${k}" class="${k===active?"active":""}">${l}</button>`).join("")}</nav>`;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ "&":"&","<":"<",">":">","\"":""","'":"&#39;" }[c]));
}

let view = "landing";
let chatId = null;

function render() {
  if (view === "chat") app.innerHTML = routes.chat(chatId);
  else app.innerHTML = routes[view]();
  bind();
}

function needAuth(v) {
  return ["discover","matches","profile","filters","chat"].includes(v);
}

function go(v, extra) {
  if (needAuth(v) && !currentUser()) { view = "signup"; render(); return; }
  view = v;
  if (extra) chatId = extra;
  render();
}

function nextCard(liked) {
  const deck = store.get("tn_deck", DEMO_PROFILES.map(p => p.id));
  const id = deck[0];
  if (!id) return;
  if (liked) {
    const ls = likes();
    ls.push(id);
    store.set("tn_likes", ls);
    if (Math.random() > 0.25) {
      const ms = matches();
      if (!ms.includes(id)) { ms.push(id); store.set("tn_matches", ms); }
    }
  }
  store.set("tn_deck", deck.slice(1));
  render();
}

function bind() {
  document.querySelectorAll("[data-go]").forEach(b => b.onclick = () => go(b.dataset.go));
  document.querySelectorAll("[data-chat]").forEach(b => b.onclick = () => go("chat", b.dataset.chat));

  const chips = $("#interest-chips");
  if (chips) chips.onclick = (e) => {
    const t = e.target.closest(".chip");
    if (t) t.classList.toggle("on");
  };

  const sf = $("#signup-form");
  if (sf) sf.onsubmit = (e) => {
    e.preventDefault();
    const fd = new FormData(sf);
    const interests = [...document.querySelectorAll(".chip.on")].map(c => c.dataset.int);
    store.set("tn_user", {
      name: fd.get("name"),
      email: fd.get("email"),
      password: fd.get("password"),
      age: Number(fd.get("age")),
      county: fd.get("county"),
      town: fd.get("town"),
      bio: fd.get("bio"),
      religion: fd.get("religion"),
      interests
    });
    store.set("tn_deck", DEMO_PROFILES.map(p => p.id));
    go("discover");
  };

  const lf = $("#login-form");
  if (lf) lf.onsubmit = (e) => {
    e.preventDefault();
    const u = currentUser();
    const fd = new FormData(lf);
    if (u && u.email === fd.get("email") && u.password === fd.get("password")) go("discover");
    else alert("No matching demo account. Sign up first.");
  };

  const ff = $("#filter-form");
  if (ff) ff.onsubmit = (e) => {
    e.preventDefault();
    const fd = new FormData(ff);
    const filters = {
      county: fd.get("county"),
      minAge: Number(fd.get("minAge")),
      maxAge: Number(fd.get("maxAge")),
      religion: fd.get("religion")
    };
    store.set("tn_filters", filters);
    const deck = DEMO_PROFILES.filter(p => {
      if (filters.county && p.county !== filters.county) return false;
      if (p.age < filters.minAge || p.age > filters.maxAge) return false;
      if (filters.religion && p.religion !== filters.religion) return false;
      return true;
    }).map(p => p.id);
    store.set("tn_deck", deck);
    go("discover");
  };

  const pass = $("#pass");
  const like = $("#like");
  if (pass) pass.onclick = () => nextCard(false);
  if (like) like.onclick = () => nextCard(true);

  const cf = $("#chat-form");
  if (cf) cf.onsubmit = (e) => {
    e.preventDefault();
    const text = cf.text.value.trim();
    if (!text) return;
    const all = chats();
    const thread = all[chatId] || [];
    thread.push({ from: "me", text });
    all[chatId] = thread;
    store.set("tn_chats", all);
    cf.reset();
    render();
    setTimeout(() => {
      const all2 = chats();
      all2[chatId].push({ from: "them", text: "Nice. Let’s pick a spot in town this weekend." });
      store.set("tn_chats", all2);
      if (view === "chat") render();
    }, 700);
  };

  document.querySelectorAll("[data-report]").forEach(b => b.onclick = () => {
    if (confirm("Report this profile and hide the chat? (demo)")) {
      store.set("tn_matches", matches().filter(id => id !== b.dataset.report));
      go("matches");
    }
  });

  const geo = $("#geo");
  if (geo) geo.onclick = () => {
    if (!navigator.geolocation) { alert("Geolocation not supported"); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        store.set("tn_loc", { lat: pos.coords.latitude, lng: pos.coords.longitude });
        alert("Location saved on this device.");
        render();
      },
      () => alert("Location permission denied.")
    );
  };

  const logout = $("#logout");
  if (logout) logout.onclick = () => {
    localStorage.removeItem("tn_user");
    go("landing");
  };
}

render();
