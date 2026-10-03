// Kenya Global Glovo Meals - front-end only demo (data saved in localStorage)
const PFX = "KGM";
const $ = (s) => document.querySelector(s),
  $$ = (s) => [...document.querySelectorAll(s)];
const CATS = [
  "All",
  "Burgers",
  "Pizza",
  "Chicken",
  "Kenyan",
  "Sides",
  "Drinks",
  "Desserts",
];
const AREAS = {
  CBD: 100,
  Westlands: 150,
  Kilimani: 150,
  Eastleigh: 180,
  Kasarani: 220,
  Embakasi: 250,
  Karen: 300,
  Rongai: 350,
};
const PROMOS = { GLOVO10: { p: 10 }, WELCOME20: { p: 20 }, FOOD50: { f: 50 } };
const ST = ["Order Confirmed", "Preparing", "Out for Delivery", "Delivered"];
const M = (id, n, cat, e, d, price, r, t, veg = 0, pop = 50) => ({
  id,
  n,
  cat,
  e,
  d,
  price,
  r,
  rc: 20,
  t,
  veg,
  pop,
  on: 1,
});
const DEF = [
  M(
    1,
    "Classic Beef Burger",
    "Burgers",
    "🍔",
    "Beef patty, cheese, lettuce & special sauce",
    450,
    4.8,
    15,
    0,
    95,
  ),
  M(
    2,
    "Veggie Cheese Burger",
    "Burgers",
    "🍔",
    "Bean patty, cheese & fresh salad",
    380,
    4.4,
    15,
    1,
    60,
  ),
  M(
    3,
    "Chicken Pizza",
    "Pizza",
    "🍕",
    "Grilled chicken, peppers & mozzarella",
    850,
    4.7,
    25,
    0,
    85,
  ),
  M(
    4,
    "Margherita Pizza",
    "Pizza",
    "🍕",
    "Tomato, basil & mozzarella",
    700,
    4.5,
    25,
    1,
    70,
  ),
  M(
    5,
    "Crispy Chicken Bucket",
    "Chicken",
    "🍗",
    "6 pieces of golden fried chicken",
    550,
    4.8,
    20,
    0,
    92,
  ),
  M(
    6,
    "Peri-Peri Wings",
    "Chicken",
    "🍗",
    "Spicy grilled wings with dip",
    480,
    4.6,
    20,
    0,
    75,
  ),
  M(
    7,
    "Nyama Choma Platter",
    "Kenyan",
    "🥩",
    "Roast goat with kachumbari & ugali",
    900,
    4.9,
    30,
    0,
    98,
  ),
  M(
    8,
    "Pilau Beef",
    "Kenyan",
    "🍛",
    "Spiced rice with tender beef",
    400,
    4.7,
    20,
    0,
    88,
  ),
  M(
    9,
    "Chapati & Beans",
    "Kenyan",
    "🫓",
    "Soft chapati with bean stew",
    250,
    4.5,
    15,
    1,
    65,
  ),
  M(
    10,
    "Ugali & Sukuma Wiki",
    "Kenyan",
    "🥬",
    "Classic ugali with sautéed greens",
    300,
    4.3,
    15,
    1,
    55,
  ),
  M(
    11,
    "French Fries",
    "Sides",
    "🍟",
    "Crispy salted fries",
    200,
    4.4,
    10,
    1,
    80,
  ),
  M(
    12,
    "Fresh Passion Juice",
    "Drinks",
    "🥤",
    "Freshly squeezed, no added sugar",
    150,
    4.6,
    5,
    1,
    72,
  ),
  M(
    13,
    "Masala Chai",
    "Drinks",
    "☕",
    "Spiced Kenyan milk tea",
    120,
    4.5,
    5,
    1,
    58,
  ),
  M(
    14,
    "Chocolate Brownie",
    "Desserts",
    "🍫",
    "Warm fudge brownie",
    220,
    4.7,
    8,
    1,
    66,
  ),
  M(
    15,
    "Mandazi (6 pcs)",
    "Desserts",
    "🍩",
    "Fluffy coconut mandazi",
    100,
    4.6,
    8,
    1,
    74,
  ),
];
const LS = (k) => JSON.parse(localStorage.getItem("kgm_" + k) || "null");
const SV = (k, v) => localStorage.setItem("kgm_" + k, JSON.stringify(v));
let meals = LS("meals") || DEF,
  cart = LS("cart") || {},
  favs = LS("favs") || [],
  orders = LS("orders") || [];
