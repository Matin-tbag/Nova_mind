let chats = JSON.parse(localStorage.getItem("nova_final_v6")) || [];
let curId = null;
let comfortMode = false;
const models = ["google/gemini-2.0-flash-001","openai/gpt-3.5-turbo"];

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
    showNotif("Theme Updated");
}

function showNotif(msg) {
    const n = document.getElementById("notif");
    n.innerText = msg;
    n.style.display = "block";
    setTimeout(() => { n.style.display = "none"; }, 1500);
}

function newChat() {
    curId = Date.now();
    const newSession = { id: curId, name: "New Chat " + (chats.length + 1), msgs: [] };
    chats.unshift(newSession);
    save();
    document.getElementById("chat-box").innerHTML = "";
    addM("Hello! I am Nova. How can I help you today?", "ai");
    renderH();
}

function save() { localStorage.setItem("nova_final_v6", JSON.stringify(chats)); }

async function send() {
    const inp = document.getElementById("ui"), btn = document.getElementById("sb"), txt = inp.value.trim();
    if (!txt || btn.disabled) return;
    if (!curId) newChat();

    addM(txt, "user");
    inp.value = "";
    btn.disabled = true;

    let session = chats.find(x => x.id === curId);
    const tid = "ai-" + Date.now();
    addM("Thinking...", "ai", tid);

    let answer = "";
    // ساخت پیام‌ها با حافظه
    const messages = session.msgs.flatMap(m => [
        { role: "user", content: m.u },
        { role: "assistant", content: m.a }
    ]).concat([{ role: "user", content: txt }]);

    for (let model of models) {
        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: {"Content-Type":"application/json"},
                body: JSON.stringify({ model, messages })
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

    if (!answer) document.getElementById(tid).innerText = "Error: Check server/API";
    btn.disabled = false;
    document.getElementById("chat-box").scrollTop = document.getElementById("chat-box").scrollHeight;
}

function addM(t, r, id) {
    const b = document.getElementById("chat-box");
    const d = document.createElement("div");
    d.className = "msg " + (r === "user" ? "user" : "ai");
    if (id) d.id = id;
    if (r === "ai" && t !== "Thinking...") d.innerHTML = marked.parse(t);
    else d.innerText = t;
    b.appendChild(d);
    b.scrollTop = b.scrollHeight;
}

function renderH(f="") {
    const l = document.getElementById("h-list");
    l.innerHTML = "";
    chats.filter(x=>x.name.toLowerCase().includes(f.toLowerCase())).forEach((x,i)=>{
        const div = document.createElement("div");
        div.className="h-item";
        div.innerHTML=`<span onclick="loadChat(${x.id})">💬 ${x.name}</span>
        <button style="background:none;border:none;color:red;cursor:pointer" onclick="delH(event,${i})">✕</button>`;
        l.appendChild(div);
    });
}

function loadChat(id) {
    curId = id;
    const c = chats.find(x=>x.id===id);
    if(!c) return;
    document.getElementById("chat-box").innerHTML = "";
    c.msgs.forEach(m=>{addM(m.u,"user");addM(m.a,"ai");});
    if(document.getElementById("sidebar").classList.contains("active")) toggleS();
}

function delH(e,i) {
    e.stopPropagation();
    if(confirm("Delete this chat?")) {
        chats.splice(i,1);
        save();
        renderH();
        document.getElementById("chat-box").innerHTML="";
    }
}

function toggleComfort() {
    comfortMode = !comfortMode;
    document.body.classList.toggle("comfort-active", comfortMode);
    document.getElementById("cm-btn").innerText = "💖 Comfort Mode: "+(comfortMode?"ON":"OFF");
    document.querySelectorAll(".drop-menu").forEach(x=>x.classList.remove("show"));
}

function generateImage(){showNotif("Image Module Coming Soon...");}
function generateVideo(){showNotif("Video Module Coming Soon...");}

document.getElementById("ui").onkeypress = e=>{if(e.key==="Enter") send();}
renderH();
if(chats.length>0) loadChat(chats[0].id); else newChat();
