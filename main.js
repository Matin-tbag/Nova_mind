let chats = JSON.parse(localStorage.getItem("nova_data")) || [];
let curId = null;

// اجرای کدها بعد از لود کامل برای اطمینان از وجود دکمه‌ها
window.addEventListener('DOMContentLoaded', () => {
    renderH();
    if (chats.length > 0) loadChat(chats[0].id);
    else newChat();

    // هندل کردن اینتر
    document.getElementById("ui").addEventListener("keydown", (e) => {
        if (e.key === "Enter") send();
    });
});

function toggleS() {
    document.getElementById("sidebar").classList.toggle("active");
    document.getElementById("overlay").classList.toggle("active");
}

function toggleM(id) {
    const m = document.getElementById(id);
    const isShowing = m.classList.contains("show");
    document.querySelectorAll(".drop-menu").forEach(el => el.classList.remove("show"));
    if (!isShowing) m.classList.add("show");
}

function updateKey() {
    const k = prompt("Enter your OpenRouter API Key:");
    if (k) {
        localStorage.setItem("nova_api_key", k);
        alert("API Key updated successfully!");
    }
}

async function send() {
    const inp = document.getElementById("ui");
    const txt = inp.value.trim();
    const API_KEY = localStorage.getItem("nova_api_key");

    if (!txt) return;
    if (!API_KEY) {
        updateKey();
        return;
    }

    if (!curId) newChat();
    addM(txt, "user");
    inp.value = "";

    const tempId = "ai-" + Date.now();
    addM("Thinking...", "ai", tempId);

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${API_KEY}`,
                "Content-Type": "application/json",
                "HTTP-Referer": window.location.origin
            },
            body: JSON.stringify({
                model: "google/gemini-2.0-flash-001",
                messages: [{role: "user", content: txt}]
            })
        });

        const data = await response.json();
        const result = data.choices[0].message.content;
        
        document.getElementById(tempId).innerHTML = marked.parse(result);
        
        let session = chats.find(x => x.id === curId);
        session.msgs.push({ u: txt, a: result });
        localStorage.setItem("nova_data", JSON.stringify(chats));

    } catch (e) {
        document.getElementById(tempId).innerText = "Connection error. Check API Key.";
    }
}

function addM(t, r, id) {
    const box = document.getElementById("chat-box");
    const d = document.createElement("div");
    d.className = "msg " + r;
    if (id) d.id = id;
    d.innerHTML = (r === "ai" && t !== "Thinking...") ? marked.parse(t) : t;
    box.appendChild(d);
    box.scrollTop = box.scrollHeight;
}

function newChat() {
    curId = Date.now();
    chats.unshift({ id: curId, name: "Chat " + (chats.length + 1), msgs: [] });
    document.getElementById("chat-box").innerHTML = "";
    addM("Hello! I am Nova AI. How can I help you today?", "ai");
    renderH();
}

function renderH() {
    const l = document.getElementById("h-list");
    l.innerHTML = chats.map(c => `
        <div class="menu-item" onclick="loadChat(${c.id})" style="border:none; border-radius:5px; margin-bottom:5px;">
            💬 ${c.name}
        </div>
    `).join("");
}

function loadChat(id) {
    curId = id;
    const c = chats.find(x => x.id === id);
    if (!c) return;
    document.getElementById("chat-box").innerHTML = "";
    c.msgs.forEach(m => { addM(m.u, "user"); addM(m.a, "ai"); });
    if (window.innerWidth < 768) toggleS();
}