let promo = LS("promo") || "",
  area = LS("area") || "CBD",
  cat = "All";
const save = () => {
  SV("meals", meals);
  SV("cart", cart);
  SV("favs", favs);
  SV("orders", orders);
  SV("promo", promo);
  SV("area", area);
};
const fmt = (n) => "KSh " + Math.round(n).toLocaleString();
const toast = (t) => {
  const d = document.createElement("div");
  d.textContent = t;
  $("#toasts").append(d);
  setTimeout(() => d.remove(), 3500);
};
const notify = (o) => toast("🔔 Order #" + o.id + ": " + ST[o.st]);

const card = (
  m,
) => `<article class="card${m.on ? "" : " off"}"><div class="img" style="--h:${(m.id * 47) % 360}">${m.e}
<button class="fav" data-act="fav" data-id="${m.id}">${favs.includes(m.id) ? "❤️" : "🤍"}</button>${m.veg ? '<i class="vg">VEG</i>' : ""}</div>
<div class="cb"><h3>${m.n}</h3><p>${m.d}</p><div class="meta">⭐ ${m.r.toFixed(1)} (${m.rc}) · ⏱ ${m.t} min</div>
<div class="row"><b>${fmt(m.price)}</b><button class="add" data-act="add" data-id="${m.id}" ${m.on ? "" : "disabled"}>${m.on ? "Add to Cart" : "Sold out"}</button></div></div></article>`;

function list() {
  const q = $("#q").value.toLowerCase(),
    mx = +$("#max").value;
  const l = meals.filter(
    (m) =>
      (cat == "All" || m.cat == cat) &&
      (!$("#veg").checked || m.veg) &&
      m.price <= mx &&
      (m.n + m.d).toLowerCase().includes(q),
  );
  const f = {
    price: (a, b) => a.price - b.price,
    rating: (a, b) => b.r - a.r,
    pop: (a, b) => b.pop - a.pop,
    name: (a, b) => a.n.localeCompare(b.n),
  }[$("#sort").value];
  return l.sort(f);
}
function renderMenu() {
  $("#cats").innerHTML = CATS.map(
    (c) =>
      `<button class="chip${c == cat ? " on" : ""}" data-act="cat" data-c="${c}">${c}</button>`,
  ).join("");
  $("#menu").innerHTML =
    list().map(card).join("") ||
    '<p class="mu">No meals match your filters.</p>';
  $("#pop").innerHTML = meals
    .filter((m) => m.on)
    .sort((a, b) => b.pop - a.pop)
    .slice(0, 4)
    .map(card)
    .join("");
  $("#favGrid").innerHTML =
    meals
      .filter((m) => favs.includes(m.id))
      .map(card)
      .join("") || '<p class="mu">Tap 🤍 on a meal to save it here.</p>';
  $("#maxv").textContent = $("#max").value;
}
const items = () =>
  Object.entries(cart)
    .map(([id, q]) => ({ m: meals.find((x) => x.id == id), q }))
    .filter((i) => i.m);
