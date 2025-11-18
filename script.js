// Proteksi
document.addEventListener("contextmenu", e=>e.preventDefault());
document.addEventListener("selectstart", e=>e.preventDefault());
document.addEventListener("keydown", e=>{
  if(e.key==="F12"||(e.ctrlKey&&["u","U","c","C","x","X","s","S","a","A"].includes(e.key))||
     (e.ctrlKey&&e.shiftKey&&["I","i","J","j"].includes(e.key))) e.preventDefault();
});

// Firebase
const firebaseConfig = {
  apiKey:"AIzaSyDpPEkKbEt6b_v2OWlBfGuaVQpBg2-RWR4",
  authDomain:"cwu-gen-2.firebaseapp.com",
  databaseURL:"https://cwu-gen-2-default-rtdb.firebaseio.com",
  projectId:"cwu-gen-2",
  storageBucket:"cwu-gen-2.appspot.com",
  messagingSenderId:"40585612014",
  appId:"1:40585612014:web:c88141fee3699aca68181ff"
};
firebase.initializeApp(firebaseConfig);
const db=firebase.database();

// Utility
const escapeHtml=s=>!s&&s!==0?'':String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
const formatDate=iso=>{ try{ return new Date(iso).toLocaleString('id-ID'); }catch(e){ return iso; } };
const generateRandomId=()=>Math.floor(10000+Math.random()*90000).toString();

const restartBtn=document.getElementById('restartBtn');
const resultDiv=document.getElementById('result');
const message=document.getElementById('message');
const inputId=document.getElementById('inputId');
const newIdDisplay=document.getElementById('newIdDisplay');

let kritikListenerSet = false;
let currentNama = '';

inputId.addEventListener('input', ()=>cekId(inputId.value.trim()));

async function cekId(id){
  resultDiv.innerHTML=''; newIdDisplay.textContent=''; restartBtn.style.display='none';
  kritikListenerSet = false;
  if(!id){ message.textContent='Masukkan ID unik'; message.style.display='block'; return; }
  try{
    const snap=await db.ref('anggota/'+id).once('value');
    const anggota=snap.val();
    if(!anggota){ message.textContent='ID tidak ditemukan, segera hubungi ADMIN.'; message.style.display='block'; return; }
    message.style.display='none';
    currentNama = anggota.nama;
    resultDiv.innerHTML=`<h3>Nama: ${anggota.nama} | Divisi: ${anggota.divisi}</h3>`;
    restartBtn.style.display='inline-block';
    setupKritikListener(currentNama);
  }catch(e){ message.textContent=e.message; message.style.display='block'; }
}

function setupKritikListener(nama){
  if(kritikListenerSet) return;
  kritikListenerSet = true;

  db.ref('kritik').on('value', snap=>{
    const kritikObj = snap.val() || {};
    const arr = Object.keys(kritikObj)
      .map(k => ({id:k, ...kritikObj[k]}))
      .filter(k => (k.target||'').toLowerCase() === (nama||'').toLowerCase());
    
    resultDiv.innerHTML = `<h3>Nama: ${nama}</h3>`;
    if(arr.length===0){ resultDiv.innerHTML+=`<p style="color:#888">Belum ada kritik.</p>`; return; }

    const table=document.createElement('table');
    table.innerHTML=`<thead><tr><th>No</th><th>Tanggal/Waktu</th><th>Judul</th><th>Kritik</th><th>Status</th><th>Aksi</th></tr></thead>`;
    const tbody=document.createElement('tbody');
    arr.sort((a,b)=>new Date(b.waktu)-new Date(a.waktu));
    arr.forEach((k,idx)=>{
      let statusClass='';
      if(k.status==='pending') statusClass='status-pending';
      else if(k.status==='ditindaklanjuti') statusClass='status-ditindaklanjuti';
      else if(k.status==='selesai') statusClass='status-selesai';
      const btn=(k.status==='selesai')?'':`<button class="action-btn" onclick="markSelesai('${k.id}')">Telah Dibaca</button>`;
      const tr=document.createElement('tr');
      tr.innerHTML=`<td>${idx+1}</td><td>${formatDate(k.waktu)}</td><td>${escapeHtml(k.judul||'-')}</td><td>${escapeHtml(k.kritik||'-')}</td><td><span class="status-badge ${statusClass}">${k.status||'-'}</span></td><td>${btn}</td>`;
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    resultDiv.appendChild(table);
  });
}

window.markSelesai=async function(id){
  if(!confirm('Tandai kritik ini telah dibaca (selesai)?')) return;
  await db.ref('kritik/'+id).update({status:'selesai'});
}

restartBtn.addEventListener('click', async ()=>{
  const oldId=inputId.value.trim();
  if(!oldId){ alert('Masukkan ID unik dulu'); return; }
  const pilihan=prompt("Pilih metode restart:\n1 = Otomatis 5 digit\n2 = Masukkan ID sendiri (max 5 angka)");
  if(!pilihan) return;
  if(pilihan==='1'){ if(confirm('Restart otomatis 5 digit?')) restartOtomatis(oldId); }
  else if(pilihan==='2'){
    let manualId=prompt("Masukkan ID baru (max 5 angka):");
    if(!manualId) return;
    if(manualId.length>5){ alert('ID maksimal 5 angka'); return; }
    if(confirm(`Gunakan ID ${manualId} sebagai ID baru?`)) restartManual(oldId,manualId);
  } else{ alert("Pilihan tidak valid"); return; }
});

async function restartOtomatis(oldId){
  try{
    const snap=await db.ref('anggota/'+oldId).once('value');
    if(!snap.exists()){ alert('ID lama tidak ditemukan'); return; }
    const dataLama=snap.val(); await db.ref('anggota/'+oldId).remove();
    let newId=generateRandomId();
    while((await db.ref('anggota/'+newId).once('value')).exists()) newId=generateRandomId();
    await db.ref('anggota/'+newId).set({nama:dataLama.nama||'',divisi:dataLama.divisi||'',dibuat:new Date().toISOString()});
    inputId.value=newId; newIdDisplay.textContent=`ID baru Anda: ${newId}`;
    localStorage.removeItem('kodeValid'); localStorage.removeItem('namaUser');
    alert('ID berhasil direstart otomatis');
  }catch(err){ alert(err.message); console.error(err); }
}

async function restartManual(oldId,manualId){
  try{
    const snap=await db.ref('anggota/'+oldId).once('value');
    if(!snap.exists()){ alert('ID lama tidak ditemukan'); return; }
    const dataLama=snap.val();
    if((await db.ref('anggota/'+manualId).once('value')).exists()){ alert('ID baru sudah digunakan'); return; }
    await db.ref('anggota/'+oldId).remove();
    await db.ref('anggota/'+manualId).set({nama:dataLama.nama||'',divisi:dataLama.divisi||'',dibuat:new Date().toISOString()});
    inputId.value=manualId; newIdDisplay.textContent=`ID baru Anda: ${manualId}`;
    localStorage.removeItem('kodeValid'); localStorage.removeItem('namaUser');
    alert('ID berhasil diubah secara manual');
  }catch(err){ alert(err.message); console.error(err); }
}
