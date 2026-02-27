let chats = JSON.parse(localStorage.getItem("nova_v10")) || [];
let curId = null;

window.onload = () => {
    if (chats.length > 0) loadChat(chats[0].id); else newChat();
    renderH();
    document.getElementById("ui").onkeypress = e => { if(e.key === "Enter") send(); };
};

function toggleMenu(id) {
    const m = document.getElementById(id);
    const isS = m.classList.contains("show");
    document.querySelectorAll(".dropdown").forEach(d => d.classList.remove("show"));
    if(!isS) m.classList.add("show");
}

async function send() {
    const inp = document.getElementById("ui"), txt = inp.value.trim(), key = localStorage.getItem("nova_key");
    if (!txt) return;
    if (!key) { alert("Set API Key in Settings ⚙️"); return; }

    addM(txt, "user");
    inp.value = "";
    const tid = "ai-" + Date.now();
    addM("● ● ●", "ai", tid);

    try {
        const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${key}`,
                "Content-Type": "application/json",
                "HTTP-Referer": window.location.origin
            },
            body: JSON.stringify({
                model: "google/gemini-2.0-flash-001",
                messages: [{ role: "user", content: txt }]
            })
        });
        const data = await res.json();
        const ans = data.choices[0].message.content;
        document.getElementById(tid).innerHTML = marked.parse(ans);
        saveChat(txt, ans);
    } catch (e) {
        document.getElementById(tid).innerText = "Error: Check Key or Connection.";
    }
}

function addM(t, r, id) {
    const b = document.getElementById("chat-box");
    const d = document.createElement("div");
    d.className = `msg ${r}`;
    if(id) d.id = id;
    d.innerHTML = (r === "ai" && t !== "● ● ●") ? marked.parse(t) : t;
    b.appendChild(d);
    b.scrollTop = b.scrollHeight;
}

function saveChat(u, a) {
    if(!curId) {
        curId = Date.now();
        chats.unshift({ id: curId, name: u.substring(0, 20), msgs: [] });
    }
    let s = chats.find(x => x.id === curId);
    if(s) s.msgs.push({ u, a });
    localStorage.setItem("nova_v10", JSON.stringify(chats));
    renderH();
}

function renderH() {
    const l = document.getElementById("h-list");
    l.innerHTML = chats.map((c, i) => `
        <div class="history-item">
            <span onclick="loadChat(${c.id})">💬 ${c.name}</span>
            <span onclick="delChat(${i})" style="color:#ff4444; font-weight:bold">×</span>
        </div>
    `).join("");
}

function delChat(i) {
    if(confirm("Delete this chat?")) {
        chats.splice(i, 1);
        localStorage.setItem("nova_v10", JSON.stringify(chats));
        renderH();
        newChat();
    }
}

function loadChat(id) {
    curId = id;
    const c = chats.find(x => x.id === id);
    document.getElementById("chat-box").innerHTML = "";
    if(c) c.msgs.forEach(m => { addM(m.u, "user"); addM(m.a, "ai"); });
    toggleS(false);
}

function newChat() { curId = null; document.getElementById("chat-box").innerHTML = ""; addM("Hello, I'm Nova Mind. How can I help?", "ai"); }

function toggleS(f) { 
    const s = document.getElementById("sidebar"), o = document.getElementById("overlay");
    if(f === false) { s.classList.remove("active"); o.classList.remove("active"); }
    else { s.classList.toggle("active"); o.classList.toggle("active"); }
}

function updateKey() {
    const k = prompt("Enter OpenRouter API Key:");
    if(k) { localStorage.setItem("nova_key", k); alert("Key Saved!"); location.reload(); }
}

function setT(t) {
    document.body.className = "theme-" + t;
    localStorage.setItem("nova_theme_pref", t);
    document.querySelectorAll(".dropdown").forEach(d => d.classList.remove("show"));
}