function totals() {
  const it = items(),
    sub = it.reduce((s, i) => s + i.m.price * i.q, 0),
    fee = sub ? AREAS[area] : 0,
    p = PROMOS[promo];
  const disc =
    !p || !sub ? 0 : p.p ? Math.round((sub * p.p) / 100) : Math.min(p.f, sub);
  return { it, sub, fee, disc, total: sub + fee - disc };
}
function renderCart() {
  const t = totals();
  $("#cnt").textContent = t.it.reduce((s, i) => s + i.q, 0);
  $("#cartItems").innerHTML =
    t.it
      .map(
        ({
          m,
          q,
        }) => `<div class="ci"><span class="em">${m.e}</span><div><b>${m.n}</b><br>${fmt(m.price)}</div>
<div class="qty"><button data-act="dec" data-id="${m.id}">−</button>${q}<button data-act="inc" data-id="${m.id}">+</button></div><button data-act="del" data-id="${m.id}">🗑</button></div>`,
      )
      .join("") || '<p class="mu">Your cart is empty.</p>';
  $("#area").value = area;
  $("#totals").innerHTML =
    `<div><span>Subtotal</span><span>${fmt(t.sub)}</span></div><div><span>Delivery (${area})</span><span>${fmt(t.fee)}</span></div>
<div><span>Discount${promo ? " (" + promo + ")" : ""}</span><span>−${fmt(t.disc)}</span></div><div class="tot"><span>Total</span><span>${fmt(t.total)}</span></div>`;
}
function renderOrders() {
  $("#orderList").innerHTML =
    orders
      .slice()
      .reverse()
      .map(
        (
          o,
        ) => `<div class="ord"><h3>Order #${o.id} <small>${new Date(o.t).toLocaleString()}</small></h3>
<p>${o.items.map((i) => `${i.n} × ${i.q}`).join("<br>")}</p><p><b>Total: ${fmt(o.total)}</b> · ${o.pay} · ${o.area}</p>
<div class="track">${ST.map((s, i) => `<span class="${i <= o.st ? "done" : ""}">${i <= o.st ? "✓" : "○"} ${s}</span>`).join("")}</div>
${o.st == 3 && !o.rated ? `<div class="rate">Rate your meal: ${[1, 2, 3, 4, 5].map((n) => `<button data-act="rate" data-o="${o.id}" data-n="${n}">⭐${n}</button>`).join("")}</div>` : ""}</div>`,
      )
      .join("") ||
    '<p class="mu">No orders yet. Your orders will appear here.</p>';
}
function renderAdmin() {
  const day = new Date().toDateString(),
    td = orders.filter((o) => new Date(o.t).toDateString() == day),
    sales = {};
  orders.forEach((o) =>
    o.items.forEach((i) => (sales[i.n] = (sales[i.n] || 0) + i.p * i.q)),
  );
  const top = Object.entries(sales)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6),
    mx = top[0] ? top[0][1] : 1;
  $("#stats").innerHTML = [
    ["Today's Orders", td.length],
    ["Today's Revenue", fmt(td.reduce((s, o) => s + o.total, 0))],
    ["Customers", new Set(orders.map((o) => o.phone)).size],
    ["Menu Items", meals.length],
  ]
    .map(([a, b]) => `<div class="stat"><small>${a}</small><b>${b}</b></div>`)
    .join("");
  $("#chart").innerHTML =
    top
      .map(
        ([n, v]) =>
          `<div class="br"><span>${n}</span><i style="width:${(v / mx) * 100}%"></i><em>${fmt(v)}</em></div>`,
      )
      .join("") || '<p class="mu">No sales yet. Place an order first.</p>';
  $("#adminOrders").innerHTML =
    orders
      .slice()
      .reverse()
      .map(
        (
          o,
        ) => `<div class="ord"><b>#${o.id}</b> ${o.name} · ${fmt(o.total)}<div class="am">
${ST.map((s, i) => `<button class="chip${o.st == i ? " on" : ""}" data-act="st" data-o="${o.id}" data-n="${i}">${s}</button>`).join("")}</div></div>`,
      )
      .join("") || '<p class="mu">No orders yet.</p>';
  $("#adminMenu").innerHTML =
    '<p><button class="add" data-act="newmeal">+ Add meal</button></p>' +
    meals
      .map(
        (m) => `<div class="ord am">${m.e} <b>${m.n}</b> ${fmt(m.price)}
<button data-act="price" data-id="${m.id}">Edit price</button><button data-act="avail" data-id="${m.id}">${m.on ? "Mark sold out" : "Make available"}</button></div>`,
      )
      .join("");
}
function refresh() {
  renderMenu();
  renderCart();
  renderOrders();
  renderAdmin();
  save();
}
function view(v) {
  $$(".view").forEach((s) => (s.hidden = s.id != v));
  $("nav").classList.remove("open");
  scrollTo(0, 0);
}
function info() {
  const d = new Date(),
    h = d.getHours() + d.getMinutes() / 60,
    wk = d.getDay() % 6 != 0,
    [o, c] = wk ? [8, 22] : [9, 23],
    open = h >= o && h < c;
  $("#info").innerHTML =
    `<span class="${open ? "open" : "shut"}">${open ? "🟢 Open now" : "🔴 Closed"}</span> · Mon-Fri 8AM-10PM · Sat-Sun 9AM-11PM · 📍 Nairobi, Kenya · 📞 +254 700 000 000`;
}

