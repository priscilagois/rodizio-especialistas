import { useState, useEffect, useRef } from "react";

const QUEUES=[
  {id:"USA",label:"EUA",icon:"🇺🇸",color:"#7C3AED",light:"#EDE9FE"},
  {id:"Cruzeiros",label:"Cruzeiros",icon:"🚢",color:"#0EA5E9",light:"#E0F2FE"},
  {id:"Multidestinos",label:"Multidestinos",icon:"🌍",color:"#10B981",light:"#D1FAE5"},
  {id:"Servicos",label:"Serviços",icon:"🛎️",color:"#F59E0B",light:"#FEF3C7"},
  {id:"Vistos",label:"Vistos",icon:"📋",color:"#EF4444",light:"#FEE2E2"},
];
const MONTHS=["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
const WEEKDAYS=["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];
const RCOLS=["#7C3AED","#0EA5E9","#10B981","#F59E0B","#EF4444"];
const ADMIN_NAMES=["priscila","marcelo","pedro","roberta"];
const ADMIN_PIN="Orange2026";
const TABS=[{id:"Painel",icon:"📊"},{id:"Rodízio",icon:"🔄"},{id:"Controle",icon:"📅"},{id:"Pausas",icon:"⏸"},{id:"Histórico",icon:"📋"},{id:"Salas",icon:"🚪"},{id:"Presença",icon:"📆"}];

const INIT_SPECS=[
  {id:1,name:"Bruna",queues:["USA"],status:"active",note:"",counts:{},ind:{},selecao:false},
  {id:2,name:"Daiane",queues:["USA"],status:"active",note:"",counts:{},ind:{},selecao:false},
  {id:3,name:"Daniella",queues:["USA"],status:"active",note:"",counts:{},ind:{},selecao:false},
  {id:4,name:"Déborah",queues:["USA"],status:"active",note:"",counts:{},ind:{},selecao:false},
  {id:5,name:"Giovanna",queues:["USA"],status:"active",note:"",counts:{},ind:{},selecao:false},
  {id:6,name:"Jana (Giovanna)",queues:["USA"],status:"active",note:"",counts:{},ind:{},selecao:false},
  {id:7,name:"Mariana",queues:["USA"],status:"active",note:"",counts:{},ind:{},selecao:false},
  {id:8,name:"Raphaela",queues:["USA"],status:"active",note:"",counts:{},ind:{},selecao:false},
  {id:9,name:"Stephanie",queues:["USA"],status:"active",note:"",counts:{},ind:{},selecao:false},
  {id:10,name:"Thais",queues:["USA"],status:"active",note:"",counts:{},ind:{},selecao:false},
  {id:11,name:"Lays",queues:["Cruzeiros"],status:"active",note:"",counts:{},ind:{},selecao:false},
  {id:12,name:"Laura",queues:["Cruzeiros"],status:"active",note:"",counts:{},ind:{},selecao:false},
  {id:13,name:"Vivian",queues:["Cruzeiros"],status:"active",note:"",counts:{},ind:{},selecao:false},
  {id:14,name:"Flavia",queues:["Multidestinos"],status:"active",note:"",counts:{},ind:{},selecao:false},
  {id:15,name:"Gabriel",queues:["Multidestinos"],status:"active",note:"",counts:{},ind:{},selecao:false},
  {id:16,name:"Regiane",queues:["Servicos"],status:"active",note:"",counts:{},ind:{},selecao:false},
  {id:17,name:"Elisa",queues:["Vistos"],status:"active",note:"",counts:{},ind:{},selecao:false},
];
const INIT_SDRS=[{id:1,name:"Gabriella"},{id:2,name:"Elisa"},{id:3,name:"Lorena"},{id:4,name:"Amanda"}];
const INIT_ROOMS=[{id:7,name:"Walt Disney",color:"#7C3AED"},{id:8,name:"Roy Disney",color:"#0EA5E9"},{id:9,name:"Lumiere",color:"#10B981"}];

const SB_URL="https://kmcmepemxyoxvzjzanou.supabase.co";
const SB_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImttY21lcGVteHlveHZ6anphbm91Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU2NDUxMTMsImV4cCI6MjA5MTIyMTExM30.CRMg94r5WbP4s2HNeRxMRWXs-jF7EfcMwihGrLfvpCo";
const H={"Content-Type":"application/json","apikey":SB_KEY,"Authorization":`Bearer ${SB_KEY}`,"Prefer":"return=representation"};

async function sb(path,method="GET",body=null){
  const r=await fetch(`${SB_URL}/rest/v1/${path}`,{method,headers:H,body:body?JSON.stringify(body):null});
  const t=await r.text();return t?JSON.parse(t):null;
}
async function rpc(fn,params){
  const r=await fetch(`${SB_URL}/rest/v1/rpc/${fn}`,{method:"POST",headers:H,body:JSON.stringify(params)});
  const t=await r.text();return t?JSON.parse(t):null;
}

const todayKey=()=>new Date().toLocaleDateString("pt-BR");
const todayISO=()=>new Date().toISOString().split("T")[0];
const toBR=d=>d?d.split("-").reverse().join("/"):"";
const yesterdayKey=()=>{const d=new Date();d.setDate(d.getDate()-1);return d.toLocaleDateString("pt-BR");};
const initials=n=>n.replace(/[^A-Za-záéíóúÁÉÍÓÚ ]/g,"").trim().split(" ").slice(0,2).map(w=>w[0]?.toUpperCase()||"").join("");
const isAdmin=name=>ADMIN_NAMES.includes(name?.toLowerCase().trim());
function getWorkdays(y,m){const d=[],dt=new Date(y,m,1);while(dt.getMonth()===m){if(dt.getDay()!==0&&dt.getDay()!==6)d.push(new Date(dt));dt.setDate(dt.getDate()+1);}return d;}

export default function App(){
  const [specs,setSpecs]=useState(INIT_SPECS);
  const [hist,setHist]=useState([]);
  const [evts,setEvts]=useState([]);
  const [dayLog,setDayLog]=useState([]);
  const [lastMap,setLastMap]=useState({});
  const [prevCounts,setPrevCounts]=useState({});
  const [sdrs,setSdrs]=useState(INIT_SDRS);
  const [rooms,setRooms]=useState(INIT_ROOMS);
  const [bookings,setBookings]=useState([]);
  const [presence,setPresence]=useState([]);
  const [tab,setTab]=useState("Rodízio");
  const [loading,setLoading]=useState(true);
  const [saving,setSaving]=useState(false);
  const [toast,setToast]=useState(null);
  const [modal,setModal]=useState(null);
  const [mTxt,setMTxt]=useState("");
  const [adminOk,setAdminOk]=useState(false);
  const [adminOpen,setAdminOpen]=useState(false);
  const [addForm,setAddForm]=useState(false);
  const [newC,setNewC]=useState({name:"",queues:[],status:"active",note:""});
  const [editSdr,setEditSdr]=useState(null);
  const [editRoom,setEditRoom]=useState(null);
  const [editSpec,setEditSpec]=useState(null);
  const [hFilter,setHFilter]=useState("Hoje");
  const [ctrlM,setCtrlM]=useState({y:new Date().getFullYear(),m:new Date().getMonth()});
  const [ctrlQ,setCtrlQ]=useState("USA");
  const [presM,setPresM]=useState({y:new Date().getFullYear(),m:new Date().getMonth()});
  // bkForm sem notes para evitar perda de foco
  const [bkForm,setBkForm]=useState({room_id:"",specialist_name:"",booking_date:"",start_hour:"09",start_min:"00",end_hour:"10",end_min:"00"});
  const [bkNotes,setBkNotes]=useState("");
  const bkNotesRef=useRef("");
  const [cleanDate,setCleanDate]=useState("");


  const [authStep,setAuthStep]=useState("idle");
  const [tmpName,setTmpName]=useState("");
  const [tmpPin,setTmpPin]=useState("");
  const [tmpPin2,setTmpPin2]=useState("");
  const [userName,setUserName]=useState("");
  const [userIsAdmin,setUserIsAdmin]=useState(false);

  useEffect(()=>{
    const stored=localStorage.getItem("rodizio_user");
    const storedPin=localStorage.getItem("rodizio_pin_"+stored);
    if(stored&&storedPin){setTmpName(stored);setAuthStep("pin_enter");}
    else if(stored&&isAdmin(stored)){setUserName(stored);setUserIsAdmin(true);setAdminOk(true);setAuthStep("done");}
    else{setAuthStep("name");}
  },[]);

  useEffect(()=>{
    if(authStep!=="done")return;
    (async()=>{
      try{
        const [sp,hi,ev,dc,la,sd,rm,bk,pr]=await Promise.all([
          sb("specialists?order=name"),sb("history?order=created_at.desc&limit=1000"),
          sb("events?order=created_at.desc&limit=500"),sb("day_closings?order=created_at.desc&limit=90"),
          sb("last_assigned?select=*"),sb("sdrs?order=name"),sb("meeting_rooms?order=name"),
          sb("meeting_bookings?order=booking_date,start_time"),sb("presence_calendar?order=presence_date"),
        ]);
        if(sp?.length)setSpecs(sp);
        if(hi?.length){
          setHist(hi);
          const yk=yesterdayKey(),pc={};
          hi.filter(h=>h.date_key===yk).forEach(h=>{if(!pc[h.queue_id])pc[h.queue_id]={};pc[h.queue_id][h.spec_name]=(pc[h.queue_id][h.spec_name]||0)+1;});
          setPrevCounts(pc);
        }
        if(ev?.length)setEvts(ev);
        if(dc?.length)setDayLog(dc);
        if(sd?.length)setSdrs(sd);
        if(rm?.length)setRooms(rm);
        if(bk?.length)setBookings(bk);
        if(pr?.length)setPresence(pr);
        const lm={};(la||[]).forEach(r=>{lm[r.queue_id]={name:r.spec_name,type:r.type};});setLastMap(lm);
      }catch(e){console.error(e);}
      setLoading(false);
    })();
  },[authStep]);

  function showToast(msg,type="success"){setToast({msg,type});setTimeout(()=>setToast(null),2800);}
  const today=todayKey();
  const todayISOStr=todayISO();

  function totalOf(c,qId){return(c.counts?.[qId]||0)+(c.ind?.[qId]||0);}
  function prevTotal(name,qId){return prevCounts[qId]?.[name]||0;}
  function orderScore(c,qId){const t=totalOf(c,qId);return t*10000+(t===0?prevTotal(c.name,qId):0);}
  function activePool(qId){return specs.filter(c=>c.status==="active"&&c.queues.includes(qId)).sort((a,b)=>orderScore(a,qId)-orderScore(b,qId)||a.name.localeCompare(b.name,"pt"));}
  function selPool(qId){return specs.filter(c=>c.status==="active"&&c.queues.includes(qId)&&c.selecao).sort((a,b)=>orderScore(a,qId)-orderScore(b,qId)||a.name.localeCompare(b.name,"pt"));}

  function handleNameSubmit(){
    const name=tmpName.trim();if(!name)return;
    if(isAdmin(name)){setAuthStep("pin_enter_admin");return;}
    const sp=localStorage.getItem("rodizio_pin_"+name);
    setAuthStep(sp?"pin_enter":"pin_create");
  }
  function handleAdminPinSubmit(){
    if(tmpPin===ADMIN_PIN){const name=tmpName.trim();localStorage.setItem("rodizio_user",name);setUserName(name);setUserIsAdmin(true);setAdminOk(true);setAuthStep("done");setTmpPin("");}
    else{showToast("PIN incorreto","error");setTmpPin("");}
  }
  function handlePinCreate(){
    if(tmpPin.length<4){showToast("PIN deve ter ao menos 4 caracteres","error");return;}
    if(tmpPin!==tmpPin2){showToast("PINs não coincidem","error");return;}
    const name=tmpName.trim();localStorage.setItem("rodizio_pin_"+name,tmpPin);localStorage.setItem("rodizio_user",name);
    setUserName(name);setUserIsAdmin(false);setAdminOk(false);setAuthStep("done");setTmpPin("");setTmpPin2("");
  }
  function handlePinEnter(){
    const name=tmpName.trim(),stored=localStorage.getItem("rodizio_pin_"+name);
    if(tmpPin===stored){localStorage.setItem("rodizio_user",name);setUserName(name);setUserIsAdmin(false);setAdminOk(false);setAuthStep("done");setTmpPin("");}
    else{showToast("PIN incorreto","error");setTmpPin("");}
  }
  function handleLogout(){localStorage.removeItem("rodizio_user");setUserName("");setTmpName("");setTmpPin("");setTmpPin2("");setUserIsAdmin(false);setAdminOk(false);setAuthStep("name");}

  async function rotateNormal(qId){if(saving)return;setSaving(true);try{const res=await rpc("assign_next",{p_queue_id:qId,p_type:"normal",p_user:userName});if(res?.error)showToast("Nenhum disponível.","error");else{showToast(`Atribuído: ${res.specialist.name}`);const[sp,la]=await Promise.all([sb("specialists?order=name"),sb("last_assigned?select=*")]);if(sp?.length)setSpecs(sp);const lm={};(la||[]).forEach(r=>{lm[r.queue_id]={name:r.spec_name,type:r.type};});setLastMap(lm);const hi=await sb("history?order=created_at.desc&limit=1000");if(hi?.length)setHist(hi);}}catch{showToast("Erro.","error");}setSaving(false);}
  async function rotateSelecao(qId){const pool=selPool(qId);if(!pool.length){showToast("Nenhum com ⭐.","error");return;}if(saving)return;setSaving(true);try{const spec=pool[0];await sb(`specialists?id=eq.${spec.id}`,"PATCH",{ind:{...spec.ind,[qId]:(spec.ind?.[qId]||0)+1}});const res=await rpc("assign_next",{p_queue_id:qId,p_type:"selecao",p_user:userName});if(res?.error)showToast("Erro.","error");else{showToast(`Seleção: ${res.specialist.name}`);const sp=await sb("specialists?order=name");if(sp?.length)setSpecs(sp);}}catch{showToast("Erro.","error");}setSaving(false);}
  async function rotateRecart(qId){if(saving)return;setSaving(true);try{const res=await rpc("assign_recart",{p_queue_id:qId,p_user:userName});if(res?.error)showToast("Nenhum disponível.","error");else{showToast(`Recart. Férias: ${res.specialist.name}`);const sp=await sb("specialists?order=name");if(sp?.length)setSpecs(sp);}}catch{showToast("Erro.","error");}setSaving(false);}
  async function addInd(qId,specId){
    const spec=specs.find(c=>c.id===specId);if(!spec)return;
    try{
      const newInd={...spec.ind,[qId]:(spec.ind?.[qId]||0)+1};
      await sb(`specialists?id=eq.${specId}`,"PATCH",{ind:newInd});
      await sb("history","POST",{spec_name:spec.name,queue_id:qId,type:"indicacao",by_user:userName,date_key:today});
      showToast(`Indicação: ${spec.name}`);
      const sp=await sb("specialists?order=name");
      if(sp?.length)setSpecs(sp);
    }catch(e){console.error(e);showToast("Erro ao registrar indicação.","error");}
  }
  async function addExtra(qId,specId){if(!adminOk)return;const spec=specs.find(c=>c.id===specId);if(!spec)return;try{await sb(`specialists?id=eq.${specId}`,"PATCH",{counts:{...spec.counts,[qId]:(spec.counts?.[qId]||0)+1}});await sb("history","POST",{spec_name:spec.name,queue_id:qId,type:"extra_admin",by_user:userName,date_key:today});showToast(`+1 extra: ${spec.name}`);const sp=await sb("specialists?order=name");if(sp?.length)setSpecs(sp);}catch{showToast("Erro.","error");}}
  async function toggleSel(spec){try{await sb(`specialists?id=eq.${spec.id}`,"PATCH",{selecao:!spec.selecao});const sp=await sb("specialists?order=name");if(sp?.length)setSpecs(sp);}catch{}}
  async function setVacation(spec,on,note=""){try{await sb(`specialists?id=eq.${spec.id}`,"PATCH",{status:on?"vacation":"active",note:on?note:spec.note});await sb("events","POST",{type:on?"pausa_inicio":"pausa_fim",spec_name:spec.name,detail:on?note:"Retornou de férias",by_user:userName,date_key:today});showToast(on?"Férias registradas!":"Retorno registrado!");const sp=await sb("specialists?order=name");if(sp?.length)setSpecs(sp);const ev=await sb("events?order=created_at.desc&limit=500");if(ev?.length)setEvts(ev);}catch{showToast("Erro.","error");}}
  async function setPaused(spec,on,note=""){try{await sb(`specialists?id=eq.${spec.id}`,"PATCH",{status:on?"paused":"active",note:on?note:spec.note});await sb("events","POST",{type:on?"pausa_inicio":"pausa_fim",spec_name:spec.name,detail:on?note:"Reativado",by_user:userName,date_key:today});showToast(on?"Pausado!":"Reativado!");const sp=await sb("specialists?order=name");if(sp?.length)setSpecs(sp);}catch{showToast("Erro.","error");}}
  async function saveNote(spec,note){try{await sb(`specialists?id=eq.${spec.id}`,"PATCH",{note});if(note.trim())await sb("events","POST",{type:"nota",spec_name:spec.name,detail:note,by_user:userName,date_key:today});showToast("Nota salva!");const sp=await sb("specialists?order=name");if(sp?.length)setSpecs(sp);}catch{showToast("Erro.","error");}}
  async function removeSpec(id){if(!confirm("Remover?"))return;try{await sb(`specialists?id=eq.${id}`,"DELETE");const sp=await sb("specialists?order=name");if(sp)setSpecs(sp);}catch{}}
  async function addSpec(){if(!newC.name.trim())return;try{await sb("specialists","POST",{...newC,counts:{},ind:{},selecao:false});setNewC({name:"",queues:[],status:"active",note:""});setAddForm(false);showToast("Adicionado!");const sp=await sb("specialists?order=name");if(sp?.length)setSpecs(sp);}catch{showToast("Erro.","error");}}

  async function iniciarNovoDia(){
    if(!confirm("Iniciar novo dia?"))return;
    const y=new Date();y.setDate(y.getDate()-1);
    const yKey=y.toLocaleDateString("pt-BR");
    const yLabel=y.toLocaleDateString("pt-BR",{weekday:"long",day:"2-digit",month:"2-digit",year:"numeric"});
    const summary=QUEUES.map(q=>{const e=hist.filter(h=>h.date_key===yKey&&h.queue_id===q.id);return{queue:q.label,normal:e.filter(h=>h.type==="normal").length,ind:e.filter(h=>h.type!=="normal").length,total:e.length};}).filter(s=>s.total>0);
    try{
      await sb("day_closings","POST",{closed_date:yKey,closed_label:yLabel,closed_by:userName,summary,total_normal:summary.reduce((a,s)=>a+s.normal,0),total_ind:summary.reduce((a,s)=>a+s.ind,0)});
      for(const s of specs)await sb(`specialists?id=eq.${s.id}`,"PATCH",{counts:{}});
      await sb("last_assigned","DELETE");
      setLastMap({});
      const pc={};hist.filter(h=>h.date_key===yKey).forEach(h=>{if(!pc[h.queue_id])pc[h.queue_id]={};pc[h.queue_id][h.spec_name]=(pc[h.queue_id][h.spec_name]||0)+1;});
      setPrevCounts(pc);
      showToast("Novo dia iniciado!");
      const sp=await sb("specialists?order=name");if(sp?.length)setSpecs(sp);
    }catch{showToast("Erro.","error");}
  }

  async function saveBooking(){
    const start_time=`${bkForm.start_hour}:${bkForm.start_min}`;
    const end_time=`${bkForm.end_hour}:${bkForm.end_min}`;
    if(!bkForm.room_id||!bkForm.specialist_name||!bkForm.booking_date){showToast("Preencha todos os campos.","error");return;}
    const room=rooms.find(r=>String(r.id)===String(bkForm.room_id));
    const conflict=bookings.find(b=>String(b.room_id)===String(bkForm.room_id)&&b.booking_date===bkForm.booking_date&&!(end_time<=b.start_time||start_time>=b.end_time));
    if(conflict){showToast(`Conflito: ${conflict.specialist_name} (${conflict.start_time}–${conflict.end_time}).`,"error");return;}
    try{
      const payload={
        room_id:parseInt(bkForm.room_id),
        room_name:room?.name||"",
        specialist_name:bkForm.specialist_name,
        booking_date:bkForm.booking_date,
        start_time,
        end_time,
        notes:bkNotes,
        booked_by:userName
      };
      await sb("meeting_bookings","POST",payload);
      showToast("Reserva criada!");
      setBkForm({room_id:"",specialist_name:"",booking_date:"",start_hour:"09",start_min:"00",end_hour:"10",end_min:"00"});
      setBkNotes("");
      const bk=await sb("meeting_bookings?order=booking_date,start_time");if(bk)setBookings(bk);
    }catch(e){console.error(e);showToast("Erro ao salvar reserva.","error");}
  }
  async function deleteBooking(id){if(!confirm("Cancelar?"))return;try{await sb(`meeting_bookings?id=eq.${id}`,"DELETE");const bk=await sb("meeting_bookings?order=booking_date,start_time");if(bk)setBookings(bk);}catch{}}

  async function togglePresence(sdrName,dateStr){
    if(!adminOk&&sdrName!==userName){showToast("Você só pode alterar sua própria presença.","error");return;}
    const ex=presence.find(p=>p.sdr_name===sdrName&&p.presence_date===dateStr);
    try{if(ex)await sb(`presence_calendar?id=eq.${ex.id}`,"DELETE");else await sb("presence_calendar","POST",{sdr_name:sdrName,presence_date:dateStr});const pr=await sb("presence_calendar?order=presence_date");if(pr)setPresence(pr);}
    catch{showToast("Erro.","error");}
  }

  useEffect(()=>{
    if(authStep!=="done")return;
    const id=setInterval(()=>{
      const now=new Date();
      bookings.filter(b=>b.booking_date===todayISOStr).forEach(b=>{
        const[h,mn]=b.start_time.split(":").map(Number);
        const mtg=new Date();mtg.setHours(h,mn,0,0);
        const diff=(mtg-now)/60000;
        if(diff>0&&diff<=60&&!notifRef.current.has(b.id)){notifRef.current.add(b.id);showToast(`🔔 Reunião em ${Math.round(diff)} min — ${b.room_name} · ${b.specialist_name}`,"info");}
      });
    },30000);
    return()=>clearInterval(id);
  },[bookings,todayISOStr,authStep]);

  const f="var(--font-sans, system-ui, sans-serif)";
  const C={
    card:{background:"#fff",borderRadius:16,border:"0.5px solid #e5e7eb",padding:"1.25rem",marginBottom:14},
    inp:{width:"100%",boxSizing:"border-box",padding:"10px 14px",borderRadius:10,border:"1.5px solid #e5e7eb",fontSize:14,color:"#222",background:"#fafafa",outline:"none"},
    btnP:{cursor:"pointer",padding:"9px 20px",borderRadius:10,border:"none",background:"linear-gradient(135deg,#7C3AED,#4F46E5)",color:"#fff",fontSize:13,fontWeight:600},
    btnS:{cursor:"pointer",padding:"9px 16px",borderRadius:10,border:"1.5px solid #e5e7eb",background:"#fff",fontSize:13,color:"#555"}
  };

  if(authStep==="name"||authStep==="idle"){return(<div style={{minHeight:"100vh",background:"linear-gradient(135deg,#7C3AED,#4F46E5)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:f}}><div style={{background:"#fff",borderRadius:20,padding:"2.5rem",width:340,textAlign:"center"}}><div style={{fontSize:40,marginBottom:12}}>👋</div><div style={{fontWeight:700,fontSize:20,marginBottom:6}}>Bem-vindo!</div><div style={{fontSize:14,color:"#888",marginBottom:24}}>Digite seu nome para continuar</div><input style={{width:"100%",boxSizing:"border-box",padding:"12px 16px",borderRadius:10,border:"2px solid #e5e7eb",fontSize:15,marginBottom:16,outline:"none",color:"#222"}} placeholder="Seu nome" value={tmpName} onChange={e=>setTmpName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleNameSubmit()} autoFocus/><button style={{width:"100%",padding:"12px",borderRadius:10,border:"none",background:"linear-gradient(135deg,#7C3AED,#4F46E5)",color:"#fff",fontSize:15,fontWeight:600,cursor:"pointer"}} onClick={handleNameSubmit}>Continuar</button></div></div>);}
  if(authStep==="pin_enter_admin"){return(<div style={{minHeight:"100vh",background:"linear-gradient(135deg,#7C3AED,#4F46E5)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:f}}><div style={{background:"#fff",borderRadius:20,padding:"2.5rem",width:340,textAlign:"center"}}><div style={{fontSize:40,marginBottom:12}}>🔐</div><div style={{fontWeight:700,fontSize:20,marginBottom:6}}>Olá, {tmpName}!</div><div style={{fontSize:14,color:"#888",marginBottom:24}}>Digite o PIN de administrador</div><input type="password" style={{width:"100%",boxSizing:"border-box",padding:"12px 16px",borderRadius:10,border:"2px solid #e5e7eb",fontSize:15,marginBottom:16,outline:"none",color:"#222",textAlign:"center",letterSpacing:4}} placeholder="••••••••" value={tmpPin} onChange={e=>setTmpPin(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleAdminPinSubmit()} autoFocus/>{toast&&<div style={{marginBottom:12,padding:"8px",background:"#FEE2E2",color:"#EF4444",borderRadius:8,fontSize:13}}>{toast.msg}</div>}<button style={{width:"100%",padding:"12px",borderRadius:10,border:"none",background:"linear-gradient(135deg,#7C3AED,#4F46E5)",color:"#fff",fontSize:15,fontWeight:600,cursor:"pointer",marginBottom:10}} onClick={handleAdminPinSubmit}>Entrar</button><button style={{background:"none",border:"none",color:"#aaa",fontSize:13,cursor:"pointer"}} onClick={()=>{setAuthStep("name");setTmpPin("");}}>← Voltar</button></div></div>);}
  if(authStep==="pin_create"){return(<div style={{minHeight:"100vh",background:"linear-gradient(135deg,#7C3AED,#4F46E5)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:f}}><div style={{background:"#fff",borderRadius:20,padding:"2.5rem",width:340,textAlign:"center"}}><div style={{fontSize:40,marginBottom:12}}>🔑</div><div style={{fontWeight:700,fontSize:20,marginBottom:6}}>Olá, {tmpName}!</div><div style={{fontSize:14,color:"#888",marginBottom:24}}>Crie um PIN para proteger seu acesso</div><input type="password" style={{width:"100%",boxSizing:"border-box",padding:"12px 16px",borderRadius:10,border:"2px solid #e5e7eb",fontSize:15,marginBottom:12,outline:"none",color:"#222",textAlign:"center",letterSpacing:4}} placeholder="Criar PIN" value={tmpPin} onChange={e=>setTmpPin(e.target.value)} autoFocus/><input type="password" style={{width:"100%",boxSizing:"border-box",padding:"12px 16px",borderRadius:10,border:"2px solid #e5e7eb",fontSize:15,marginBottom:16,outline:"none",color:"#222",textAlign:"center",letterSpacing:4}} placeholder="Confirmar PIN" value={tmpPin2} onChange={e=>setTmpPin2(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handlePinCreate()}/>{toast&&<div style={{marginBottom:12,padding:"8px",background:"#FEE2E2",color:"#EF4444",borderRadius:8,fontSize:13}}>{toast.msg}</div>}<button style={{width:"100%",padding:"12px",borderRadius:10,border:"none",background:"linear-gradient(135deg,#7C3AED,#4F46E5)",color:"#fff",fontSize:15,fontWeight:600,cursor:"pointer",marginBottom:10}} onClick={handlePinCreate}>Criar PIN e entrar</button><button style={{background:"none",border:"none",color:"#aaa",fontSize:13,cursor:"pointer"}} onClick={()=>{setAuthStep("name");setTmpPin("");setTmpPin2("");}}>← Voltar</button></div></div>);}
  if(authStep==="pin_enter"){return(<div style={{minHeight:"100vh",background:"linear-gradient(135deg,#7C3AED,#4F46E5)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:f}}><div style={{background:"#fff",borderRadius:20,padding:"2.5rem",width:340,textAlign:"center"}}><div style={{fontSize:40,marginBottom:12}}>🔒</div><div style={{fontWeight:700,fontSize:20,marginBottom:6}}>Olá, {tmpName}!</div><div style={{fontSize:14,color:"#888",marginBottom:24}}>Digite seu PIN para entrar</div><input type="password" style={{width:"100%",boxSizing:"border-box",padding:"12px 16px",borderRadius:10,border:"2px solid #e5e7eb",fontSize:15,marginBottom:16,outline:"none",color:"#222",textAlign:"center",letterSpacing:4}} placeholder="••••" value={tmpPin} onChange={e=>setTmpPin(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handlePinEnter()} autoFocus/>{toast&&<div style={{marginBottom:12,padding:"8px",background:"#FEE2E2",color:"#EF4444",borderRadius:8,fontSize:13}}>{toast.msg}</div>}<button style={{width:"100%",padding:"12px",borderRadius:10,border:"none",background:"linear-gradient(135deg,#7C3AED,#4F46E5)",color:"#fff",fontSize:15,fontWeight:600,cursor:"pointer",marginBottom:10}} onClick={handlePinEnter}>Entrar</button><button style={{background:"none",border:"none",color:"#aaa",fontSize:13,cursor:"pointer"}} onClick={()=>{setAuthStep("name");setTmpPin("");}}>← Voltar</button></div></div>);}

  if(loading)return(<div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",fontFamily:f,flexDirection:"column",gap:12}}><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style><div style={{width:40,height:40,border:"4px solid #EDE9FE",borderTop:"4px solid #7C3AED",borderRadius:"50%",animation:"spin 1s linear infinite"}}/><div style={{color:"#7C3AED",fontSize:15,fontWeight:600}}>Carregando...</div></div>);

  const totalActive=specs.filter(c=>c.status==="active").length;
  const totalOff=specs.filter(c=>c.status!=="active").length;
  const normalToday=hist.filter(h=>h.date_key===today&&h.type==="normal").length;
  const totalToday=hist.filter(h=>h.date_key===today).length;
  const rankMap={};hist.filter(h=>h.date_key===today).forEach(h=>{rankMap[h.spec_name]=(rankMap[h.spec_name]||0)+1;});
  const ranking=Object.entries(rankMap).sort((a,b)=>b[1]-a[1]);
  const maxRank=ranking[0]?.[1]||1;
  const now2=new Date();const tMonth=now2.getMonth()+1;const tYear=now2.getFullYear();
  const histFilters={"Hoje":h=>h.date_key===today,"Este mês":h=>{const p=h.date_key?.split("/");return p&&parseInt(p[1])===tMonth&&parseInt(p[2])===tYear;},"Este ano":h=>{const p=h.date_key?.split("/");return p&&parseInt(p[2])===tYear;}};
  const filteredHist=hist.filter(histFilters[hFilter]||histFilters["Hoje"]);

  function QCard({q}){
    const qId=q.id,pool=activePool(qId),spool=selPool(qId),nextN=pool[0]||null,last=lastMap[qId];
    const allInQ=specs.filter(c=>c.queues.includes(qId));
    const newT=hist.filter(h=>h.queue_id===qId&&h.date_key===today&&h.type==="normal").length;
    const single=pool.length<=1;
    return(
      <div style={{...C.card,borderTop:`4px solid ${q.color}`,padding:0,overflow:"hidden"}}>
        <div style={{padding:"1rem",background:`linear-gradient(135deg,${q.color}15,${q.light})`}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:24}}>{q.icon}</span><span style={{fontWeight:700,fontSize:16}}>{q.label}</span></div>
            <div style={{display:"flex",gap:6}}>
              <span style={{padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:600,background:"#fff",color:q.color}}>🆕 {newT}</span>
              <span style={{padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:600,background:q.color,color:"#fff"}}>{pool.length} ativo{pool.length!==1?"s":""}</span>
            </div>
          </div>
          {!single&&<div style={{background:"#fff",borderRadius:12,padding:"10px 14px",border:`1px dashed ${q.color}60`}}>
            <div style={{fontSize:10,color:q.color,letterSpacing:1.5,fontWeight:700,marginBottom:3}}>PRÓXIMO DA FILA</div>
            <div style={{fontSize:20,fontWeight:700}}>{nextN?nextN.name:"—"}</div>
          </div>}
          {!single&&last&&<div style={{background:q.color,borderRadius:10,padding:"7px 12px",marginTop:8,display:"flex",alignItems:"center",gap:8}}>
            <span>✅</span><div><div style={{fontSize:10,color:"#fff9",fontWeight:600}}>ÚLTIMO</div><div style={{fontSize:13,fontWeight:600,color:"#fff"}}>{last.name}{last.type!=="normal"?` · ${last.type}`:""}</div></div>
          </div>}
        </div>
        <div style={{padding:"0.75rem 1rem",borderBottom:"1px solid #f3f4f6",display:"flex",gap:8,flexWrap:"wrap"}}>
          <button style={{...C.btnP,flex:2,background:`linear-gradient(135deg,${q.color},${q.color}cc)`,opacity:saving?0.6:1}} onClick={()=>rotateNormal(qId)} disabled={saving}>{saving?"...":"▶️ Próximo"}</button>
          <button style={{...C.btnS,flex:1,opacity:spool.length>0?1:0.4,borderColor:spool.length>0?"#F59E0B":"#e5e7eb",color:spool.length>0?"#B45309":"#aaa"}} onClick={()=>rotateSelecao(qId)} disabled={!spool.length||saving}>⭐ Seleção</button>
          <button style={{...C.btnS,flex:"1 1 100%",borderColor:"#10B981",color:"#10B981",fontWeight:600,fontSize:12}} onClick={()=>rotateRecart(qId)}>🔁 Recart. Temporária</button>
        </div>
        <div style={{padding:"0.5rem 0.75rem"}}>
          {allInQ.map((c,i)=>{
            const off=c.status!=="active",isVac=c.status==="vacation",isPaused=c.status==="paused";
            const credits=c.ind?.[qId]||0,tot=totalOf(c,qId),prev=prevTotal(c.name,qId);
            return(
              <div key={c.id} style={{padding:"8px 6px",borderBottom:i<allInQ.length-1?"1px solid #f3f4f6":"none",opacity:off?0.45:1}}>
                {/* Linha 1: avatar + nome + status + contador */}
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:5}}>
                  <div style={{width:28,height:28,borderRadius:"50%",background:off?"#e5e7eb":q.light,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:off?"#999":q.color,flexShrink:0}}>{initials(c.name)}</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,fontWeight:700,display:"flex",alignItems:"center",gap:4,flexWrap:"wrap"}}>
                      <span>{c.name}</span>
                      {isVac&&<span title="Férias" style={{fontSize:12}}>🌴</span>}
                      {isPaused&&<span title="Pausado" style={{fontSize:12}}>⏸</span>}
                      {c.selecao&&<span title="Seleção especial" style={{fontSize:12}}>⭐</span>}
                    </div>
                    {c.note&&<div style={{fontSize:11,color:"#F59E0B"}}>{c.note}</div>}
                    {prev>0&&tot===0&&<div style={{fontSize:10,color:"#aaa"}}>ontem: {prev}</div>}
                  </div>
                  <span style={{padding:"2px 10px",borderRadius:20,fontSize:12,fontWeight:800,background:q.light,color:q.color,flexShrink:0}}>{tot}</span>
                </div>
                {/* Linha 2: ações */}
                <div style={{display:"flex",gap:4,alignItems:"center",paddingLeft:36,flexWrap:"wrap"}}>
                  <button style={{padding:"3px 9px",borderRadius:8,border:"none",background:c.selecao?"#FEF3C7":"#f3f4f6",cursor:"pointer",fontSize:11,fontWeight:600,color:c.selecao?"#B45309":"#888"}} onClick={()=>toggleSel(c)}>⭐ Seleção</button>
                  <button style={{padding:"3px 9px",borderRadius:8,border:"none",background:isVac?"#D1FAE5":"#f3f4f6",cursor:"pointer",fontSize:11,fontWeight:600,color:isVac?"#059669":"#888"}} onClick={()=>{if(!isVac){setMTxt("");setModal({type:"vacation",spec:c});}else setVacation(c,false);}}>🌴 Férias</button>
                  <button style={{padding:"3px 9px",borderRadius:8,border:"none",background:isPaused?"#EDE9FE":"#f3f4f6",cursor:"pointer",fontSize:11,fontWeight:600,color:isPaused?"#7C3AED":"#888"}} onClick={()=>{if(!isPaused){setMTxt("");setModal({type:"pausar",spec:c});}else setPaused(c,false);}}>⏸ Pausa</button>
                  <button style={{padding:"3px 9px",borderRadius:8,border:"none",background:"#f3f4f6",cursor:"pointer",fontSize:11,fontWeight:600,color:"#888"}} onClick={()=>{setMTxt(c.note||"");setModal({type:"nota",spec:c});}}>📝 Nota</button>
                  <span style={{padding:"3px 9px",borderRadius:8,fontSize:11,fontWeight:600,background:credits>0?"#FEF3C7":"#f3f4f6",color:credits>0?"#B45309":"#aaa",cursor:"pointer"}} onClick={()=>addInd(qId,c.id)}>📌 {credits}</span>
                  <span style={{padding:"3px 9px",borderRadius:8,fontSize:11,fontWeight:600,background:"#D1FAE5",color:"#10B981",cursor:"pointer"}} onClick={()=>setModal({type:"manual",spec:c,qId})}>+1 Avulso</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  function ControleTab(){
    const wd=getWorkdays(ctrlM.y,ctrlM.m),inQ=specs.filter(c=>c.queues.includes(ctrlQ)),qInfo=QUEUES.find(q=>q.id===ctrlQ);
    const cnt=(n,dk,t)=>hist.filter(h=>h.spec_name===n&&h.date_key===dk&&h.queue_id===ctrlQ&&h.type===t).length;
    const cntRT=(n,dk)=>hist.filter(h=>h.spec_name===n&&h.date_key===dk&&h.queue_id===ctrlQ&&h.type==="recart_ferias").length;
    const cntM=(n,t)=>hist.filter(h=>{if(h.spec_name!==n||h.queue_id!==ctrlQ||h.type!==t)return false;const p=h.date_key?.split("/");return p&&parseInt(p[1])===ctrlM.m+1&&parseInt(p[2])===ctrlM.y;}).length;
    const cntMRT=(n)=>hist.filter(h=>{if(h.spec_name!==n||h.queue_id!==ctrlQ||h.type!=="recart_ferias")return false;const p=h.date_key?.split("/");return p&&parseInt(p[1])===ctrlM.m+1&&parseInt(p[2])===ctrlM.y;}).length;
    function buildHTML(){
      const all=QUEUES.map(q=>{const wd2=getWorkdays(ctrlM.y,ctrlM.m),inQq=specs.filter(c=>c.queues.includes(q.id));const c2=(n,dk,t)=>hist.filter(h=>h.spec_name===n&&h.date_key===dk&&h.queue_id===q.id&&h.type===t).length;const cm2=(n,t)=>hist.filter(h=>{if(h.spec_name!==n||h.queue_id!==q.id||h.type!==t)return false;const p=h.date_key?.split("/");return p&&parseInt(p[1])===ctrlM.m+1&&parseInt(p[2])===ctrlM.y;}).length;const dH=wd2.map(d=>`<th colspan="2">${d.toLocaleDateString("pt-BR",{day:"2-digit",month:"2-digit"})}</th>`).join("");const sH=wd2.map(()=>`<th class="n">N</th><th class="i">I</th>`).join("");const rows=inQq.map(c=>{const tN=cm2(c.name,"normal"),tI=cm2(c.name,"indicacao")+cm2(c.name,"selecao");const cells=wd2.map(d=>{const dk=d.toLocaleDateString("pt-BR"),n=c2(c.name,dk,"normal"),ii=c2(c.name,dk,"indicacao")+c2(c.name,dk,"selecao");return`<td class="${n>0?"nv":"e"}">${n||"—"}</td><td class="${ii>0?"iv":"e"}">${ii||"—"}</td>`;}).join("");return`<tr><td class="name">${c.name}</td>${cells}<td class="tn">${tN||"—"}</td><td class="ti">${tI||"—"}</td></tr>`;}).join("");const tot=`<tr class="tot"><td class="name">TOTAL</td>${wd2.map(d=>{const dk=d.toLocaleDateString("pt-BR"),n=inQq.reduce((a,c)=>a+c2(c.name,dk,"normal"),0),ii=inQq.reduce((a,c)=>a+c2(c.name,dk,"indicacao")+c2(c.name,dk,"selecao"),0);return`<td class="${n>0?"nv":"e"}">${n||"—"}</td><td class="${ii>0?"iv":"e"}">${ii||"—"}</td>`;}).join("")}<td class="tn">${inQq.reduce((a,c)=>a+cm2(c.name,"normal"),0)||"—"}</td><td class="ti">${inQq.reduce((a,c)=>a+cm2(c.name,"indicacao")+cm2(c.name,"selecao"),0)||"—"}</td></tr>`;return`<h3>${q.icon} ${q.label}</h3><table><thead><tr><th rowspan="2" class="name">Especialista</th>${dH}<th colspan="2" class="tot-h">Total</th></tr><tr>${sH}<th class="n">N</th><th class="i">I</th></tr></thead><tbody>${rows}${tot}</tbody></table>`;}).join("");
      return`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Rodízio — ${MONTHS[ctrlM.m]} ${ctrlM.y}</title><style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:Arial,sans-serif;font-size:11px;padding:20px}h1{font-size:16px;color:#7C3AED;margin-bottom:4px}p{color:#888;margin-bottom:4px}h3{font-size:13px;color:#7C3AED;margin:20px 0 6px}table{border-collapse:collapse;width:100%}th,td{border:0.5px solid #e0ddf8;padding:4px 6px;text-align:center;white-space:nowrap}th{background:#f5f3ff;color:#534AB7}.tot-h{background:#d8d4fc;color:#3C3489}.name{text-align:left;min-width:110px;font-weight:500}.n{color:#7C3AED;font-size:10px}.i{color:#F59E0B;font-size:10px}.nv{background:#EDE9FE;color:#534AB7;font-weight:500}.iv{background:#FEF3C7;color:#B45309;font-weight:500}.e{color:#ccc}.tn{background:#EDE9FE;color:#534AB7;font-weight:700}.ti{background:#FEF3C7;color:#B45309;font-weight:700}.tot td{background:#f5f3ff;font-weight:700;border-top:2px solid #C4B5F4}</style></head><body><h1>Rodízio de Especialistas</h1><p>${MONTHS[ctrlM.m]} ${ctrlM.y}</p>${all}</body></html>`;
    }
    const th={padding:"4px 6px",fontSize:11,fontWeight:600,textAlign:"center",border:"1px solid #c4b5fd",background:"#f9fafb",whiteSpace:"nowrap",color:"#555"};
    const td={padding:"4px 6px",fontSize:12,textAlign:"center",border:"1px solid #e5e7eb",whiteSpace:"nowrap"};
    const thDay={...th,borderLeft:"2px solid #7C3AED"};
    const tdDayFirst={...td,borderLeft:"2px solid #c4b5fd"};
    return(
      <div>
        <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap",alignItems:"center"}}>
          <div style={{display:"flex",gap:6,alignItems:"center",background:"#fff",borderRadius:10,border:"1px solid #e5e7eb",padding:"4px 8px"}}>
            <button style={{...C.btnS,padding:"5px 10px"}} onClick={()=>setCtrlM(p=>{const d=new Date(p.y,p.m-1,1);return{y:d.getFullYear(),m:d.getMonth()}})}>‹</button>
            <span style={{fontWeight:600,fontSize:13,minWidth:120,textAlign:"center"}}>{MONTHS[ctrlM.m]} {ctrlM.y}</span>
            <button style={{...C.btnS,padding:"5px 10px"}} onClick={()=>setCtrlM(p=>{const d=new Date(p.y,p.m+1,1);return{y:d.getFullYear(),m:d.getMonth()}})}>›</button>
          </div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{QUEUES.map(q=><button key={q.id} style={{padding:"6px 14px",borderRadius:10,border:`2px solid ${ctrlQ===q.id?q.color:"#e5e7eb"}`,background:ctrlQ===q.id?q.light:"#fff",color:ctrlQ===q.id?q.color:"#555",fontSize:12,fontWeight:600,cursor:"pointer"}} onClick={()=>setCtrlQ(q.id)}>{q.icon} {q.label}</button>)}</div>
          <div style={{display:"flex",gap:6,marginLeft:"auto"}}>
            <button style={{...C.btnS,fontSize:12}} onClick={()=>{const w=window.open("","_blank");if(!w)return;w.document.write(buildHTML());w.document.close();w.focus();setTimeout(()=>w.print(),600);}}>🖨️ Imprimir</button>
            <button style={{...C.btnP,fontSize:12}} onClick={()=>{const blob=new Blob([buildHTML()],{type:"text/html;charset=utf-8"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=`rodizio_${MONTHS[ctrlM.m]}_${ctrlM.y}.html`;a.click();URL.revokeObjectURL(url);}}>⬇️ Baixar</button>
          </div>
        </div>
        <div style={{overflowX:"auto",borderRadius:12,border:"1px solid #e5e7eb",background:"#fff"}}>
          <table style={{borderCollapse:"collapse",minWidth:"100%"}}>
            <thead>
              <tr>
                <th style={{...th,textAlign:"left",minWidth:130}} rowSpan={2}>Especialista</th>
                {wd.map(d=><th key={d.toISOString()} style={{...thDay,minWidth:72}} colSpan={3}>{d.toLocaleDateString("pt-BR",{day:"2-digit",month:"2-digit"})}</th>)}
                <th style={{...thDay,background:qInfo.light,color:qInfo.color}} colSpan={3}>Total</th>
              </tr>
              <tr>
                {wd.map(d=>[
                  <th key={d.toISOString()+"n"} style={{...th,fontSize:10,color:"#7C3AED",borderLeft:"2px solid #7C3AED"}}>N</th>,
                  <th key={d.toISOString()+"i"} style={{...th,fontSize:10,color:"#F59E0B"}}>I</th>,
                  <th key={d.toISOString()+"rt"} style={{...th,fontSize:10,color:"#10B981"}}>RT</th>
                ])}
                <th style={{...th,fontSize:10,color:qInfo.color,background:qInfo.light,borderLeft:"2px solid #7C3AED"}}>N</th>
                <th style={{...th,fontSize:10,color:"#B45309",background:"#FEF3C7"}}>I</th>
                <th style={{...th,fontSize:10,color:"#10B981",background:"#D1FAE5"}}>RT</th>
              </tr>
            </thead>
            <tbody>
              {inQ.map((c,ri)=>{const rb=ri%2===0?"#fff":"#fafafa",tN=cntM(c.name,"normal"),tI=cntM(c.name,"indicacao")+cntM(c.name,"selecao");return(<tr key={c.id}><td style={{...td,textAlign:"left",fontWeight:600,background:rb,position:"sticky",left:0,zIndex:1}}><div style={{display:"flex",alignItems:"center",gap:6}}><div style={{width:20,height:20,borderRadius:"50%",background:qInfo.light,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,color:qInfo.color}}>{initials(c.name)}</div>{c.name}</div></td>{wd.map(d=>{const dk=d.toLocaleDateString("pt-BR"),n=cnt(c.name,dk,"normal"),ii=cnt(c.name,dk,"indicacao")+cnt(c.name,dk,"selecao");return[<td key={dk+"n"} style={{...td,background:n>0?"#EDE9FE":rb,color:n>0?"#7C3AED":"#ddd",fontWeight:n>0?600:400}}>{n||""}</td>,<td key={dk+"i"} style={{...td,background:ii>0?"#FEF3C7":rb,color:ii>0?"#B45309":"#ddd",fontWeight:ii>0?600:400}}>{ii||""}</td>];})}<td style={{...td,fontWeight:700,background:qInfo.light,color:qInfo.color}}>{tN||""}</td><td style={{...td,fontWeight:700,background:"#FEF3C7",color:"#B45309"}}>{tI||""}</td></tr>);})}
                <tr style={{borderTop:`2px solid ${qInfo.color}40`}}><td style={{...td,textAlign:"left",fontWeight:700,background:"#f9fafb",position:"sticky",left:0,zIndex:2,boxShadow:"2px 0 4px #0001"}}>TOTAL</td>{wd.map(d=>{const dk=d.toLocaleDateString("pt-BR"),n=inQ.reduce((a,c)=>a+cnt(c.name,dk,"normal"),0),ii=inQ.reduce((a,c)=>a+cnt(c.name,dk,"indicacao")+cnt(c.name,dk,"selecao"),0),rt=inQ.reduce((a,c)=>a+cntRT(c.name,dk),0);return[<td key={dk+"tn"} style={{...tdDayFirst,fontWeight:600,background:n>0?qInfo.light:"#f9fafb",color:qInfo.color}}>{n||""}</td>,<td key={dk+"ti"} style={{...td,fontWeight:600,background:ii>0?"#FEF3C7":"#f9fafb",color:"#B45309"}}>{ii||""}</td>,<td key={dk+"trt"} style={{...td,fontWeight:600,background:rt>0?"#D1FAE5":"#f9fafb",color:"#10B981"}}>{rt||""}</td>];})}<td style={{...tdDayFirst,fontWeight:700,background:qInfo.light,color:qInfo.color}}>{inQ.reduce((a,c)=>a+cntM(c.name,"normal"),0)||""}</td><td style={{...td,fontWeight:700,background:"#FEF3C7",color:"#B45309"}}>{inQ.reduce((a,c)=>a+cntM(c.name,"indicacao")+cntM(c.name,"selecao"),0)||""}</td><td style={{...td,fontWeight:700,background:"#D1FAE5",color:"#10B981"}}>{inQ.reduce((a,c)=>a+cntMRT(c.name),0)||""}</td></tr>
            </tbody>
          </table>
        </div>
        <div style={{marginTop:8,fontSize:12,color:"#888"}}>N = rodízio normal · I = indicações + seleção · RT = recarteirização temporária</div>
      </div>
    );
  }

  function SalasTab(){
    const hours=Array.from({length:24},(_,i)=>String(i).padStart(2,"0"));
    const mins=["00","15","30","45"];
    return(
      <div>
        <div style={{...C.card,borderLeft:"4px solid #7C3AED"}}>
          <div style={{fontWeight:700,fontSize:15,marginBottom:14}}>🚪 Nova reserva</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
            <div><div style={{fontSize:12,fontWeight:600,color:"#555",marginBottom:4}}>Sala</div>
              <select style={C.inp} value={bkForm.room_id} onChange={e=>setBkForm(p=>({...p,room_id:e.target.value}))}>
                <option value="">Selecione...</option>{rooms.map(r=><option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
            <div><div style={{fontSize:12,fontWeight:600,color:"#555",marginBottom:4}}>Especialista</div>
              <select style={C.inp} value={bkForm.specialist_name} onChange={e=>setBkForm(p=>({...p,specialist_name:e.target.value}))}>
                <option value="">Selecione...</option>{specs.map(s=><option key={s.id} value={s.name}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <div style={{fontSize:12,fontWeight:600,color:"#555",marginBottom:4}}>Data</div>
              <input type="date" style={C.inp} value={bkForm.booking_date} onChange={e=>setBkForm(p=>({...p,booking_date:e.target.value}))}/>
              {bkForm.booking_date&&<div style={{fontSize:11,color:"#888",marginTop:3}}>📅 {toBR(bkForm.booking_date)}</div>}
            </div>
            <div>
              <div style={{fontSize:12,fontWeight:600,color:"#555",marginBottom:4}}>Horário</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr auto 1fr auto 1fr auto 1fr",gap:4,alignItems:"center"}}>
                <select style={{...C.inp,padding:"10px 6px"}} value={bkForm.start_hour} onChange={e=>setBkForm(p=>({...p,start_hour:e.target.value}))}>
                  {hours.map(h=><option key={h} value={h}>{h}</option>)}
                </select>
                <span style={{textAlign:"center",fontWeight:700}}>:</span>
                <select style={{...C.inp,padding:"10px 6px"}} value={bkForm.start_min} onChange={e=>setBkForm(p=>({...p,start_min:e.target.value}))}>
                  {mins.map(m=><option key={m} value={m}>{m}</option>)}
                </select>
                <span style={{textAlign:"center",color:"#888",fontSize:12,padding:"0 2px"}}>até</span>
                <select style={{...C.inp,padding:"10px 6px"}} value={bkForm.end_hour} onChange={e=>setBkForm(p=>({...p,end_hour:e.target.value}))}>
                  {hours.map(h=><option key={h} value={h}>{h}</option>)}
                </select>
                <span style={{textAlign:"center",fontWeight:700}}>:</span>
                <select style={{...C.inp,padding:"10px 6px"}} value={bkForm.end_min} onChange={e=>setBkForm(p=>({...p,end_min:e.target.value}))}>
                  {mins.map(m=><option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>
          </div>
          <div style={{marginBottom:12}}>
            <div style={{fontSize:12,fontWeight:600,color:"#555",marginBottom:4}}>Observação</div>
            <input style={C.inp} placeholder="Ex: Reunião de feedback" defaultValue="" onChange={e=>{bkNotesRef.current=e.target.value;}}/>
          </div>
          <button style={C.btnP} onClick={saveBooking}>Reservar sala</button>
        </div>
        <div style={{fontWeight:700,fontSize:14,margin:"4px 0 10px"}}>📅 Salas hoje — {toBR(todayISOStr)}</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:10,marginBottom:16}}>
          {rooms.map((room,ri)=>{
            const rb=bookings.filter(b=>String(b.room_id)===String(room.id)&&b.booking_date===todayISOStr).sort((a,b)=>a.start_time.localeCompare(b.start_time));
            const col=RCOLS[ri%RCOLS.length];
            return(<div key={room.id} style={{...C.card,borderTop:`4px solid ${col}`,marginBottom:0}}>
              <div style={{fontWeight:700,fontSize:14,color:col,marginBottom:10}}>{room.name}</div>
              {!rb.length&&<div style={{fontSize:12,color:"#aaa",textAlign:"center",padding:"0.5rem"}}>Livre hoje</div>}
              {rb.map(b=>(<div key={b.id} style={{background:`${col}15`,borderRadius:10,padding:"8px 10px",marginBottom:6}}>
                <div style={{display:"flex",justifyContent:"space-between"}}>
                  <div><div style={{fontWeight:600,fontSize:13}}>{b.specialist_name}</div><div style={{fontSize:12,color:col,fontWeight:600}}>{b.start_time}–{b.end_time}</div>{b.notes&&<div style={{fontSize:11,color:"#888"}}>{b.notes}</div>}</div>
                  {(b.booked_by===userName||adminOk)&&<button style={{background:"#FEE2E2",border:"none",borderRadius:8,padding:"4px 8px",cursor:"pointer",fontSize:12,color:"#EF4444"}} onClick={()=>deleteBooking(b.id)}>✕</button>}
                </div>
              </div>))}
            </div>);
          })}
        </div>
        <div style={{fontWeight:700,fontSize:14,marginBottom:10}}>📋 Próximas reservas</div>
        <div style={C.card}>
          {!bookings.filter(b=>b.booking_date>=todayISOStr).length&&<div style={{fontSize:13,color:"#888",textAlign:"center",padding:"1rem"}}>Nenhuma reserva.</div>}
          {bookings.filter(b=>b.booking_date>=todayISOStr).map((b,i,arr)=>{
            const ri=rooms.findIndex(r=>String(r.id)===String(b.room_id)),col=RCOLS[ri>=0?ri%RCOLS.length:0];
            return(<div key={b.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:i<arr.length-1?"1px solid #f3f4f6":"none"}}>
              <div style={{width:8,height:8,borderRadius:"50%",background:col,flexShrink:0}}/>
              <div style={{flex:1}}><span style={{fontWeight:600,fontSize:13}}>{b.specialist_name}</span><span style={{fontSize:12,color:"#888",marginLeft:8}}>{b.room_name} · {toBR(b.booking_date)} · {b.start_time}–{b.end_time}</span></div>
              {(b.booked_by===userName||adminOk)&&<button style={{background:"#FEE2E2",border:"none",borderRadius:8,padding:"4px 8px",cursor:"pointer",fontSize:12,color:"#EF4444"}} onClick={()=>deleteBooking(b.id)}>✕</button>}
            </div>);
          })}
        </div>
        <div style={{fontWeight:700,fontSize:14,marginBottom:10,marginTop:8}}>🗂️ Histórico de reservas</div>
        <div style={C.card}>
          {!bookings.filter(b=>b.booking_date<todayISOStr).length&&<div style={{fontSize:13,color:"#888",textAlign:"center",padding:"1rem"}}>Nenhum histórico.</div>}
          {bookings.filter(b=>b.booking_date<todayISOStr).sort((a,b)=>b.booking_date.localeCompare(a.booking_date)||b.start_time.localeCompare(a.start_time)).map((b,i,arr)=>{
            const ri=rooms.findIndex(r=>String(r.id)===String(b.room_id)),col=RCOLS[ri>=0?ri%RCOLS.length:0];
            return(              <div key={b.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:i<arr.length-1?"1px solid #f3f4f6":"none",opacity:0.7}}>
              <div style={{width:8,height:8,borderRadius:"50%",background:col,flexShrink:0}}/>
              <div style={{flex:1}}><span style={{fontWeight:600,fontSize:13}}>{b.specialist_name}</span><span style={{fontSize:12,color:"#888",marginLeft:8}}>{b.room_name} · {toBR(b.booking_date)} · {b.start_time}–{b.end_time}</span>{b.notes&&<span style={{fontSize:11,color:"#aaa",marginLeft:8}}>· {b.notes}</span>}</div>
              {adminOk&&<button style={{background:"#FEE2E2",border:"none",borderRadius:8,padding:"4px 8px",cursor:"pointer",fontSize:12,color:"#EF4444"}} onClick={()=>deleteBooking(b.id)}>✕</button>}
            </div>);
          })}
        </div>
      </div>
    );
  }

  function PresencaTab(){
    const wd=getWorkdays(presM.y,presM.m),sdrList=sdrs.map(s=>s.name);
    const isPresent=(sdr,dk)=>presence.some(p=>p.sdr_name===sdr&&p.presence_date===dk);
    const fdk=d=>d.toLocaleDateString("pt-BR");
    const presentToday=presence.filter(p=>p.presence_date===today).map(p=>p.sdr_name);
    return(
      <div>
        <div style={{...C.card,background:"linear-gradient(135deg,#EDE9FE,#E0E7FF)",border:"none"}}>
          <div style={{fontWeight:700,fontSize:14,marginBottom:10,color:"#4F46E5"}}>📍 Presença hoje — {today}</div>
          {!presentToday.length&&<div style={{fontSize:13,color:"#888"}}>Nenhum SDR presencial hoje.</div>}
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{presentToday.map(sdr=>(<div key={sdr} style={{display:"flex",alignItems:"center",gap:6,background:"#fff",borderRadius:10,padding:"6px 12px",border:"2px solid #7C3AED"}}><div style={{width:28,height:28,borderRadius:"50%",background:"#EDE9FE",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:"#7C3AED"}}>{initials(sdr)}</div><span style={{fontWeight:600,fontSize:13,color:"#7C3AED"}}>{sdr}</span></div>))}</div>
        </div>
        <div style={{fontSize:12,color:"#888",marginBottom:10,padding:"6px 10px",background:"#FEF3C7",borderRadius:8}}>{adminOk?"👑 Admin: você pode marcar presença de qualquer SDR.":"💡 Você só pode marcar sua própria presença."}</div>
        <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:14,background:"#fff",borderRadius:10,border:"1px solid #e5e7eb",padding:"6px 10px",width:"fit-content"}}>
          <button style={{...C.btnS,padding:"5px 10px"}} onClick={()=>setPresM(p=>{const d=new Date(p.y,p.m-1,1);return{y:d.getFullYear(),m:d.getMonth()}})}>‹</button>
          <span style={{fontWeight:600,fontSize:13,minWidth:120,textAlign:"center"}}>{MONTHS[presM.m]} {presM.y}</span>
          <button style={{...C.btnS,padding:"5px 10px"}} onClick={()=>setPresM(p=>{const d=new Date(p.y,p.m+1,1);return{y:d.getFullYear(),m:d.getMonth()}})}>›</button>
        </div>
        <div style={{overflowX:"auto",borderRadius:12,border:"1px solid #e5e7eb",background:"#fff"}}>
          <table style={{borderCollapse:"collapse",minWidth:"100%"}}>
            <thead>
              <tr>
                <th style={{padding:"8px 12px",fontSize:12,fontWeight:700,textAlign:"left",background:"#f9fafb",border:"0.5px solid #e5e7eb",minWidth:120}}>SDR</th>
                {wd.map(d=>(<th key={d.toISOString()} style={{padding:"6px 4px",fontSize:11,fontWeight:600,textAlign:"center",background:fdk(d)===today?"#EDE9FE":"#f9fafb",color:fdk(d)===today?"#7C3AED":"#555",border:"0.5px solid #e5e7eb",minWidth:40}}><div>{d.toLocaleDateString("pt-BR",{day:"2-digit"})}</div><div style={{fontSize:9,color:"#aaa"}}>{WEEKDAYS[d.getDay()]}</div></th>))}
                <th style={{padding:"6px 8px",fontSize:11,fontWeight:700,background:"#EDE9FE",color:"#7C3AED",border:"0.5px solid #e5e7eb",minWidth:40}}>Total</th>
              </tr>
            </thead>
            <tbody>
              {sdrList.map((sdr,si)=>{
                const rb=si%2===0?"#fff":"#fafafa",monthTotal=wd.filter(d=>isPresent(sdr,fdk(d))).length,canEdit=adminOk||sdr===userName;
                return(<tr key={sdr}>
                  <td style={{padding:"8px 12px",fontWeight:600,fontSize:13,background:rb,border:"0.5px solid #f3f4f6"}}><div style={{display:"flex",alignItems:"center",gap:6}}><div style={{width:24,height:24,borderRadius:"50%",background:"#EDE9FE",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:"#7C3AED"}}>{initials(sdr)}</div>{sdr}{sdr===userName&&<span style={{fontSize:10,color:"#7C3AED",background:"#EDE9FE",borderRadius:6,padding:"1px 5px"}}>você</span>}</div></td>
                  {wd.map(d=>{const dk=fdk(d),present=isPresent(sdr,dk),isToday=dk===today;return(<td key={d.toISOString()} style={{padding:"4px",textAlign:"center",background:present?"#EDE9FE":isToday?"#fafaf5":rb,border:`0.5px solid ${isToday?"#C4B5F4":"#f3f4f6"}`}}><button style={{width:28,height:28,borderRadius:8,border:`2px solid ${present?"#7C3AED":canEdit?"#e5e7eb":"#f3f4f6"}`,background:present?"#7C3AED":"transparent",cursor:canEdit?"pointer":"default",display:"flex",alignItems:"center",justifyContent:"center",margin:"auto",opacity:canEdit?1:0.4}} onClick={()=>canEdit&&togglePresence(sdr,dk)}>{present&&<span style={{color:"#fff",fontSize:12,fontWeight:700}}>✓</span>}</button></td>);})}
                  <td style={{padding:"6px 8px",textAlign:"center",fontWeight:700,fontSize:13,background:"#EDE9FE",color:"#7C3AED",border:"0.5px solid #e5e7eb"}}>{monthTotal}</td>
                </tr>);
              })}
            </tbody>
          </table>
        </div>
        <div style={{marginTop:8,fontSize:12,color:"#888"}}>Clique para marcar/desmarcar presença.</div>
      </div>
    );
  }

  return(
    <div style={{fontFamily:f,background:"#f8f7ff",minHeight:"100vh",padding:"0.75rem"}}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{background:"linear-gradient(135deg,#7C3AED,#4F46E5)",borderRadius:16,padding:"1rem 1.25rem",marginBottom:14,display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
        <div><div style={{fontSize:18,fontWeight:700,color:"#fff"}}>🔄 Rodízio de Especialistas</div><div style={{fontSize:12,color:"#ffffff99",marginTop:2}}>{totalActive} ativos · {totalOff} fora</div></div>
        <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
          <button style={{padding:"8px 16px",borderRadius:10,border:"none",background:"#10B981",color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer"}} onClick={iniciarNovoDia}>☀️ Novo dia</button>
          <div style={{display:"flex",alignItems:"center",gap:6,background:"#ffffff20",borderRadius:10,padding:"6px 12px"}}>
            <span style={{fontSize:13,color:"#fff"}}>👤 {userName}{userIsAdmin&&<span style={{background:"#10B981",borderRadius:6,padding:"1px 6px",fontSize:11,marginLeft:6}}>Admin</span>}</span>
            <button style={{background:"none",border:"none",color:"#ffffff80",fontSize:11,cursor:"pointer"}} onClick={handleLogout}>sair</button>
          </div>
          {adminOk&&<button style={{padding:"8px 14px",borderRadius:10,border:"none",background:"#ffffff20",color:"#fff",fontSize:13,cursor:"pointer",fontWeight:500}} onClick={()=>setAdminOpen(true)}>⚙️ Admin</button>}
        </div>
      </div>
      <div style={{display:"flex",gap:3,background:"#fff",borderRadius:14,padding:4,marginBottom:16,border:"1px solid #e5e7eb",flexWrap:"wrap"}}>
        {TABS.map(t=><button key={t.id} style={{flex:1,minWidth:55,padding:"7px 2px",borderRadius:10,border:tab===t.id?"2px solid #7C3AED":"2px solid #e5e7eb",cursor:"pointer",fontSize:11,fontWeight:tab===t.id?700:400,background:tab===t.id?"linear-gradient(135deg,#7C3AED,#4F46E5)":"#fff",color:tab===t.id?"#fff":"#888"}} onClick={()=>setTab(t.id)}>{t.icon} {t.id}</button>)}
      </div>
      {toast&&<div style={{marginBottom:12,padding:"10px 16px",background:toast.type==="error"?"#FEE2E2":toast.type==="info"?"#EDE9FE":"#D1FAE5",color:toast.type==="error"?"#EF4444":toast.type==="info"?"#7C3AED":"#10B981",borderRadius:10,fontSize:13,fontWeight:500}}>{toast.msg}</div>}
      {adminOpen&&(
        <div style={{background:"#fff",borderRadius:16,padding:"1.5rem",border:"1px solid #e5e7eb",marginBottom:16,boxShadow:"0 4px 24px #7C3AED20"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}><span style={{fontWeight:700,fontSize:15}}>⚙️ Painel Admin</span><button style={{background:"none",border:"none",fontSize:20,cursor:"pointer",color:"#aaa"}} onClick={()=>setAdminOpen(false)}>×</button></div>
          <div style={{fontWeight:700,fontSize:13,marginBottom:8}}>SDRs</div>
          <div style={{maxHeight:150,overflowY:"auto",marginBottom:12}}>{sdrs.map(s=>(<div key={s.id} style={{padding:"6px 0",borderBottom:"1px solid #f3f4f6"}}>{editSdr?.id===s.id?(<div style={{display:"flex",gap:8}}><input style={{...C.inp,flex:1,padding:"6px 10px"}} value={editSdr.name} onChange={e=>setEditSdr(p=>({...p,name:e.target.value}))} autoFocus/><button style={{...C.btnP,padding:"6px 12px",fontSize:12}} onClick={async()=>{await sb(`sdrs?id=eq.${s.id}`,"PATCH",{name:editSdr.name});const sd=await sb("sdrs?order=name");if(sd)setSdrs(sd);setEditSdr(null);showToast("Atualizado!");}}>✓</button><button style={{...C.btnS,padding:"6px 10px",fontSize:12}} onClick={()=>setEditSdr(null)}>✕</button></div>):(<div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontWeight:600,fontSize:13}}>{s.name}</span><div style={{display:"flex",gap:6}}><button style={{padding:"4px 8px",borderRadius:8,border:"1px solid #e5e7eb",background:"#f9fafb",fontSize:12,cursor:"pointer"}} onClick={()=>setEditSdr({id:s.id,name:s.name})}>✏️</button><button style={{padding:"4px 8px",borderRadius:8,border:"1px solid #FECACA",background:"#FEE2E2",color:"#EF4444",fontSize:12,cursor:"pointer"}} onClick={async()=>{if(!confirm(`Remover ${s.name}?`))return;await sb(`sdrs?id=eq.${s.id}`,"DELETE");const sd=await sb("sdrs?order=name");if(sd)setSdrs(sd);}}>🗑️</button></div></div>)}</div>))}</div>
          <div style={{fontWeight:700,fontSize:13,marginBottom:8}}>Salas</div>
          <div style={{maxHeight:150,overflowY:"auto",marginBottom:12}}>{rooms.map((r,ri)=>(<div key={r.id} style={{padding:"6px 0",borderBottom:"1px solid #f3f4f6"}}>{editRoom?.id===r.id?(<div style={{display:"flex",gap:8}}><input style={{...C.inp,flex:1,padding:"6px 10px"}} value={editRoom.name} onChange={e=>setEditRoom(p=>({...p,name:e.target.value}))} autoFocus/><button style={{...C.btnP,padding:"6px 12px",fontSize:12}} onClick={async()=>{await sb(`meeting_rooms?id=eq.${r.id}`,"PATCH",{name:editRoom.name});const rm=await sb("meeting_rooms?order=name");if(rm)setRooms(rm);setEditRoom(null);showToast("Atualizado!");}}>✓</button><button style={{...C.btnS,padding:"6px 10px",fontSize:12}} onClick={()=>setEditRoom(null)}>✕</button></div>):(<div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><div style={{display:"flex",alignItems:"center",gap:8}}><div style={{width:10,height:10,borderRadius:"50%",background:RCOLS[ri%RCOLS.length]}}/><span style={{fontWeight:600,fontSize:13}}>{r.name}</span></div><div style={{display:"flex",gap:6}}><button style={{padding:"4px 8px",borderRadius:8,border:"1px solid #e5e7eb",background:"#f9fafb",fontSize:12,cursor:"pointer"}} onClick={()=>setEditRoom({id:r.id,name:r.name})}>✏️</button><button style={{padding:"4px 8px",borderRadius:8,border:"1px solid #FECACA",background:"#FEE2E2",color:"#EF4444",fontSize:12,cursor:"pointer"}} onClick={async()=>{if(!confirm(`Remover ${r.name}?`))return;await sb(`meeting_rooms?id=eq.${r.id}`,"DELETE");const rm=await sb("meeting_rooms?order=name");if(rm)setRooms(rm);}}>🗑️</button></div></div>)}</div>))}</div>
          <div style={{height:"1px",background:"#e5e7eb",margin:"8px 0 14px"}}/>
          <div style={{fontWeight:700,fontSize:13,marginBottom:8}}>Especialistas</div>
          <div style={{maxHeight:220,overflowY:"auto",marginBottom:8}}>{specs.map(c=>(<div key={c.id} style={{padding:"6px 0",borderBottom:"1px solid #f3f4f6"}}>{editSpec?.id===c.id?(<div><input style={{...C.inp,marginBottom:8,padding:"6px 10px"}} value={editSpec.name} onChange={e=>setEditSpec(p=>({...p,name:e.target.value}))} autoFocus/><div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:8}}>{QUEUES.map(q=>{const sel=editSpec.queues.includes(q.id);return<span key={q.id} style={{padding:"3px 10px",borderRadius:20,fontSize:11,cursor:"pointer",border:`2px solid ${sel?q.color:"#e5e7eb"}`,background:sel?q.light:"#fff",color:sel?q.color:"#888"}} onClick={()=>setEditSpec(p=>({...p,queues:sel?p.queues.filter(x=>x!==q.id):[...p.queues,q.id]}))}>{q.icon} {q.label}</span>;})}</div><div style={{display:"flex",gap:8}}><button style={{...C.btnP,padding:"6px 12px",fontSize:12}} onClick={async()=>{await sb(`specialists?id=eq.${c.id}`,"PATCH",{name:editSpec.name,queues:editSpec.queues});const sp=await sb("specialists?order=name");if(sp)setSpecs(sp);setEditSpec(null);showToast("Atualizado!");}}>✓ Salvar</button><button style={{...C.btnS,padding:"6px 10px",fontSize:12}} onClick={()=>setEditSpec(null)}>Cancelar</button></div></div>):(<div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><div><div style={{fontWeight:600,fontSize:13}}>{c.name}</div><div style={{fontSize:11,color:"#888"}}>{c.queues.map(q=>QUEUES.find(x=>x.id===q)?.label).join(", ")}</div></div><div style={{display:"flex",gap:6}}><button style={{padding:"4px 8px",borderRadius:8,border:"1px solid #e5e7eb",background:"#f9fafb",fontSize:12,cursor:"pointer"}} onClick={()=>setEditSpec({id:c.id,name:c.name,queues:[...c.queues]})}>✏️</button><button style={{padding:"4px 8px",borderRadius:8,border:"1px solid #FECACA",background:"#FEE2E2",color:"#EF4444",fontSize:12,cursor:"pointer"}} onClick={()=>removeSpec(c.id)}>🗑️</button></div></div>)}</div>))}</div>
          {!addForm?(<button style={{...C.btnS,marginBottom:8}} onClick={()=>setAddForm(true)}>+ Adicionar especialista</button>):(<div style={{padding:14,borderRadius:12,border:"1px solid #e5e7eb",background:"#fafafa",marginBottom:8}}><div style={{marginBottom:8}}><div style={{fontSize:12,fontWeight:600,color:"#555",marginBottom:4}}>Nome</div><input style={C.inp} value={newC.name} onChange={e=>setNewC(p=>({...p,name:e.target.value}))}/></div><div style={{marginBottom:10}}><div style={{fontSize:12,fontWeight:600,color:"#555",marginBottom:6}}>Filas</div><div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{QUEUES.map(q=>{const sel=newC.queues.includes(q.id);return<span key={q.id} style={{padding:"4px 12px",borderRadius:20,fontSize:12,cursor:"pointer",border:`2px solid ${sel?q.color:"#e5e7eb"}`,background:sel?q.light:"#fff",color:sel?q.color:"#888",fontWeight:sel?600:400}} onClick={()=>setNewC(p=>({...p,queues:sel?p.queues.filter(x=>x!==q.id):[...p.queues,q.id]}))}>{q.icon} {q.label}</span>;})}</div></div><div style={{display:"flex",gap:8}}><button style={C.btnP} onClick={addSpec}>Adicionar</button><button style={C.btnS} onClick={()=>setAddForm(false)}>Cancelar</button></div></div>)}
          <div style={{height:"1px",background:"#e5e7eb",margin:"8px 0 12px"}}/>
          <div style={{fontWeight:700,fontSize:13,marginBottom:8,color:"#EF4444"}}>🗑️ Limpeza de dados</div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            <button style={{padding:"8px 12px",borderRadius:8,border:"1px solid #FECACA",background:"#FEE2E2",color:"#EF4444",fontSize:12,fontWeight:600,cursor:"pointer",textAlign:"left"}} onClick={async()=>{if(!confirm("Limpar todo o histórico de rodízio?"))return;await sb("history?id=gt.0","DELETE");setHist([]);setAdminOpen(false);showToast("Histórico limpo!");}}>🗑️ Limpar histórico de rodízio</button>
            <button style={{padding:"8px 12px",borderRadius:8,border:"1px solid #FECACA",background:"#FEE2E2",color:"#EF4444",fontSize:12,fontWeight:600,cursor:"pointer",textAlign:"left"}} onClick={async()=>{if(!confirm("Limpar todos os eventos e pausas?"))return;await sb("events?id=gt.0","DELETE");setEvts([]);setAdminOpen(false);showToast("Eventos limpos!");}}>🗑️ Limpar pausas e eventos</button>
            <button style={{padding:"8px 12px",borderRadius:8,border:"1px solid #FECACA",background:"#FEE2E2",color:"#EF4444",fontSize:12,fontWeight:600,cursor:"pointer",textAlign:"left"}} onClick={async()=>{if(!confirm("Limpar todas as reservas de salas?"))return;await sb("meeting_bookings?id=gt.0","DELETE");setBookings([]);setAdminOpen(false);showToast("Reservas limpas!");}}>🗑️ Limpar reservas de salas</button>
            <button style={{padding:"8px 12px",borderRadius:8,border:"1px solid #FECACA",background:"#FEE2E2",color:"#EF4444",fontSize:12,fontWeight:600,cursor:"pointer",textAlign:"left"}} onClick={async()=>{if(!confirm("Limpar todo o calendário de presença?"))return;await sb("presence_calendar?id=gt.0","DELETE");setPresence([]);setAdminOpen(false);showToast("Presença limpa!");}}>🗑️ Limpar calendário de presença</button>
            <button style={{padding:"8px 12px",borderRadius:8,border:"1px solid #FECACA",background:"#FEE2E2",color:"#EF4444",fontSize:12,fontWeight:600,cursor:"pointer",textAlign:"left"}} onClick={async()=>{if(!confirm("Limpar fechamentos de dia?"))return;await sb("day_closings?id=gt.0","DELETE");setDayLog([]);setAdminOpen(false);showToast("Fechamentos limpos!");}}>🗑️ Limpar fechamentos de dia</button>
            <div style={{background:"#f9fafb",borderRadius:8,padding:"10px",border:"1px solid #e5e7eb"}}>
              <div style={{fontSize:12,fontWeight:600,color:"#555",marginBottom:6}}>🗑️ Apagar carteirizações de um dia específico</div>
              <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
                <input type="date" style={{...C.inp,maxWidth:160,padding:"6px 10px"}} value={cleanDate} onChange={e=>setCleanDate(e.target.value)}/>
                {cleanDate&&<div style={{fontSize:11,color:"#888"}}>📅 {toBR(cleanDate)}</div>}
                <button style={{padding:"6px 12px",borderRadius:8,border:"1px solid #FECACA",background:"#FEE2E2",color:"#EF4444",fontSize:12,fontWeight:600,cursor:"pointer"}} onClick={async()=>{
                  if(!cleanDate){showToast("Selecione uma data","error");return;}
                  const dk=toBR(cleanDate);
                  if(!confirm(`Apagar todos os registros de ${dk}?`))return;
                  await sb(`history?date_key=eq.${dk}`,"DELETE");
                  const hi=await sb("history?order=created_at.desc&limit=1000");
                  if(hi)setHist(hi);
                  setCleanDate("");
                  setAdminOpen(false);
                  showToast(`Registros de ${dk} apagados!`);
                }}>Apagar dia</button>
              </div>
            </div>
            <button style={{padding:"8px 12px",borderRadius:8,border:"2px solid #EF4444",background:"#FEE2E2",color:"#EF4444",fontSize:12,fontWeight:700,cursor:"pointer",textAlign:"left"}} onClick={async()=>{if(!confirm("⚠️ ATENÇÃO: Isso vai apagar TODOS os dados. Tem certeza?"))return;await Promise.all([sb("history?id=gt.0","DELETE"),sb("events?id=gt.0","DELETE"),sb("meeting_bookings?id=gt.0","DELETE"),sb("presence_calendar?id=gt.0","DELETE"),sb("day_closings?id=gt.0","DELETE"),sb("last_assigned?queue_id=neq.","DELETE")]);for(const s of specs)await sb(`specialists?id=eq.${s.id}`,"PATCH",{counts:{},ind:{}});setHist([]);setEvts([]);setBookings([]);setPresence([]);setDayLog([]);setLastMap({});const sp=await sb("specialists?order=name");if(sp?.length)setSpecs(sp);setAdminOpen(false);showToast("Todos os dados foram apagados!");}}>⚠️ Apagar TUDO (reset completo)</button>
          </div>
        </div>
      )}
      {modal&&(
        <div style={{background:"#fff",borderRadius:16,padding:"1.5rem",border:"1px solid #e5e7eb",marginBottom:16,boxShadow:"0 4px 24px #7C3AED20"}}>
          {modal?.type==="nota"&&(<><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}><span style={{fontWeight:700,fontSize:15}}>📝 Nota — {modal.spec.name}</span><button style={{background:"none",border:"none",fontSize:20,cursor:"pointer",color:"#aaa"}} onClick={()=>setModal(null)}>×</button></div><textarea rows={3} style={{...C.inp,resize:"none",fontFamily:f}} value={mTxt} onChange={e=>setMTxt(e.target.value)} autoFocus/><div style={{display:"flex",gap:8,marginTop:12}}><button style={C.btnP} onClick={()=>{saveNote(modal.spec,mTxt);setModal(null);}}>Salvar</button><button style={C.btnS} onClick={()=>setModal(null)}>Cancelar</button></div></>)}
          {modal?.type==="vacation"&&(<><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}><span style={{fontWeight:700,fontSize:15}}>🌴 Férias — {modal.spec.name}</span><button style={{background:"none",border:"none",fontSize:20,cursor:"pointer",color:"#aaa"}} onClick={()=>setModal(null)}>×</button></div><input style={C.inp} placeholder="Motivo / data de retorno" value={mTxt} onChange={e=>setMTxt(e.target.value)} autoFocus/><div style={{display:"flex",gap:8,marginTop:12}}><button style={{...C.btnP,background:"#10B981"}} onClick={()=>{setVacation(modal.spec,true,mTxt);setModal(null);}}>Confirmar</button><button style={C.btnS} onClick={()=>setModal(null)}>Cancelar</button></div></>)}
          {modal?.type==="pausar"&&(<><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}><span style={{fontWeight:700,fontSize:15}}>⏸ Pausar — {modal.spec.name}</span><button style={{background:"none",border:"none",fontSize:20,cursor:"pointer",color:"#aaa"}} onClick={()=>setModal(null)}>×</button></div><input style={C.inp} placeholder="Motivo da pausa" value={mTxt} onChange={e=>setMTxt(e.target.value)} autoFocus/><div style={{display:"flex",gap:8,marginTop:12}}><button style={C.btnP} onClick={()=>{setPaused(modal.spec,true,mTxt);setModal(null);}}>Confirmar</button><button style={C.btnS} onClick={()=>setModal(null)}>Cancelar</button></div></>)}
        </div>
      )}
      {tab==="Painel"&&(<><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(110px,1fr))",gap:10,marginBottom:16}}>{[{l:"Total",v:specs.length,c:"#7C3AED",bg:"#EDE9FE"},{l:"Ativos",v:totalActive,c:"#10B981",bg:"#D1FAE5"},{l:"Pausados",v:totalOff,c:"#F59E0B",bg:"#FEF3C7"},{l:"Novos hoje",v:normalToday,c:"#4F46E5",bg:"#E0E7FF"},{l:"Total hoje",v:totalToday,c:"#7C3AED",bg:"#EDE9FE"}].map(k=>(<div key={k.l} style={{background:k.bg,borderRadius:14,padding:"0.9rem",textAlign:"center"}}><div style={{fontSize:11,color:k.c,fontWeight:600,marginBottom:4,opacity:0.8}}>{k.l}</div><div style={{fontSize:26,fontWeight:800,color:k.c}}>{k.v}</div></div>))}</div>{specs.filter(c=>c.status!=="active").length>0&&<div style={C.card}><div style={{fontWeight:700,marginBottom:10,fontSize:14}}>⏸ Fora do rodízio</div>{specs.filter(c=>c.status!=="active").map(c=>(<div key={c.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:"1px solid #f3f4f6"}}><div style={{display:"flex",alignItems:"center",gap:8}}><div style={{width:30,height:30,borderRadius:"50%",background:"#f3f4f6",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:"#888"}}>{initials(c.name)}</div><div><div style={{fontWeight:600,fontSize:13}}>{c.name} {c.status==="vacation"?"🌴":"⏸"}</div>{c.note&&<div style={{fontSize:11,color:"#F59E0B"}}>{c.note}</div>}</div></div><div style={{display:"flex",gap:4}}>{c.queues.map(qId=>{const qi=QUEUES.find(x=>x.id===qId);return<span key={qId} style={{padding:"2px 8px",borderRadius:20,fontSize:11,fontWeight:600,background:qi?.light,color:qi?.color}}>{qi?.icon}</span>;})}</div></div>))}</div>}<div style={C.card}><div style={{fontWeight:700,marginBottom:12,fontSize:14}}>📊 Ranking do dia</div>{!ranking.length&&<div style={{fontSize:13,color:"#888",textAlign:"center",padding:"1rem"}}>Nenhum atendimento ainda.</div>}{ranking.map(([name,count],i)=>(<div key={name} style={{marginBottom:12}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}><div style={{display:"flex",alignItems:"center",gap:8}}><div style={{width:24,height:24,borderRadius:"50%",background:i===0?"#FEF3C7":i===1?"#f3f4f6":"#FEE2E2",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,color:i===0?"#B45309":i===1?"#555":"#EF4444"}}>{i+1}</div><span style={{fontSize:13,fontWeight:600}}>{name}</span></div><span style={{fontWeight:800,fontSize:14,color:"#7C3AED"}}>{count}</span></div><div style={{height:6,background:"#f3f4f6",borderRadius:4}}><div style={{height:6,borderRadius:4,background:"linear-gradient(90deg,#7C3AED,#4F46E5)",width:`${Math.round((count/maxRank)*100)}%`}}/></div></div>))}</div></>)}
      {tab==="Rodízio"&&<>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:16}}>{QUEUES.map(q=><QCard key={q.id} q={q}/>)}</div>
        <div style={{...C.card,marginTop:8,borderTop:"3px solid #7C3AED"}}>
          <div style={{fontWeight:700,fontSize:13,marginBottom:12,color:"#7C3AED"}}>📖 Legenda</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:8}}>
            {[
              {icon:"▶️",label:"Próximo",desc:"Avança o rodízio normal"},
              {icon:"⭐",label:"Seleção",desc:"Marca para atendimentos especiais"},
              {icon:"🌴",label:"Férias",desc:"Coloca/retira de férias"},
              {icon:"⏸",label:"Pausa",desc:"Pausa/reativa por outro motivo"},
              {icon:"📝",label:"Nota",desc:"Adiciona anotação interna"},
              {icon:"📌",label:"Indicação",desc:"Créditos de indicação direta"},
              {icon:"🔁",label:"Recart. Temporária",desc:"Recarteirização durante ausência do titular (férias, licença, etc.)"},
              {icon:"+1",label:"Avulso",desc:"Carteirização direta por outro motivo (telefonema, presencial, etc.)"},
              {icon:"🆕",label:"Novos hoje",desc:"Total de clientes novos hoje neste setor"},
              {icon:"✅",label:"Último",desc:"Último especialista atendido neste setor"},
            ].map(it=>(
              <div key={it.icon} style={{display:"flex",alignItems:"flex-start",gap:8,padding:"8px",background:"#f9fafb",borderRadius:10}}>
                <span style={{fontSize:16,flexShrink:0,minWidth:24,textAlign:"center"}}>{it.icon}</span>
                <div><div style={{fontWeight:600,fontSize:12}}>{it.label}</div><div style={{fontSize:11,color:"#888"}}>{it.desc}</div></div>
              </div>
            ))}
          </div>
        </div>
      </>}
      {tab==="Controle"&&<ControleTab/>}
      {tab==="Salas"&&<SalasTab/>}
      {tab==="Presença"&&<PresencaTab/>}
      {tab==="Pausas"&&(<div style={C.card}><div style={{fontWeight:700,marginBottom:14,fontSize:14}}>Registro de Pausas e Anotações</div>{!evts.length&&<div style={{fontSize:13,color:"#888",textAlign:"center",padding:"2rem"}}>Nenhum registro ainda.</div>}{evts.map(e=>{const meta={pausa_inicio:{l:"Pausa",bg:"#FEF3C7",col:"#B45309",icon:"⏸"},pausa_fim:{l:"Retorno",bg:"#D1FAE5",col:"#10B981",icon:"▶️"},nota:{l:"Nota",bg:"#EDE9FE",col:"#7C3AED",icon:"📝"}};const m=meta[e.type]||{l:e.type,bg:"#f3f4f6",col:"#555",icon:"•"};return(<div key={e.id} style={{display:"flex",alignItems:"flex-start",gap:10,padding:"10px 0",borderBottom:"1px solid #f3f4f6"}}><div style={{width:32,height:32,borderRadius:10,background:m.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0}}>{m.icon}</div><div style={{flex:1}}><div style={{display:"flex",justifyContent:"space-between"}}><div><span style={{fontWeight:700,fontSize:13}}>{e.spec_name}</span><span style={{marginLeft:8,padding:"1px 8px",borderRadius:20,fontSize:11,fontWeight:600,background:m.bg,color:m.col}}>{m.l}</span></div><span style={{fontSize:11,color:"#aaa"}}>{new Date(e.created_at).toLocaleString("pt-BR")}</span></div>{e.detail&&e.detail!=="—"&&<div style={{fontSize:12,color:"#888",marginTop:3}}>{e.detail}</div>}{e.by_user&&<div style={{fontSize:11,color:"#7C3AED",marginTop:3}}>👤 {e.by_user}</div>}</div></div>);})}</div>)}
      {tab==="Histórico"&&(<div><div style={{display:"flex",gap:6,marginBottom:12,flexWrap:"wrap",alignItems:"center"}}>{Object.keys(histFilters).map(hf=><button key={hf} style={{padding:"7px 16px",borderRadius:10,border:`2px solid ${hFilter===hf?"#7C3AED":"#e5e7eb"}`,background:hFilter===hf?"#EDE9FE":"#fff",color:hFilter===hf?"#7C3AED":"#888",fontSize:13,fontWeight:hFilter===hf?700:400,cursor:"pointer"}} onClick={()=>setHFilter(hf)}>{hf}</button>)}<span style={{marginLeft:"auto",fontSize:13,color:"#888",fontWeight:500}}>{filteredHist.length} registros</span></div><div style={C.card}>{!filteredHist.length&&<div style={{fontSize:13,color:"#888",textAlign:"center",padding:"2rem"}}>Nenhum registro.</div>}{filteredHist.map((h,i)=>{const qInfo=QUEUES.find(q=>q.id===h.queue_id);return(<div key={h.id} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 0",borderBottom:"1px solid #f3f4f6",flexWrap:"wrap"}}><span style={{fontSize:11,color:"#ccc",minWidth:24,textAlign:"right",fontWeight:600}}>{filteredHist.length-i}</span><span style={{padding:"2px 10px",borderRadius:20,fontSize:11,fontWeight:700,background:qInfo?.light||"#f3f4f6",color:qInfo?.color||"#555"}}>{qInfo?.icon} {qInfo?.label}</span>{h.type!=="normal"&&<span style={{padding:"2px 10px",borderRadius:20,fontSize:11,fontWeight:700,background:"#FEF3C7",color:"#B45309"}}>{h.type}</span>}<span style={{flex:1,fontSize:13,fontWeight:700}}>{h.spec_name}</span>{h.by_user&&<span style={{fontSize:11,color:"#7C3AED",background:"#EDE9FE",padding:"1px 8px",borderRadius:20,fontWeight:600}}>👤 {h.by_user}</span>}<span style={{fontSize:11,color:"#aaa"}}>{new Date(h.created_at).toLocaleString("pt-BR")}</span></div>);})}</div>{dayLog.length>0&&(<><div style={{fontWeight:700,fontSize:14,margin:"20px 0 12px"}}>☀️ Fechamentos de dia</div>{dayLog.map(d=>(<div key={d.id} style={{...C.card,borderLeft:"4px solid #7C3AED"}}><div style={{display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:8}}><div><div style={{fontWeight:700,fontSize:14,textTransform:"capitalize"}}>{d.closed_label}</div><div style={{fontSize:12,color:"#888",marginTop:2}}>👤 {d.closed_by} · {new Date(d.created_at).toLocaleString("pt-BR")}</div></div><div style={{display:"flex",gap:12}}><div style={{textAlign:"center",background:"#EDE9FE",borderRadius:10,padding:"6px 14px"}}><div style={{fontSize:11,color:"#7C3AED",fontWeight:600}}>Normal</div><div style={{fontSize:22,fontWeight:800,color:"#7C3AED"}}>{d.total_normal}</div></div><div style={{textAlign:"center",background:"#FEF3C7",borderRadius:10,padding:"6px 14px"}}><div style={{fontSize:11,color:"#B45309",fontWeight:600}}>Indicações</div><div style={{fontSize:22,fontWeight:800,color:"#B45309"}}>{d.total_ind}</div></div></div></div>{d.summary?.length>0&&<div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:10}}>{d.summary.map(sm=>{const qi=QUEUES.find(q=>q.label===sm.queue);return<div key={sm.queue} style={{padding:"4px 12px",borderRadius:20,fontSize:12,fontWeight:600,background:qi?.light||"#f3f4f6",color:qi?.color||"#555"}}>{qi?.icon} {sm.queue} · {sm.normal}N{sm.ind>0?` · ${sm.ind}I`:""}</div>;})}</div>}</div>))}</>)}</div>)}
    </div>
  );
}
