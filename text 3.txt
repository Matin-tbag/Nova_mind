let chats = JSON.parse(localStorage.getItem("nova_final_v6")) || [];
let curId = null;
let comfortMode = false;
const models = ["google/gemini-2.0-flash-001", "openai/gpt-3.5-turbo"];

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

function setT(t) {
    document.body.className = (t === 'default') ? '' : "theme-" + t;
    document.querySelectorAll(".drop-menu").forEach(x => x.classList.remove("show"));
    showNotif("تم تغییر کرد");
}

function showNotif(msg) {
    const n = document.getElementById("notif");
    n.innerText = msg;
    n.style.display = "block";
    setTimeout(() => { n.style.display = "none"; }, 1500);
}

// تنظیم کلید API به صورت امن
function promptApiKey() {
    const key = prompt("لطفاً کلید OpenRouter خود را وارد کنید:", localStorage.getItem("nova_api_key") || "");
    if (key) {
        localStorage.setItem("nova_api_key", key);
        showNotif("کلید با موفقیت ذخیره شد");
    }
}

function newChat() {
    curId = Date.now();
    const newSession = { id: curId, name: "گفتگو جدید " + (chats.length + 1), msgs: [] };
    chats.unshift(newSession);
    save();
    document.getElementById("chat-box").innerHTML = "";
    addM("سلام! من نووا هستم. چطور می‌توانم کمکتان کنم؟", "ai");
    renderH();
}

function save() { localStorage.setItem("nova_final_v6", JSON.stringify(chats)); }

async function send() {
    const key = localStorage.getItem("nova_api_key");
    if (!key) {
        showNotif("ابتدا کلید API را وارد کنید (آیکون کلید بالای صفحه)");
        promptApiKey();
        return;
    }

    const inp = document.getElementById("ui"), btn = document.getElementById("sb"), txt = inp.value.trim();
    if (!txt || btn.disabled) return;
    if (!curId) newChat();

    addM(txt, "user");
    inp.value = "";
    btn.disabled = true;

    let session = chats.find(x => x.id === curId);
    const tid = "ai-" + Date.now();
    addM("...", "ai", tid);

    let answer = "";
    for (let model of models) {
        try {
            const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${key}`,
                },
                body: JSON.stringify({ model, messages: [{ role: "user", content: txt }] })
            });
            const data = await res.json();
            if (data.choices && data.choices[0].message.content) {
                answer = data.choices[0].message.content;
                const aiDiv = document.getElementById(tid);
                aiDiv.innerHTML = marked.parse(answer);
                session.msgs.push({ u: txt, a: answer });
                save();
                break;
            }
        } catch (e) { console.error("Error", e); }
    }

    if (!answer) document.getElementById(tid).innerText = "خطا! احتمالاً کلید اشتباه است یا اعتبار ندارید.";
    btn.disabled = false;
    document.getElementById("chat-box").scrollTop = document.getElementById("chat-box").scrollHeight;
}

function addM(t, r, id) {
    const b = document.getElementById("chat-box");
    const d = document.createElement("div");
    d.className = "msg " + (r === "user" ? "user" : "ai");
    if (id) d.id = id;
    if (r === "ai" && t !== "...") d.innerHTML = marked.parse(t);
    else d.innerText = t;
    b.appendChild(d);
    b.scrollTop = b.scrollHeight;
}

function renderH(f = "") {
    const l = document.getElementById("h-list");
    l.innerHTML = "";
    chats.filter(x => x.name.toLowerCase().includes(f.toLowerCase())).forEach((x, i) => {
        const div = document.createElement("div");
        div.className = "h-item";
        div.innerHTML = `<span onclick="loadChat(${x.id})">💬 ${x.name}</span>
            <div class="h-btns"><button onclick="delH(event,${i})">🗑️</button></div>`;
        l.appendChild(div);
    });
}

function loadChat(id) {
    curId = id;
    const c = chats.find(x => x.id === id);
    if (!c) return;
    document.getElementById("chat-box").innerHTML = "";
    c.msgs.forEach(m => { addM(m.u, "user"); addM(m.a, "ai"); });
    if(document.getElementById("sidebar").classList.contains("active")) toggleS();
}

function delH(e, i) {
    e.stopPropagation();
    if (confirm("حذف شود؟")) {
        chats.splice(i, 1);
        save();
        renderH();
        document.getElementById("chat-box").innerHTML = "";
    }
}

function toggleComfort() {
    comfortMode = !comfortMode;
    document.body.classList.toggle("comfort-active", comfortMode);
    document.getElementById("cm-btn").innerText = "💖 حالت راحتی: " + (comfortMode ? "روشن" : "خاموش");
}

function generateImage() { showNotif("بزودی..."); }
function generateVideo() { showNotif("بزودی..."); }

document.getElementById("ui").onkeypress = (e) => { if (e.key === "Enter") send(); }
renderH();
if (chats.length > 0) loadChat(chats[0].id); else newChat();
