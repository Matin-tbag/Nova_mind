let chats = JSON.parse(localStorage.getItem("nova_v9")) || [];
let curId = null;

window.onload = () => {
    if (chats.length > 0) loadChat(chats[0].id); else newChat();
    renderH();
    document.getElementById("ui").onkeypress = e => { if(e.key === "Enter") send(); };
};

async function send() {
    const inp = document.getElementById("ui"), txt = inp.value.trim(), key = localStorage.getItem("nova_key");
    if (!txt) return;
    if (!key) { alert("Please set your API Key in Settings ⚙️"); return; }

    addM(txt, "user");
    inp.value = "";
    const tid = "ai-" + Date.now();
    addM("...", "ai", tid);

    try {
        const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${key}`,
                "Content-Type": "application/json",
                "HTTP-Referer": window.location.origin,
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
        document.getElementById(tid).innerText = "Error: Check Key or Connection.";
    }
}

function addM(t, r, id) {
    const b = document.getElementById("chat-box");
    const d = document.createElement("div");
    d.className = `msg ${r}`;
    if(id) d.id = id;
    d.innerHTML = (r === "ai" && t !== "...") ? marked.parse(t) : t;
    b.appendChild(d);
    // اسکرول خودکار به آخرین پیام
    b.scrollTo({ top: b.scrollHeight, behavior: 'smooth' });
}

function saveChat(u, a) {
    if(!curId) {
        curId = Date.now();
        chats.unshift({ id: curId, name: u.substring(0, 15), msgs: [] });
    }
    let s = chats.find(x => x.id === curId);
    if(s) s.msgs.push({ u, a });
    localStorage.setItem("nova_v9", JSON.stringify(chats));
    renderH();
}

function loadChat(id) {
    curId = id;
    const c = chats.find(x => x.id === id);
    const box = document.getElementById("chat-box");
    box.innerHTML = "";
    if(c) c.msgs.forEach(m => { addM(m.u, "user"); addM(m.a, "ai"); });
    toggleS(false);
}

function renderH() {
    const l = document.getElementById("h-list");
    l.innerHTML = chats.map(c => `
        <div style="padding:10px; font-size:13px; cursor:pointer; border-bottom:1px solid #222" onclick="loadChat(${c.id})">
            💬 ${c.name}
        </div>
    `).join("");
}

function newChat() { curId = null; document.getElementById("chat-box").innerHTML = ""; addM("Hello, I'm Nova. How can I help?", "ai"); }

function toggleS(f) { 
    const s = document.getElementById("sidebar"), o = document.getElementById("overlay");
    if(f === false) { s.classList.remove("active"); o.classList.remove("active"); }
    else { s.classList.toggle("active"); o.classList.toggle("active"); }
}

function toggleM(id) {
    const m = document.getElementById(id);
    m.classList.toggle("show");
}

function updateKey() {
    const k = prompt("Enter OpenRouter API Key:");
    if(k) { localStorage.setItem("nova_key", k); alert("Key Saved!"); location.reload(); }
}
