let chats = JSON.parse(localStorage.getItem("nova_final_v7")) || [];
let curId = null;
let comfortMode = false;

window.onload = () => {
    renderH();
    // اگر از قبل چتی بود لود کن، وگرنه چت جدید بساز
    if (chats.length > 0) loadChat(chats[0].id); else newChat();
    
    // گوش دادن به اینتر برای ارسال پیام
    document.getElementById("ui").onkeypress = (e) => { if(e.key === "Enter") send(); };
};

// نمایش و مخفی سازی منوها و سایدبار
function toggleS(){
    document.getElementById("sidebar").classList.toggle("active");
    document.getElementById("overlay").classList.toggle("active");
}

function toggleM(id){
    const m = document.getElementById(id);
    const isOpen = m.classList.contains("show");
    document.querySelectorAll(".drop-menu").forEach(x => x.classList.remove("show"));
    if(!isOpen) m.classList.add("show");
}

// مدیریت تم‌ها
function setT(t){
    document.body.className = "theme-" + t;
    localStorage.setItem("nova_theme_pref", t);
    document.querySelectorAll(".drop-menu").forEach(x => x.classList.remove("show"));
}

function showNotif(msg){
    const n = document.getElementById("notif");
    n.innerText = msg; n.style.display = "block";
    setTimeout(() => { n.style.display = "none"; }, 1500);
}

// تنظیم کلید API
function updateAPIKey() {
    const key = prompt("Please enter your OpenRouter API Key:");
    if(key) {
        localStorage.setItem("nova_api_key_v1", key);
        showNotif("Key Saved Successfully! ✅");
    }
}

function newChat(){
    curId = Date.now();
    chats.unshift({id: curId, name: "New Session", msgs: []});
    save();
    renderH();
    loadChat(curId);
    if(window.innerWidth < 768 && document.getElementById("sidebar").classList.contains("active")) toggleS();
}

async function send(){
    const inp = document.getElementById("ui"), btn = document.getElementById("sb"), txt = inp.value.trim();
    const key = localStorage.getItem("nova_api_key_v1");

    if(!txt || btn.disabled) return;
    if(!key) { showNotif("Set API Key first! ⚙️"); return; }

    addM(txt, "user");
    inp.value = "";
    const tid = "ai-" + Date.now();
    addM("● ● ●", "ai", tid);

    try {
        const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": "Bearer " + key,
                "Content-Type": "application/json",
                "HTTP-Referer": window.location.origin
            },
            body: JSON.stringify({
                model: "google/gemini-2.0-flash-001",
                messages: [{role: "user", content: txt}]
            })
        });
        const data = await res.json();
        const answer = data.choices[0].message.content;
        
        document.getElementById(tid).innerHTML = marked.parse(answer);
        
        let session = chats.find(x => x.id === curId);
        if(session) {
            if(session.msgs.length === 0) session.name = txt.substring(0, 18);
            session.msgs.push({u: txt, a: answer});
            save();
            renderH();
        }
    } catch(e) {
        document.getElementById(tid).innerText = "Error: Check Key or Connection.";
    }
}

function addM(t, r, id){
    const b = document.getElementById("chat-box");
    const d = document.createElement("div");
    d.className = "msg " + r;
    if(id) d.id = id;
    d.innerHTML = (r === "ai" && t !== "● ● ●") ? marked.parse(t) : t;
    b.appendChild(d);
    b.scrollTop = b.scrollHeight;
}

function renderH(f=""){
    const l = document.getElementById("h-list");
    l.innerHTML = "";
    chats.filter(x => x.name.toLowerCase().includes(f.toLowerCase())).forEach((x, i) => {
        const div = document.createElement("div");
        div.className = "h-item";
        div.innerHTML = `<span class="h-title" onclick="loadChat(${x.id})">💬 ${x.name}</span>
        <div class="h-btns"><button onclick="delH(event,${i})">🗑️</button></div>`;
        l.appendChild(div);
    });
}

function loadChat(id){
    curId = id;
    const c = chats.find(x => x.id === id);
    document.getElementById("chat-box").innerHTML = "";
    if(c) c.msgs.forEach(m => { addM(m.u, "user"); addM(m.a, "ai"); });
    if(document.getElementById("sidebar").classList.contains("active")) toggleS();
}

function delH(e, i){
    e.stopPropagation();
    if(confirm("Delete Session?")){
        chats.splice(i, 1);
        save();
        renderH();
        if(chats.length > 0) loadChat(chats[0].id); else newChat();
    }
}

function save(){ localStorage.setItem("nova_final_v7", JSON.stringify(chats)); }

function toggleComfort(){
    comfortMode = !comfortMode;
    document.body.classList.toggle("comfort");
    document.getElementById("cm-btn").innerText = "💖 Comfort Mode: " + (comfortMode ? "ON" : "OFF");
    toggleM("set-menu");
}
