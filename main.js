let chats = JSON.parse(localStorage.getItem("nova_v7")) || [];
let curId = null;

window.onload = () => {
    if (chats.length > 0) loadChat(chats[0].id); else newChat();
    renderH();
    document.getElementById("ui").addEventListener("keypress", e => { if(e.key === "Enter") send(); });
};

function showNotif(msg) {
    const n = document.getElementById("notif");
    n.innerText = msg; n.style.display = "block";
    setTimeout(() => n.style.display = "none", 2500);
}

function updateKey() {
    const k = prompt("Enter OpenRouter API Key:");
    if(k) { localStorage.setItem("nova_key", k); showNotif("API Key Updated ✅"); }
}

async function send() {
    const inp = document.getElementById("ui"), txt = inp.value.trim(), key = localStorage.getItem("nova_key");
    if (!txt) return;
    if (!key) { showNotif("Please set API Key first! 🔑"); return; }

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
                "HTTP-Referer": window.location.origin, // برای OpenRouter الزامی است
                "X-Title": "Nova Mind"
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
        document.getElementById(tid).innerText = "Connection error. Please check your Key.";
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
    s.msgs.push({ u, a });
    localStorage.setItem("nova_v7", JSON.stringify(chats));
    renderH();
}

function renderH() {
    const l = document.getElementById("h-list");
    l.innerHTML = chats.map((c, i) => `
        <div class="h-item" style="display:flex; justify-content:space-between; padding:10px; cursor:pointer">
            <span onclick="loadChat(${c.id})">💬 ${c.name}</span>
            <span onclick="delChat(${i})" style="color:red">×</span>
        </div>
    `).join("");
}

function loadChat(id) {
    curId = id;
    const c = chats.find(x => x.id === id);
    document.getElementById("chat-box").innerHTML = "";
    c.msgs.forEach(m => { addM(m.u, "user"); addM(m.a, "ai"); });
    toggleS(false);
}

function delChat(i) {
    chats.splice(i, 1);
    localStorage.setItem("nova_v7", JSON.stringify(chats));
    renderH();
    newChat();
}

function newChat() {
    curId = null;
    document.getElementById("chat-box").innerHTML = "";
    addM("Hello, I'm Nova. How can I help you?", "ai");
}

function toggleS(force) {
    const s = document.getElementById("sidebar"), o = document.getElementById("overlay");
    if (force === false) { s.classList.remove("active"); o.classList.remove("active"); }
    else { s.classList.toggle("active"); o.classList.toggle("active"); }
}

function toggleM(id) {
    const m = document.getElementById(id);
    const isS = m.classList.contains("show");
    document.querySelectorAll(".drop-up").forEach(d => d.classList.remove("show"));
    if(!isS) m.classList.add("show");
}
