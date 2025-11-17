document.addEventListener("contextmenu", e => e.preventDefault());
document.addEventListener("selectstart", e => e.preventDefault());
document.addEventListener("keydown", e => {
  if (
    e.key === "F12" ||
    (e.ctrlKey && ["u","U","c","C","x","X","s","S","a","A"].includes(e.key)) ||
    (e.ctrlKey && e.shiftKey && ["I","i","J","j"].includes(e.key))
  ) e.preventDefault();
});

const firebaseConfig = {
  apiKey: "AIzaSyDpPEkKbEt6b_v2OWlBfGuaVQpBg2-RWR4",
  authDomain: "cwu-gen-2.firebaseapp.com",
  databaseURL: "https://cwu-gen-2-default-rtdb.firebaseio.com",
  projectId: "cwu-gen-2",
  storageBucket: "cwu-gen-2.appspot.com",
  messagingSenderId: "40585612014",
  appId: "1:40585612014:web:c88141fee3699aca68181ff"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

function escapeHtml(s){
  if(!s && s!==0) return '';
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
}

function formatDate(iso){
  try { return new Date(iso).toLocaleString('id-ID'); } catch(e){ return iso; }
}

function generateRandomId(){
  return Math.floor(10000 + Math.random()*90000).toString();
}

// tombol restart disembunyikan default
const restartBtn = document.getElementById('restartBtn');
restartBtn.style.display = 'none';

document.getElementById('cekBtn').addEventListener('click', ()=> {
  const id = document.getElementById('inputId').value.trim();
  const message = document.getElementById('message');
  const resultDiv = document.getElementById('result');
  
  resultDiv.innerHTML='';
  document.getElementById('newIdDisplay').textContent='';
  restartBtn.style.display = 'none'; // sembunyikan dulu

  if(!id){ 
    message.textContent='Masukkan ID unik'; 
    message.style.display='block'; 
    return; 
  }
  message.style.display='none';

  db.ref('anggota/'+id).once('value').then(snap=>{
    const anggota = snap.val();
    if(!anggota){ 
      message.textContent='ID tidak ditemukan,segera hubungi ADMIN.'; 
      message.style.display='block'; 
      return; 
    }

    const header = document.createElement('h3');
    header.textContent = `Nama: ${anggota.nama} | Divisi: ${anggota.divisi}`;
    resultDiv.appendChild(header);

    // tampilkan tombol restart ID setelah data valid
    restartBtn.style.display = 'inline-block';

    db.ref('kritik').once('value').then(snap=>{
      const kritikObj = snap.val()||{};
      const arr = Object.keys(kritikObj)
        .map(k => ({id:k,...kritikObj[k]}))
        .filter(k => (k.target||'').toLowerCase() === (anggota.nama||'').toLowerCase());

      if(arr.length===0){ 
        resultDiv.innerHTML+='<p style="color:#888">Belum ada kritik.</p>'; 
        return; 
      }

      const table = document.createElement('table');
      table.innerHTML=`<thead>
        <tr>
          <th>No</th><th>Tanggal/Waktu</th><th>Judul</th><th>Kritik</th><th>Status</th><th>Aksi</th>
        </tr>
      </thead>`;
      const tbody=document.createElement('tbody');

      arr.sort((a,b)=>new Date(b.waktu)-new Date(a.waktu));
      arr.forEach((k,idx)=>{
        const tr=document.createElement('tr');
        let statusClass='';
        if(k.status==='pending') statusClass='status-pending';
        else if(k.status==='ditindaklanjuti') statusClass='status-ditindaklanjuti';
        else statusClass='status-selesai';

        const btn=(k.status==='selesai')?'':`<button class="action-btn" onclick="markSelesai('${k.id}')">Telah Dibaca</button>`;

        tr.innerHTML=`
          <td>${idx+1}</td>
          <td>${formatDate(k.waktu)}</td>
          <td>${escapeHtml(k.judul||'-')}</td>
          <td>${escapeHtml(k.kritik||'-')}</td>
          <td><span class="status-badge ${statusClass}">${k.status||'-'}</span></td>
          <td>${btn}</td>`;
        tbody.appendChild(tr);
      });
      table.appendChild(tbody);
      resultDiv.appendChild(table);
    });
  });
});

function markSelesai(id){
  if(!confirm('Tandai kritik ini telah dibaca (selesai)?')) return;
  db.ref('kritik/'+id).update({status:'selesai'}).then(()=>{
    document.getElementById('cekBtn').click();
  });
}

restartBtn.addEventListener('click', async ()=>{
  const oldId = document.getElementById('inputId').value.trim();
  const newIdDisplay = document.getElementById('newIdDisplay');
  if(!oldId){ alert('Masukkan ID unik dulu'); return; }
  if(!confirm('Apakah Anda yakin ingin restart ID? (1/2)')) return;
  if(!confirm('Verifikasi 2: Apakah benar ingin restart ID?')) return;

  try {
    const snap = await db.ref('anggota/'+oldId).once('value');
    if(!snap.exists()){ alert('ID lama tidak ditemukan'); return; }
    const dataLama = snap.val();

    await db.ref('anggota/'+oldId).remove();

    let newId = generateRandomId();
    let exists = true;
    while(exists){
      const check = await db.ref('anggota/'+newId).once('value');
      if(check.exists()) newId = generateRandomId();
      else exists = false;
    }

    await db.ref('anggota/'+newId).set({
      nama: dataLama.nama || '',
      divisi: dataLama.divisi || '',
      dibuat: new Date().toISOString()
    });

    localStorage.removeItem('kodeValid');
    localStorage.removeItem('namaUser');

    newIdDisplay.textContent = `ID baru Anda: ${newId}`;
    document.getElementById('inputId').value = newId;
    alert('ID berhasil direstart dan ID baru dibuat. Gunakan ID baru Anda untuk cek kritik.');
    
  } catch(err){
    console.error(err);
    alert('Terjadi kesalahan: '+err.message);
  }
});
