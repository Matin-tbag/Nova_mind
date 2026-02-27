let chats = JSON.parse(localStorage.getItem("nova_pro_v1")) || [];
let curId = null;
let comfort = false;

window.onload = () => {
    renderH();
    if (chats.length > 0) loadChat(chats[0].id); else newChat();
    document.getElementById("ui").onkeypress = e => { if(e.key==="Enter") send(); }
};

function toggleS() {
    document.getElementById("sidebar").classList.toggle("active");
    document.getElementById("overlay").classList.toggle("active");
}

function toggleM(id) {
    const m = document.getElementById(id);
    const isS = m.classList.contains("show");
    document.querySelectorAll(".drop-menu").forEach(d => d.classList.remove("show"));
    if(!isS) m.classList.add("show");
}

function setT(t) {
    document.body.className = "theme-" + t;
    localStorage.setItem("nova_theme", t);
}

function updateKey() {
    const k = prompt("Enter OpenRouter API Key:");
    if(k) { localStorage.setItem("nova_key", k); alert("Key Saved!"); }
}

function save() { localStorage.setItem("nova_pro_v1", JSON.stringify(chats)); }

async function send() {
    const inp = document.getElementById("ui"), txt = inp.value.trim(), key = localStorage.getItem("nova_key");
    if(!txt) return;
    if(!key) { updateKey(); return; }

    if(!curId) newChat();
    addM(txt, "user");
    inp.value = "";

    const tid = "ai-" + Date.now();
    addM("Thinking...", "ai", tid);

    try {
        const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: { "Authorization": `Bearer ${key}`, "Content-Type": "application/json" },
            body: JSON.stringify({
                model: "google/gemini-2.0-flash-001",
                messages: [{role: "user", content: txt}]
            })
        });
        const data = await res.json();
        const ans = data.choices[0].message.content;
        document.getElementById(tid).innerHTML = marked.parse(ans);
        
        let s = chats.find(x => x.id === curId);
        s.msgs.push({ u: txt, a: ans });
        save();
    } catch (e) { document.getElementById(tid).innerText = "Error: Check Key/Internet"; }
}

function addM(t, r, id) {
    const b = document.getElementById("chat-box");
    const d = document.createElement("div");
    d.className = "msg " + r;
    if(id) d.id = id;
    d.innerHTML = (r === "ai" && t !== "Thinking...") ? marked.parse(t) : t;
    b.appendChild(d);
    b.scrollTop = b.scrollHeight;
}

function newChat() {
    curId = Date.now();
    chats.unshift({ id: curId, name: "Chat " + (chats.length+1), msgs: [] });
    document.getElementById("chat-box").innerHTML = "";
    addM("Hello! Nova Pro is ready.", "ai");
    renderH();
    save();
}

function renderH(f = "") {
    const l = document.getElementById("h-list");
    l.innerHTML = "";
    chats.filter(c => c.name.toLowerCase().includes(f.toLowerCase())).forEach((c, i) => {
        const d = document.createElement("div");
        d.className = "h-item";
        d.innerHTML = `<span onclick="loadChat(${c.id})">💬 ${c.name}</span> <button onclick="delChat(event, ${i})" style="background:none; border:none; color:red; cursor:pointer">X</button>`;
        l.appendChild(d);
    });
}

function loadChat(id) {
    curId = id;
    const c = chats.find(x => x.id === id);
    document.getElementById("chat-box").innerHTML = "";
    c.msgs.forEach(m => { addM(m.u, "user"); addM(m.a, "ai"); });
    if(window.innerWidth < 768) toggleS();
}

function delChat(e, i) {
    e.stopPropagation();
    if(confirm("Delete Chat?")) { chats.splice(i, 1); save(); renderH(); newChat(); }
}

function toggleComfort() {
    comfort = !comfort;
    document.body.classList.toggle("comfort-active", comfort);
    document.getElementById("cm-btn").innerText = "💖 Comfort Mode: " + (comfort ? "ON" : "OFF");
}

function genImg() { alert("Image Module: Coming Soon!"); }
function genVid() { alert("Video Module: Coming Soon!"); }
