import { useState, useMemo } from "react";

// ==================== MOCK DATABASE ====================
const initAgents = () => [
  { id:"DL-0001", name:"ร้านสลากดิจิทัล สมชาย",   region:"กรุงเทพฯ",    phone:"081-234-5678", email:"somchai@email.com",  contractExpiry:"2026-12-31", renewed:true,  renewedAt:"2026-05-10 09:32" },
  { id:"DL-0002", name:"ร้านโชคดี มีนบุรี",         region:"กรุงเทพฯ",    phone:"082-345-6789", email:"chokdee@email.com",  contractExpiry:"2026-07-15", renewed:false, renewedAt:null },
  { id:"DL-0003", name:"สลากดิจิทัล เชียงใหม่",     region:"เชียงใหม่",   phone:"083-456-7890", email:"cnx@email.com",      contractExpiry:"2026-06-20", renewed:true,  renewedAt:"2026-05-14 14:15" },
  { id:"DL-0004", name:"ร้านโชคทวี ขอนแก่น",        region:"ขอนแก่น",    phone:"084-567-8901", email:"kk@email.com",       contractExpiry:"2026-06-10", renewed:false, renewedAt:null },
  { id:"DL-0005", name:"สลากนำโชค หาดใหญ่",         region:"สงขลา",      phone:"085-678-9012", email:"hatyai@email.com",   contractExpiry:"2026-08-01", renewed:false, renewedAt:null },
  { id:"DL-0006", name:"ร้านดาวทอง นครราชสีมา",     region:"นครราชสีมา", phone:"086-789-0123", email:"korat@email.com",    contractExpiry:"2026-09-30", renewed:true,  renewedAt:"2026-05-20 11:05" },
  { id:"DL-0007", name:"สลากมงคล อุดรธานี",         region:"อุดรธานี",   phone:"087-890-1234", email:"udon@email.com",     contractExpiry:"2026-07-01", renewed:false, renewedAt:null },
  { id:"DL-0008", name:"ร้านโชคชัย พิษณุโลก",       region:"พิษณุโลก",   phone:"088-901-2345", email:"plk@email.com",      contractExpiry:"2026-06-05", renewed:false, renewedAt:null },
];

// ==================== HELPERS ====================
const today = new Date("2026-05-30");
function daysUntil(dateStr) {
  const d = new Date(dateStr);
  return Math.ceil((d - today) / 86400000);
}
function urgency(days) {
  if (days <= 7)  return "critical";
  if (days <= 30) return "warning";
  if (days <= 60) return "notice";
  return "ok";
}
function urgencyLabel(days, renewed) {
  if (renewed) return { label:"ต่อแล้ว", color:"#22c55e", bg:"rgba(34,197,94,0.1)" };
  const u = urgency(days);
  if (u==="critical") return { label:`เหลือ ${days} วัน!`, color:"#ef4444", bg:"rgba(239,68,68,0.1)" };
  if (u==="warning")  return { label:`เหลือ ${days} วัน`,  color:"#f59e0b", bg:"rgba(245,158,11,0.1)" };
  if (u==="notice")   return { label:`เหลือ ${days} วัน`,  color:"#3b82f6", bg:"rgba(59,130,246,0.1)" };
  return { label:"ปกติ", color:"#64748b", bg:"rgba(100,116,139,0.1)" };
}

