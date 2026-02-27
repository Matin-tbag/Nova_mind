let chats = JSON.parse(localStorage.getItem("nova_v99")) || [];
let curId = null;

// کلید را از لوکال استوریج می‌گیریم
let MY_KEY = localStorage.getItem("nova_api_key") || "";

window.onload = () => {
    renderH();
    if (chats.length > 0) loadChat(chats[0].id); else newChat();
    document.getElementById("ui").onkeypress = (e) => { if(e.key === "Enter") send(); };
};

function updateAPIKey() {
    const k = prompt("Enter OpenRouter API Key:", MY_KEY);
    if (k !== null) {
        MY_KEY = k.trim();
        localStorage.setItem("nova_api_key", MY_KEY); // اینجا مستقیم سیو می‌شود
        showNotif("API Key Saved! ✅");
        toggleM('set-menu');
    }
}

async function send() {
    const inp = document.getElementById("ui"), btn = document.getElementById("sb"), txt = inp.value.trim();
    
    if (!txt || btn.disabled) return;
    if (!MY_KEY) { showNotif("Please set API Key first! ⚙️"); return; }

    addM(txt, "user");
    inp.value = "";
    btn.disabled = true;

    const tid = "ai-" + Date.now();
    addM("...", "ai", tid);

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${MY_KEY}`,
                "Content-Type": "application/json",
                "HTTP-Referer": window.location.origin,
                "X-Title": "Nova Mind"
            },
            body: JSON.stringify({
                model: "google/gemini-2.0-flash-001",
                messages: [{ role: "user", content: txt }]
            })
        });

        const data = await response.json();
        
        if (data.error) {
            document.getElementById(tid).innerText = "Error: " + data.error.message;
        } else {
            const answer = data.choices[0].message.content;
            document.getElementById(tid).innerHTML = marked.parse(answer);
            saveChat(txt, answer);
        }
    } catch (e) {
        document.getElementById(tid).innerText = "Connection Error. Try a VPN or check Key.";
    }
    btn.disabled = false;
}

// بقیه توابع (بدون تغییر)
function addM(t, r, id) {
    const b = document.getElementById("chat-box");
    const d = document.createElement("div");
    d.className = "msg " + r;
    if (id) d.id = id;
    d.innerHTML = (r === "ai" && t !== "...") ? marked.parse(t) : t;
    b.appendChild(d);
    b.scrollTop = b.scrollHeight;
}

function saveChat(u, a) {
    let s = chats.find(x => x.id === curId);
    if (!s) {
        s = { id: curId, name: u.substring(0, 20), msgs: [] };
        chats.unshift(s);
    }
    s.msgs.push({ u, a });
    localStorage.setItem("nova_v99", JSON.stringify(chats));
    renderH();
}

function loadChat(id) {
    curId = id;
    const c = chats.find(x => x.id === id);
    document.getElementById("chat-box").innerHTML = "";
    if (c) c.msgs.forEach(m => { addM(m.u, "user"); addM(m.a, "ai"); });
    if (document.getElementById("sidebar").classList.contains("active")) toggleS();
}

function renderH() {
    const l = document.getElementById("h-list");
    l.innerHTML = chats.map(c => `
        <div class="h-item" onclick="loadChat(${c.id})">
            <span class="h-title">💬 ${c.name}</span>
        </div>
    `).join("");
}

function newChat() {
    curId = Date.now();
    document.getElementById("chat-box").innerHTML = "";
    addM("Nova Mind: Hello! How can I help?", "ai");
    if (document.getElementById("sidebar").classList.contains("active")) toggleS();
}

function toggleS() { document.getElementById("sidebar").classList.toggle("active"); document.getElementById("overlay").classList.toggle("active"); }
function toggleM(id) { 
    const m = document.getElementById(id); 
    const isOpen = m.classList.contains("show"); 
    document.querySelectorAll(".drop-menu").forEach(x => x.classList.remove("show")); 
    if (!isOpen) m.classList.add("show"); 
}
function setT(t) { document.body.className = "theme-" + t; toggleM('theme-menu'); }
function showNotif(m) { const n = document.getElementById("notif"); n.innerText = m; n.style.display = "block"; setTimeout(() => n.style.display = "none", 2000); }
function toggleComfort() { document.body.classList.toggle("comfort"); toggleM('set-menu'); }
