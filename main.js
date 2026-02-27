// ==========================
// Nova Mind - Full Main JS
// ==========================

let chats = JSON.parse(localStorage.getItem("nova_data")) || [];
let curId = null;

// ==========================
// Sidebar
// ==========================

function toggleS() {
  document.getElementById("sidebar").classList.toggle("active");
}

function renderH(search = "") {
  const list = document.getElementById("h-list");
  list.innerHTML = "";

  chats
    .filter(c => c.name.toLowerCase().includes(search.toLowerCase()))
    .forEach(c => {
      const div = document.createElement("div");
      div.style.padding = "10px";
      div.style.cursor = "pointer";
      div.style.borderBottom = "1px solid #222";
      div.innerHTML = `
        <span onclick="loadChat(${c.id})">${c.name}</span>
        <span style="float:right;color:red;cursor:pointer"
          onclick="deleteChat(${c.id});event.stopPropagation();">✖</span>
      `;
      list.appendChild(div);
    });
}

function loadChat(id) {
  curId = id;
  const chat = chats.find(c => c.id === id);
  const box = document.getElementById("chat-box");
  box.innerHTML = "";

  chat.msgs.forEach(m => {
    addM(m.u, "user", false);
    addM(m.a, "ai", false);
  });

  toggleS();
}

function deleteChat(id) {
  chats = chats.filter(c => c.id !== id);
  save();
  renderH();
  if (curId === id) {
    curId = null;
    document.getElementById("chat-box").innerHTML = "";
  }
}

// ==========================
// Chat Management
// ==========================

function newChat() {
  curId = Date.now();
  chats.unshift({
    id: curId,
    name: "Chat " + (chats.length + 1),
    msgs: []
  });
  save();
  renderH();
  document.getElementById("chat-box").innerHTML = "";
}

function save() {
  localStorage.setItem("nova_data", JSON.stringify(chats));
}

// ==========================
// Send Message
// ==========================

async function send() {
  const inp = document.getElementById("ui");
  const txt = inp.value.trim();
  if (!txt) return;

  if (!curId) newChat();

  addM(txt, "user");
  inp.value = "";

  const session = chats.find(x => x.id === curId);

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo",
        messages: [{ role: "user", content: txt }]
      })
    });

    const data = await res.json();

    if (data.choices && data.choices.length > 0) {
      const ans = data.choices[0].message.content;
      addM(ans, "ai");
      session.msgs.push({ u: txt, a: ans });
      save();
      renderH();
    } else {
      addM("⚠ API Error", "ai");
    }

  } catch (err) {
    addM("🚨 Server Error", "ai");
  }
}

// ==========================
// Add Message
// ==========================

function addM(text, role, scroll = true) {
  const box = document.getElementById("chat-box");
  const div = document.createElement("div");
  div.className = "msg " + role;
  div.innerHTML = marked.parse(text);
  box.appendChild(div);
  if (scroll) box.scrollTop = box.scrollHeight;
}

// ==========================
// Theme & Comfort
// ==========================

function setT(theme) {
  document.body.className = "";
  if (theme !== "default") {
    document.body.classList.add("theme-" + theme);
  }
}

function toggleComfort() {
  document.body.classList.toggle("comfort-active");
  const btn = document.getElementById("cm-btn");
  if (document.body.classList.contains("comfort-active")) {
    btn.innerText = "💖 Comfort Mode: ON";
  } else {
    btn.innerText = "💖 Comfort Mode: OFF";
  }
}

// ==========================
// Dropdown
// ==========================

function toggleM(id) {
  document.querySelectorAll(".drop-menu").forEach(m => {
    if (m.id !== id) m.classList.remove("show");
  });
  document.getElementById(id).classList.toggle("show");
}

window.addEventListener("click", e => {
  if (!e.target.closest(".btn-icon")) {
    document.querySelectorAll(".drop-menu")
      .forEach(m => m.classList.remove("show"));
  }
});

// ==========================
// Enter Key
// ==========================

document.getElementById("ui").addEventListener("keydown", e => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    send();
  }
});

// ==========================
// Init
// ==========================

renderH();
