let chats = JSON.parse(localStorage.getItem("nova_data")) || [];
let curId = null;
let comfortMode = false;

// اولویت اول: اجرای کدهای ظاهری بلافاصله بعد از لود صفحه
window.onload = () => {
    renderH();
    if (chats.length > 0) loadChat(chats[0].id);
    else newChat();
    
    document.getElementById("ui").onkeypress = e => { if (e.key === "Enter") send(); }
};

function toggleS() {
    document.getElementById("sidebar").classList.toggle("active");
    document.getElementById("overlay").classList.toggle("active");
}

function toggleM(id) {
    const m = document.getElementById(id);
    const isOpen = m.classList.contains("show");
    document.querySelectorAll(".drop-menu").forEach(x => x.classList.remove("show"));
    if (!isOpen) m.classList.add("show");
}

function updateKey() {
    const k = prompt("Enter OpenRouter API Key:");
    if (k) {
        localStorage.setItem("nova_api_key", k);
        alert("API Key Saved!");
    }
}

async function send() {
    const inp = document.getElementById("ui"), txt = inp.value.trim();
    const API_KEY = localStorage.getItem("nova_api_key");

    if (!txt) return;
    if (!API_KEY) { 
        updateKey(); 
        return; 
    }

    if (!curId) newChat();
    addM(txt, "user");
    inp.value = "";

    const tid = "ai-" + Date.now();
    addM("Thinking...", "ai", tid);

    try {
        const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${API_KEY}`,
                "Content-Type": "application/json",
                "HTTP-Referer": window.location.origin,
            },
            body: JSON.stringify({
                model: "google/gemini-2.0-flash-001",
                messages: [{role: "user", content: txt}]
            })
        });

        const data = await res.json();
        const answer = data.choices[0].message.content;
        
        document.getElementById(tid).innerHTML = marked.parse(answer);
        
        // ذخیره در تاریخچه
        let session = chats.find(x => x.id === curId);
        session.msgs.push({ u: txt, a: answer });
        localStorage.setItem("nova_data", JSON.stringify(chats));
        
    } catch (e) {
        document.getElementById(tid).innerText = "Error! Please check your API Key in settings (Gear icon).";
    }
}

function addM(t, r, id) {
    const b = document.getElementById("chat-box");
    const d = document.createElement("div");
    d.className = "msg " + (r === "user" ? "user" : "ai");
    if (id) d.id = id;
    d.innerHTML = (r === "ai" && t !== "Thinking...") ? marked.parse(t) : t;
    b.appendChild(d);
    b.scrollTop = b.scrollHeight;
}

function newChat() {
    curId = Date.now();
    chats.unshift({ id: curId, name: "Chat " + (chats.length + 1), msgs: [] });
    document.getElementById("chat-box").innerHTML = "";
    addM("Hello! I am Nova. How can I help you?", "ai");
    renderH();
}

function renderH(f = "") {
    const l = document.getElementById("h-list");
    l.innerHTML = "";
    chats.filter(x => x.name.toLowerCase().includes(f.toLowerCase())).forEach((x, i) => {
        const div = document.createElement("div");
        div.style.padding = "10px";
        div.style.cursor = "pointer";
        div.style.borderBottom = "1px solid #333";
        div.innerHTML = `<span onclick="loadChat(${x.id})">💬 ${x.name}</span>`;
        l.appendChild(div);
    });
}

function loadChat(id) {
    curId = id;
    const c = chats.find(x => x.id === id);
    document.getElementById("chat-box").innerHTML = "";
    c.msgs.forEach(m => { addM(m.u, "user"); addM(m.a, "ai"); });
}

function setT(t) {
    document.body.className = (t === 'default') ? '' : "theme-" + t;
    document.querySelectorAll(".drop-menu").forEach(x => x.classList.remove("show"));
}