function exportCSV(agents) {
  const header = ["รหัสตัวแทน","ชื่อร้าน","จังหวัด","เบอร์โทร","อีเมล","วันหมดสัญญา","สถานะ","วันที่ยืนยัน"];
  const rows = agents.map(a => [
    a.id, a.name, a.region, a.phone, a.email, a.contractExpiry,
    a.renewed ? "ต่อแล้ว" : "ยังไม่ต่อ", a.renewedAt || ""
  ]);
  const csv = "\uFEFF" + [header, ...rows].map(r => r.map(c => `"${c}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type:"text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = "agents.csv"; a.click();
}

// ==================== STYLES ====================
const S = `
@import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;600&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#f0f4f8;--surface:#ffffff;--surface2:#f8fafc;--border:#e2e8f0;
  --accent:#1d4ed8;--accent-light:#dbeafe;--accent-dark:#1e40af;
  --green:#16a34a;--green-bg:#dcfce7;
  --red:#dc2626;--red-bg:#fee2e2;
  --yellow:#d97706;--yellow-bg:#fef3c7;
  --blue:#2563eb;--blue-bg:#dbeafe;
  --text:#0f172a;--muted:#64748b;--subtle:#94a3b8;
  --font:'Sarabun',sans-serif;--mono:'IBM Plex Mono',monospace;
  --shadow:0 1px 3px rgba(0,0,0,0.08),0 1px 2px rgba(0,0,0,0.04);
  --shadow-md:0 4px 6px rgba(0,0,0,0.07),0 2px 4px rgba(0,0,0,0.05);
  --shadow-lg:0 10px 15px rgba(0,0,0,0.08),0 4px 6px rgba(0,0,0,0.04);
}
body{background:var(--bg);color:var(--text);font-family:var(--font);font-size:15px;line-height:1.6}
.app{min-height:100vh;background:var(--bg)}

/* NAV */
.nav{background:var(--accent);padding:0 24px;display:flex;align-items:center;gap:16px;height:56px;position:sticky;top:0;z-index:100;box-shadow:0 2px 8px rgba(29,78,216,0.3)}
.nav-logo{font-size:18px;font-weight:800;color:#fff;letter-spacing:-0.3px;display:flex;align-items:center;gap:8px}
.nav-logo span{background:rgba(255,255,255,0.2);border-radius:6px;padding:2px 8px;font-size:13px;font-weight:600}
.nav-spacer{flex:1}
.nav-role{font-size:12px;color:rgba(255,255,255,0.7);font-weight:500}

/* LAYOUT */
.page{max-width:1100px;margin:0 auto;padding:28px 20px}
.page-sm{max-width:420px;margin:0 auto;padding:40px 20px}

/* CARD */
.card{background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:24px;box-shadow:var(--shadow)}
.card-title{font-size:17px;font-weight:700;color:var(--text);margin-bottom:4px}
.card-sub{font-size:13px;color:var(--muted);margin-bottom:20px}

/* FORM */
label{display:block;font-size:12px;font-weight:700;color:var(--muted);letter-spacing:0.5px;text-transform:uppercase;margin-bottom:6px}
input,select{width:100%;background:var(--surface2);border:1.5px solid var(--border);border-radius:9px;padding:11px 14px;font-family:var(--font);font-size:14px;color:var(--text);transition:border-color 0.15s,box-shadow 0.15s;margin-bottom:16px}
input:focus,select:focus{outline:none;border-color:var(--accent);box-shadow:0 0 0 3px rgba(29,78,216,0.1)}
input::placeholder{color:var(--subtle)}

/* BUTTONS */
.btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:10px 18px;border-radius:9px;font-family:var(--font);font-size:14px;font-weight:600;cursor:pointer;border:none;transition:all 0.15s;white-space:nowrap}
.btn-primary{background:var(--accent);color:#fff;width:100%;padding:13px}
.btn-primary:hover:not(:disabled){background:var(--accent-dark);box-shadow:0 4px 12px rgba(29,78,216,0.3);transform:translateY(-1px)}
.btn-primary:disabled{opacity:0.5;cursor:not-allowed;transform:none}
.btn-secondary{background:var(--surface);color:var(--text);border:1.5px solid var(--border);width:100%;padding:11px;margin-top:8px}
.btn-secondary:hover{background:var(--surface2);border-color:#cbd5e1}
.btn-sm{padding:6px 12px;font-size:12px;border-radius:7px}
.btn-outline{background:transparent;color:var(--accent);border:1.5px solid var(--accent)}
.btn-outline:hover{background:var(--accent-light)}
.btn-danger{background:transparent;color:var(--red);border:1.5px solid var(--red)}
.btn-danger:hover{background:var(--red-bg)}
.btn-green{background:var(--green);color:#fff}
.btn-green:hover{background:#15803d;box-shadow:0 4px 12px rgba(22,163,74,0.3)}

/* STATUS BADGES */
.badge{display:inline-flex;align-items:center;gap:5px;padding:3px 10px;border-radius:20px;font-size:12px;font-weight:600;white-space:nowrap}

/* OTP */
.otp-row{display:flex;gap:10px;justify-content:center;margin-bottom:12px}
.otp-box{width:46px!important;height:54px;text-align:center;font-size:22px;font-weight:700;font-family:var(--mono);padding:0!important;margin-bottom:0!important;border-radius:10px!important}
.otp-box:focus{border-color:var(--accent)!important;box-shadow:0 0 0 3px rgba(29,78,216,0.1)!important}

/* SUCCESS */
.success-ring{width:72px;height:72px;border-radius:50%;background:var(--green-bg);border:2px solid var(--green);display:flex;align-items:center;justify-content:center;font-size:32px;margin:0 auto 20px;animation:pop 0.5s cubic-bezier(0.34,1.56,0.64,1)}
@keyframes pop{from{transform:scale(0)}to{transform:scale(1)}}
.info-grid{display:grid;grid-template-columns:1fr 1fr;gap:6px 12px;background:var(--surface2);border:1px solid var(--border);border-radius:10px;padding:16px;margin-bottom:20px;font-size:13px}
.info-grid .lbl{color:var(--muted)}
.info-grid .val{font-weight:600;text-align:right}

/* STAT CARDS */
.stat-row{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:24px}
.stat-box{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:18px 16px;box-shadow:var(--shadow)}
.stat-num{font-size:30px;font-weight:800;font-family:var(--mono);display:block;line-height:1}
.stat-lbl{font-size:12px;color:var(--muted);font-weight:500;margin-top:4px;display:block}
.stat-box.s-green{border-top:3px solid var(--green)}
.stat-box.s-red{border-top:3px solid var(--red)}
.stat-box.s-yellow{border-top:3px solid var(--yellow)}
.stat-box.s-blue{border-top:3px solid var(--blue)}

/* PROGRESS BAR */
.prog-bar{height:8px;background:#e2e8f0;border-radius:99px;overflow:hidden;margin-top:8px}
.prog-fill{height:100%;background:var(--green);border-radius:99px;transition:width 0.6s ease}

/* TABLE */
.toolbar{display:flex;gap:10px;margin-bottom:16px;flex-wrap:wrap;align-items:center}
.search-box{flex:1;min-width:200px;margin-bottom:0!important}
.filter-group{display:flex;gap:6px;flex-wrap:wrap}
.ftab{padding:7px 14px;border-radius:8px;border:1.5px solid var(--border);background:var(--surface);color:var(--muted);font-family:var(--font);font-size:13px;font-weight:600;cursor:pointer;transition:all 0.15s}
.ftab.active{background:var(--accent);border-color:var(--accent);color:#fff}
.table-wrap{background:var(--surface);border:1px solid var(--border);border-radius:12px;overflow:auto;box-shadow:var(--shadow)}
table{width:100%;border-collapse:collapse;font-size:13px}
th{padding:11px 14px;text-align:left;font-size:11px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:0.5px;border-bottom:1.5px solid var(--border);white-space:nowrap;background:var(--surface2)}
td{padding:11px 14px;border-bottom:1px solid var(--border);color:var(--text);vertical-align:middle}
tr:last-child td{border-bottom:none}
tr:hover td{background:#f8fafc}
.mono{font-family:var(--mono);font-size:12px}
.action-row{display:flex;gap:6px}

/* MODAL */
.overlay{position:fixed;inset:0;background:rgba(0,0,0,0.4);backdrop-filter:blur(3px);z-index:200;display:flex;align-items:center;justify-content:center;padding:20px}
.modal{background:var(--surface);border-radius:16px;padding:28px;width:100%;max-width:440px;box-shadow:var(--shadow-lg);animation:fadeUp 0.25s ease}
@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
.modal-title{font-size:18px;font-weight:800;margin-bottom:4px}
.modal-sub{font-size:13px;color:var(--muted);margin-bottom:20px}
.modal-actions{display:flex;gap:10px;margin-top:4px}

/* NOTIFICATION */
.notif{position:fixed;top:16px;right:16px;background:var(--text);color:#fff;padding:12px 18px;border-radius:10px;font-size:14px;font-weight:600;z-index:999;box-shadow:var(--shadow-lg);animation:slideIn 0.3s ease}
@keyframes slideIn{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}
.notif.success{background:var(--green)}
.notif.error{background:var(--red)}

/* HOME */
.home-wrap{display:grid;grid-template-columns:1fr 1fr;gap:20px;max-width:560px;margin:0 auto;padding:60px 20px}
.home-hero{grid-column:1/-1;text-align:center;margin-bottom:8px}
.home-hero h1{font-size:28px;font-weight:800;color:var(--text)}
.home-hero p{color:var(--muted);font-size:14px;margin-top:6px}
.home-card{background:var(--surface);border:1.5px solid var(--border);border-radius:16px;padding:28px 22px;cursor:pointer;transition:all 0.2s;text-align:left;box-shadow:var(--shadow)}
.home-card:hover{border-color:var(--accent);box-shadow:var(--shadow-lg);transform:translateY(-2px)}
.home-card-icon{font-size:32px;margin-bottom:14px}
.home-card h3{font-size:16px;font-weight:700;margin-bottom:6px}
.home-card p{font-size:13px;color:var(--muted);line-height:1.5}

/* SPINNER */
.spin{width:18px;height:18px;border:2px solid rgba(255,255,255,0.4);border-top-color:#fff;border-radius:50%;animation:rot 0.6s linear infinite;display:inline-block}
@keyframes rot{to{transform:rotate(360deg)}}

/* DIVIDER */
.divider{height:1px;background:var(--border);margin:16px 0}

/* SECTION HEADER */
.section-hd{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;flex-wrap:wrap;gap:8px}
.section-hd h2{font-size:18px;font-weight:800}
.section-actions{display:flex;gap:8px}

/* URGENCY ROW */
.urgency-bar{display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap}
.urgency-chip{padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;cursor:pointer;border:2px solid transparent;transition:all 0.15s}

@media(max-width:640px){
  .stat-row{grid-template-columns:repeat(2,1fr)}
  .home-wrap{grid-template-columns:1fr}
  td,th{padding:9px 10px}
}
`;

// ==================== COMPONENTS ====================

function Notif({ msg, type, onClose }) {
  useState(() => { setTimeout(onClose, 3000); });
  return <div className={`notif ${type}`}>{msg}</div>;
}

// ---------- HOME ----------
function HomeScreen({ onAgent, onAdmin }) {
  return (
    <div className="home-wrap">
      <div className="home-hero">
        <div style={{fontSize:44,marginBottom:12}}>🎟️</div>
        <h1>ระบบต่อสัญญาตัวแทน</h1>
        <p>สลากดิจิทัล 6 หลัก — เลือกประเภทการใช้งาน</p>
      </div>
      <button className="home-card" onClick={onAgent}>
        <div className="home-card-icon">🏪</div>
        <h3>ฉันเป็นตัวแทน</h3>
        <p>เข้าสู่ระบบเพื่อยืนยันการต่อสัญญาของคุณ</p>
      </button>
      <button className="home-card" onClick={onAdmin}>
        <div className="home-card-icon">⚙️</div>
        <h3>ผู้ดูแลระบบ</h3>
        <p>จัดการตัวแทน ดูสถานะ และส่งแจ้งเตือน</p>
      </button>
    </div>
  );
}

// ---------- AGENT FLOW ----------
function AgentFlow({ agents, setAgents, onBack }) {
  const [step, setStep] = useState("login"); // login|otp|success|already|notfound
  const [agentId, setAgentId] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["","","","","",""]);
  const [found, setFound] = useState(null);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);

  useState(() => {
    if (step !== "otp") return;
    const t = setInterval(() => setTimer(v => v > 0 ? v-1 : 0), 1000);
    return () => clearInterval(t);
  });

  const doLogin = () => {
    setLoading(true);
    setTimeout(() => {
      const a = agents.find(x => x.id === agentId.trim().toUpperCase() && x.phone === phone.trim());
      if (!a) { setStep("notfound"); setLoading(false); return; }
      setFound(a);
      setStep(a.renewed ? "already" : "otp");
      setTimer(60);
      setLoading(false);
    }, 800);
  };

  const doConfirm = () => {
    setLoading(true);
    setTimeout(() => {
      const now = new Date().toLocaleString("th-TH",{dateStyle:"short",timeStyle:"short"});
      setAgents(prev => prev.map(a => a.id === found.id ? {...a, renewed:true, renewedAt:now} : a));
      setFound(prev => ({...prev, renewed:true, renewedAt:now}));
      setStep("success");
      setLoading(false);
    }, 1000);
  };

  const handleOtp = (v, i) => {
    const n = [...otp]; n[i] = v.slice(-1); setOtp(n);
    if (v && i < 5) document.getElementById(`o${i+1}`)?.focus();
  };

  const days = found ? daysUntil(found.contractExpiry) : 0;

  return (
    <div className="page-sm">
      <button className="btn btn-secondary" style={{width:"auto",marginBottom:20}} onClick={onBack}>← กลับ</button>

      {step === "login" && (
        <div className="card">
          <div className="card-title">เข้าสู่ระบบตัวแทน</div>
          <div className="card-sub">กรอกข้อมูลเพื่อยืนยันตัวตน</div>
          <label>รหัสตัวแทน</label>
          <input placeholder="เช่น DL-0001" value={agentId} onChange={e=>setAgentId(e.target.value)} />
          <label>เบอร์โทรศัพท์</label>
          <input placeholder="0XX-XXX-XXXX" value={phone} onChange={e=>setPhone(e.target.value)} />
          <button className="btn btn-primary" onClick={doLogin} disabled={!agentId||!phone||loading}>
            {loading ? <span className="spin"/> : "ถัดไป →"}
          </button>
        </div>
      )}

      {step === "notfound" && (
        <div className="card" style={{textAlign:"center"}}>
          <div style={{fontSize:48,marginBottom:16}}>❌</div>
          <div className="card-title">ไม่พบข้อมูล</div>
          <div className="card-sub">ไม่พบรหัสตัวแทนหรือเบอร์โทรที่ระบุ</div>
          <button className="btn btn-primary" onClick={()=>setStep("login")}>ลองใหม่</button>
        </div>
      )}

      {step === "already" && (
        <div className="card" style={{textAlign:"center"}}>
          <div style={{fontSize:48,marginBottom:16}}>✅</div>
          <div className="card-title">ต่อสัญญาแล้ว</div>
          <div className="card-sub">{found?.name}</div>
          <div className="info-grid">
            <span className="lbl">ยืนยันเมื่อ</span><span className="val">{found?.renewedAt}</span>
            <span className="lbl">หมดสัญญา</span><span className="val">{found?.contractExpiry}</span>
          </div>
          <button className="btn btn-secondary" onClick={onBack}>กลับหน้าหลัก</button>
        </div>
      )}

      {step === "otp" && (
        <div className="card">
          <div style={{background:"#fef3c7",border:"1px solid #fde68a",borderRadius:10,padding:"12px 14px",marginBottom:20,fontSize:13}}>
            <strong>📋 ข้อมูลของคุณ</strong><br/>
            <span style={{color:"#92400e"}}>{found?.name} · {found?.id}</span><br/>
            <span style={{color:"#92400e"}}>สัญญาหมด: {found?.contractExpiry} (เหลือ {days} วัน)</span>
          </div>
          <div className="card-title">ยืนยัน OTP</div>
          <div className="card-sub">รหัส 6 หลักถูกส่งไปยัง {found?.phone}</div>
          <div className="otp-row">
            {otp.map((v,i) => (
              <input key={i} id={`o${i}`} className="otp-box" maxLength={1} value={v}
                onChange={e=>handleOtp(e.target.value,i)}
                onKeyDown={e=>e.key==="Backspace"&&!v&&i>0&&document.getElementById(`o${i-1}`)?.focus()} />
            ))}
          </div>
          <p style={{textAlign:"center",fontSize:13,color:"#94a3b8",marginBottom:16}}>
            {timer > 0 ? `รหัสหมดอายุใน ${timer} วิ` : <button className="btn btn-sm btn-outline" style={{width:"auto"}}>ขอรหัสใหม่</button>}
          </p>
          <button className="btn btn-primary" onClick={doConfirm} disabled={otp.join("").length<6||loading}>
            {loading ? <span className="spin"/> : "✓ ยืนยันการต่อสัญญา"}
          </button>
          <button className="btn btn-secondary" onClick={()=>setStep("login")}>← แก้ไข</button>
        </div>
      )}

      {step === "success" && (
        <div className="card" style={{textAlign:"center"}}>
          <div className="success-ring">✓</div>
          <div className="card-title" style={{marginBottom:6}}>ต่อสัญญาสำเร็จ!</div>
          <div className="card-sub">บันทึกข้อมูลเรียบร้อยแล้ว</div>
          <div className="info-grid">
            <span className="lbl">ชื่อร้าน</span><span className="val">{found?.name}</span>
            <span className="lbl">รหัส</span><span className="val mono">{found?.id}</span>
            <span className="lbl">หมดสัญญา</span><span className="val">{found?.contractExpiry}</span>
            <span className="lbl">ยืนยันเมื่อ</span><span className="val">{found?.renewedAt}</span>
          </div>
          <button className="btn btn-secondary" onClick={onBack}>กลับหน้าหลัก</button>
        </div>
      )}
    </div>
  );
}

// ---------- EDIT MODAL ----------
function EditModal({ agent, onSave, onClose }) {
  const [form, setForm] = useState({...agent});
  const set = (k,v) => setForm(p=>({...p,[k]:v}));
  return (
    <div className="overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal">
        <div className="modal-title">แก้ไขข้อมูลตัวแทน</div>
        <div className="modal-sub">{agent.id}</div>
        <label>ชื่อร้าน</label>
        <input value={form.name} onChange={e=>set("name",e.target.value)} />
        <label>จังหวัด</label>
        <input value={form.region} onChange={e=>set("region",e.target.value)} />
        <label>เบอร์โทร</label>
        <input value={form.phone} onChange={e=>set("phone",e.target.value)} />
        <label>อีเมล</label>
        <input value={form.email} onChange={e=>set("email",e.target.value)} />
        <label>วันหมดสัญญา</label>
        <input type="date" value={form.contractExpiry} onChange={e=>set("contractExpiry",e.target.value)} />
        <div className="modal-actions">
          <button className="btn btn-primary" style={{flex:1}} onClick={()=>onSave(form)}>บันทึก</button>
          <button className="btn btn-secondary" style={{flex:1,marginTop:0}} onClick={onClose}>ยกเลิก</button>
        </div>
      </div>
    </div>
  );
}

// ---------- ADD MODAL ----------
function AddModal({ onSave, onClose, agentCount }) {
  const nextId = `DL-${String(agentCount+1).padStart(4,"0")}`;
  const [form, setForm] = useState({id:nextId,name:"",region:"",phone:"",email:"",contractExpiry:"",renewed:false,renewedAt:null});
  const set = (k,v) => setForm(p=>({...p,[k]:v}));
  return (
    <div className="overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal">
        <div className="modal-title">เพิ่มตัวแทนใหม่</div>
        <div className="modal-sub">รหัสอัตโนมัติ: {nextId}</div>
        <label>ชื่อร้าน</label>
        <input placeholder="ชื่อร้านค้า" value={form.name} onChange={e=>set("name",e.target.value)} />
        <label>จังหวัด</label>
        <input placeholder="กรุงเทพฯ" value={form.region} onChange={e=>set("region",e.target.value)} />
        <label>เบอร์โทร</label>
        <input placeholder="0XX-XXX-XXXX" value={form.phone} onChange={e=>set("phone",e.target.value)} />
        <label>อีเมล</label>
        <input placeholder="email@example.com" value={form.email} onChange={e=>set("email",e.target.value)} />
        <label>วันหมดสัญญา</label>
        <input type="date" value={form.contractExpiry} onChange={e=>set("contractExpiry",e.target.value)} />
        <div className="modal-actions">
          <button className="btn btn-primary" style={{flex:1}} onClick={()=>onSave(form)} disabled={!form.name||!form.phone||!form.contractExpiry}>เพิ่มตัวแทน</button>
          <button className="btn btn-secondary" style={{flex:1,marginTop:0}} onClick={onClose}>ยกเลิก</button>
        </div>
      </div>
    </div>
  );
}

// ---------- EMAIL MODAL ----------
function EmailModal({ agents, onClose }) {
  const [selected, setSelected] = useState("pending");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const targets = useMemo(() => {
    if (selected === "pending") return agents.filter(a => !a.renewed);
    if (selected === "critical") return agents.filter(a => !a.renewed && daysUntil(a.contractExpiry) <= 7);
    if (selected === "warning") return agents.filter(a => !a.renewed && daysUntil(a.contractExpiry) <= 30);
    return agents.filter(a => !a.renewed && daysUntil(a.contractExpiry) <= 60);
  }, [selected, agents]);

  const doSend = () => {
    setSending(true);
    setTimeout(() => { setSending(false); setSent(true); }, 1500);
  };

  return (
    <div className="overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal">
        {!sent ? <>
          <div className="modal-title">📧 ส่ง Email แจ้งเตือน</div>
          <div className="modal-sub">เลือกกลุ่มที่ต้องการส่ง</div>
          <label>กลุ่มเป้าหมาย</label>
          <select value={selected} onChange={e=>setSelected(e.target.value)} style={{marginBottom:16}}>
            <option value="pending">ทั้งหมดที่ยังไม่ต่อสัญญา</option>
            <option value="60">เหลือ ≤ 60 วัน</option>
            <option value="warning">เหลือ ≤ 30 วัน (เร่งด่วน)</option>
            <option value="critical">เหลือ ≤ 7 วัน (ด่วนมาก)</option>
          </select>
          <div style={{background:"#f0f9ff",border:"1px solid #bae6fd",borderRadius:10,padding:"12px 14px",marginBottom:18,fontSize:13}}>
            จะส่งไปยัง <strong>{targets.length} ราย</strong><br/>
            <span style={{color:"#0369a1"}}>{targets.slice(0,3).map(a=>a.name).join(", ")}{targets.length>3?` และอีก ${targets.length-3} ราย`:""}</span>
          </div>
          <div className="modal-actions">
            <button className="btn btn-green" style={{flex:1}} onClick={doSend} disabled={targets.length===0||sending}>
              {sending ? <><span className="spin"/>กำลังส่ง...</> : `📤 ส่งเลย (${targets.length} ราย)`}
            </button>
            <button className="btn btn-secondary" style={{flex:1,marginTop:0}} onClick={onClose}>ยกเลิก</button>
          </div>
        </> : <>
          <div style={{textAlign:"center"}}>
            <div style={{fontSize:48,marginBottom:16}}>📬</div>
            <div className="modal-title">ส่งสำเร็จ!</div>
            <div className="modal-sub">ส่ง Email ไปยัง {targets.length} ตัวแทนเรียบร้อยแล้ว</div>
            <button className="btn btn-secondary" onClick={onClose}>ปิด</button>
          </div>
        </>}
      </div>
    </div>
  );
}

// ---------- ADMIN ----------
function AdminDashboard({ agents, setAgents, onBack }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [editAgent, setEditAgent] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showEmail, setShowEmail] = useState(false);
  const [notif, setNotif] = useState(null);

  const toast = (msg, type="success") => { setNotif({msg,type}); setTimeout(()=>setNotif(null),3000); };

  const total = agents.length;
  const renewed = agents.filter(a=>a.renewed).length;
  const pending = total - renewed;
  const critical = agents.filter(a=>!a.renewed && daysUntil(a.contractExpiry)<=7).length;
  const pct = total ? Math.round(renewed/total*100) : 0;

  const filtered = useMemo(() => agents
    .filter(a => {
      if (filter==="renewed") return a.renewed;
      if (filter==="pending") return !a.renewed;
      if (filter==="critical") return !a.renewed && daysUntil(a.contractExpiry)<=7;
      if (filter==="warning") return !a.renewed && daysUntil(a.contractExpiry)<=30;
      return true;
    })
    .filter(a => !search || a.name.includes(search)||a.id.includes(search.toUpperCase())||a.region.includes(search))
  , [agents, filter, search]);

  const saveEdit = (form) => {
    setAgents(prev => prev.map(a => a.id===form.id ? form : a));
    setEditAgent(null);
    toast("บันทึกข้อมูลเรียบร้อย");
  };

  const addAgent = (form) => {
    setAgents(prev => [...prev, form]);
    setShowAdd(false);
    toast("เพิ่มตัวแทนใหม่แล้ว");
  };

  const resetRenewal = (id) => {
    setAgents(prev => prev.map(a => a.id===id ? {...a,renewed:false,renewedAt:null} : a));
    toast("รีเซ็ตสถานะแล้ว","error");
  };

  return (
    <div className="page" style={{maxWidth:1100}}>
      {notif && <Notif {...notif} onClose={()=>setNotif(null)}/>}
      {editAgent && <EditModal agent={editAgent} onSave={saveEdit} onClose={()=>setEditAgent(null)}/>}
      {showAdd && <AddModal agentCount={agents.length} onSave={addAgent} onClose={()=>setShowAdd(false)}/>}
      {showEmail && <EmailModal agents={agents} onClose={()=>setShowEmail(false)}/>}

      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:24,flexWrap:"wrap"}}>
        <button className="btn btn-secondary" style={{width:"auto"}} onClick={onBack}>← กลับ</button>
        <h2 style={{fontSize:20,fontWeight:800,flex:1}}>แดชบอร์ดตัวแทน</h2>
        <div className="section-actions">
          <button className="btn btn-sm btn-outline" onClick={()=>setShowEmail(true)}>📧 ส่งแจ้งเตือน</button>
          <button className="btn btn-sm btn-outline" onClick={()=>exportCSV(agents)}>⬇️ Export Excel</button>
          <button className="btn btn-sm btn-green" onClick={()=>setShowAdd(true)}>+ เพิ่มตัวแทน</button>
        </div>
      </div>

      {/* STATS */}
      <div className="stat-row">
        <div className="stat-box s-blue">
          <span className="stat-num">{total}</span>
          <span className="stat-lbl">ตัวแทนทั้งหมด</span>
        </div>
        <div className="stat-box s-green">
          <span className="stat-num" style={{color:"var(--green)"}}>{renewed}</span>
          <span className="stat-lbl">ต่อสัญญาแล้ว</span>
          <div className="prog-bar"><div className="prog-fill" style={{width:`${pct}%`}}/></div>
        </div>
        <div className="stat-box s-yellow">
          <span className="stat-num" style={{color:"var(--yellow)"}}>{pending}</span>
          <span className="stat-lbl">ยังไม่ต่อสัญญา</span>
        </div>
        <div className="stat-box s-red">
          <span className="stat-num" style={{color:"var(--red)"}}>{critical}</span>
          <span className="stat-lbl">เหลือ ≤ 7 วัน</span>
        </div>
      </div>

      {/* TOOLBAR */}
      <div className="toolbar">
        <input className="search-box" placeholder="🔍 ค้นหาชื่อ รหัส จังหวัด..." value={search} onChange={e=>setSearch(e.target.value)}/>
        <div className="filter-group">
          {[["all","ทั้งหมด"],["renewed","✅ ต่อแล้ว"],["pending","⏳ รอต่อ"],["warning","⚠️ ≤30 วัน"],["critical","🔴 ≤7 วัน"]].map(([v,l])=>(
            <button key={v} className={`ftab ${filter===v?"active":""}`} onClick={()=>setFilter(v)}>{l}</button>
          ))}
        </div>
      </div>

      {/* TABLE */}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>รหัส</th><th>ชื่อร้าน</th><th>จังหวัด</th>
              <th>เบอร์โทร</th><th>หมดสัญญา</th><th>สถานะ</th><th>ยืนยันเมื่อ</th><th>จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(a => {
              const days = daysUntil(a.contractExpiry);
              const u = urgencyLabel(days, a.renewed);
              return (
                <tr key={a.id}>
                  <td className="mono">{a.id}</td>
                  <td style={{fontWeight:600}}>{a.name}</td>
                  <td>{a.region}</td>
                  <td className="mono">{a.phone}</td>
                  <td className="mono">{a.contractExpiry}</td>
                  <td>
                    <span className="badge" style={{background:u.bg,color:u.color}}>{u.label}</span>
                  </td>
                  <td className="mono" style={{fontSize:12,color:"#94a3b8"}}>{a.renewedAt||"—"}</td>
                  <td>
                    <div className="action-row">
                      <button className="btn btn-sm btn-outline" onClick={()=>setEditAgent(a)}>แก้ไข</button>
                      {a.renewed && <button className="btn btn-sm btn-danger" onClick={()=>resetRenewal(a.id)}>รีเซ็ต</button>}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length===0 && <div style={{textAlign:"center",padding:40,color:"#94a3b8"}}>ไม่พบข้อมูล</div>}
      </div>
      <p style={{fontSize:12,color:"#94a3b8",marginTop:12,textAlign:"right"}}>แสดง {filtered.length} จาก {total} รายการ</p>
    </div>
  );
}

// ==================== ROOT ====================
export default function App() {
  const [view, setView] = useState("home");
  const [agents, setAgents] = useState(initAgents());

  return (
    <div className="app">
      <style>{S}</style>
      <nav className="nav">
        <div className="nav-logo">🎟️ <span>สลากดิจิทัล</span></div>
        <div className="nav-spacer"/>
        {view !== "home" && <span className="nav-role">{view==="agent"?"ตัวแทนจำหน่าย":"ผู้ดูแลระบบ"}</span>}
      </nav>

      {view==="home"  && <HomeScreen onAgent={()=>setView("agent")} onAdmin={()=>setView("admin")}/>}
      {view==="agent" && <AgentFlow agents={agents} setAgents={setAgents} onBack={()=>setView("home")}/>}
      {view==="admin" && <AdminDashboard agents={agents} setAgents={setAgents} onBack={()=>setView("home")}/>}
    </div>
  );
}