document.addEventListener("click", (e) => {
  const b = e.target.closest("[data-act],[data-v]");
  if (!b) return;
  if (b.dataset.v) return view(b.dataset.v);
  const a = b.dataset.act,
    id = +b.dataset.id,
    m = meals.find((x) => x.id == id),
    o = orders.find((x) => x.id == b.dataset.o);
  if (a == "add") {
    cart[id] = (cart[id] || 0) + 1;
    toast(m.e + " " + m.n + " added to cart");
  }
  if (a == "inc") cart[id]++;
  if (a == "dec" && --cart[id] < 1) delete cart[id];
  if (a == "del") delete cart[id];
  if (a == "fav")
    favs = favs.includes(id) ? favs.filter((x) => x != id) : [...favs, id];
  if (a == "cat") cat = b.dataset.c;
  if (a == "close") $("#drawer").classList.remove("open");
  if (a == "cancel") $("#modal").hidden = true;
  if (a == "code") {
    $("#promo").value = b.dataset.c;
    $("#drawer").classList.add("open");
  }
  if (a == "rate") {
    o.rated = 1;
    o.items.forEach((i) => {
      const x = meals.find((k) => k.id == i.id);
      if (x) {
        x.r = (x.r * x.rc + +b.dataset.n) / (x.rc + 1);
        x.rc++;
      }
    });
    toast("Thanks for your review! ⭐");
  }
  if (a == "st") {
    o.st = +b.dataset.n;
    o.manual = 1;
    notify(o);
  }
  if (a == "avail") m.on = m.on ? 0 : 1;
  if (a == "price") {
    const p = +prompt("New price (KSh) for " + m.n, m.price);
    if (p > 0) m.price = p;
  }
  if (a == "newmeal") {
    const n = prompt("Meal name?"),
      p = +prompt("Price (KSh)?");
    if (n && p > 0)
      meals.push({
        id: Date.now() % 1e8,
        n,
        cat: "Sides",
        e: "🍽️",
        d: "New on the menu",
        price: p,
        r: 4.5,
        rc: 1,
        t: 20,
        veg: 0,
        pop: 10,
        on: 1,
      });
  }
  refresh();
});
["#q", "#sort", "#veg", "#max"].forEach((s) =>
  $(s).addEventListener("input", renderMenu),
);
$("#cartBtn").onclick = () => $("#drawer").classList.toggle("open");
$("#order").onclick = () => $(".tools").scrollIntoView({ behavior: "smooth" });
$("#burger").onclick = () => $("nav").classList.toggle("open");
$("#dark").onclick = () => {
  document.body.classList.toggle("dark");
  SV("dark", document.body.classList.contains("dark"));
};
$("#area").onchange = (e) => {
  area = e.target.value;
  refresh();
};
$("#apply").onclick = () => {
  const c = $("#promo").value.trim().toUpperCase();
  if (PROMOS[c]) {
    promo = c;
    toast("🎟️ Promo applied!");
  } else {
    promo = "";
    toast("Invalid promo code");
  }
  refresh();
};
$("#checkout").onclick = () => {
  if (!totals().sub) return toast("Your cart is empty");
  $("#modal").hidden = false;
};
$("#form").onsubmit = (e) => {
  e.preventDefault();
  const f = new FormData(e.target),
    t = totals();
  const o = {
    id: PFX + (1001 + orders.length),
    t: Date.now(),
    items: t.it.map((i) => ({ id: i.m.id, n: i.m.n, p: i.m.price, q: i.q })),
    name: f.get("name"),
    phone: f.get("phone"),
    email: f.get("email"),
    area,
    notes: f.get("notes"),
    pay: f.get("pay"),
    sub: t.sub,
    fee: t.fee,
    disc: t.disc,
    total: t.total,
    st: 0,
  };
  orders.push(o);
  cart = {};
  promo = "";
  $("#promo").value = "";
  e.target.reset();
  $("#modal").hidden = true;
  $("#drawer").classList.remove("open");
  toast(
    o.pay == "M-Pesa"
      ? "📱 M-Pesa prompt sent (simulated)"
      : "✅ Order placed!",
  );
  notify(o);
  view("orders");
  refresh();
};
// Simulated order tracking: each stage takes about 20 seconds
setInterval(() => {
  let ch = 0;
  orders.forEach((o) => {
    if (o.manual || o.st > 2) return;
    const s = Math.min(3, Math.floor((Date.now() - o.t) / 20000));
    if (s > o.st) {
      o.st = s;
      notify(o);
      ch = 1;
    }
  });
  if (ch) refresh();
}, 4000);

$("#area").innerHTML = Object.entries(AREAS)
  .map(([a, f]) => `<option value="${a}">${a} (${fmt(f)})</option>`)
  .join("");
if (LS("dark")) document.body.classList.add("dark");
info();
refresh();
