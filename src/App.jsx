import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
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
const supabase = createClient(SB_URL, SB_KEY);
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
  const [presM,setPresM]=useState({y:new Date().getFullYear(),m:new Date().getMonth()
