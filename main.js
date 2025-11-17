/* main.js */

// Pastikan variabel 'db' sudah tersedia dari firebase-config.js

/* ---------- Anonymous ID ---------- */
let anonID = localStorage.getItem("anonID_v1");
if(!anonID){
  anonID = "anon-" + Math.random().toString(36).substr(2,9);
  localStorage.setItem("anonID_v1", anonID);
}
document.getElementById("anonDisplay").textContent = anonID;

/* ---------- DOM ELEMENTS ---------- */
const divisiSelect = document.getElementById("divisi");
const targetSelect = document.getElementById("target");
const sendBtn = document.getElementById("sendBtn");
const statusArea = document.getElementById("statusArea");
const kritikList = document.getElementById("kritikList"); // Pastikan div ini ada di HTML

/* ---------- UTILITY FUNCTIONS ---------- */

function setDivisiOptions(list){
  divisiSelect.innerHTML = '<option value="">Pilih Divisi</option>';
  list.forEach(d=>{
    divisiSelect.innerHTML += `<option value="${d}">${d}</option>`;
  });
}

function loadKritik(){
  if (!kritikList) return; 

  db.ref("kritik").orderByChild("waktu").once("value").then(s=>{
    kritikList.innerHTML = "";
    s.forEach(ch=>{
      const k = ch.val();
      const card = document.createElement("div");
      card.className = "kritik-card";
      card.innerHTML = `
        <h3>${k.judul || "(tanpa judul)"}</h3>
        <p><b>Divisi:</b> ${k.divisi} | <b>Target:</b> ${k.target}</p>
        <p>${k.kritik}</p>
        <small>Status: ${k.status} | Waktu: ${new Date(k.waktu).toLocaleString()}</small>
      `;
      kritikList.prepend(card); // Menambahkan di depan agar yang terbaru di atas
    });
  }).catch(error => {
    console.error("Gagal memuat kritik:", error);
  });
}

/* ---------- EVENT LISTENERS & INITIAL LOAD ---------- */

// 1. Load Divisi saat aplikasi dibuka
db.ref("divisi").once("value").then(s=>{
  const v = s.val();
  if(v){
    // Mengambil nilai 'nama' dari setiap objek divisi
    const arr = Object.keys(v).map(k=>v[k].nama);
    setDivisiOptions(arr);
  } else {
    // Default jika data divisi kosong
    setDivisiOptions(["Bpi","Medinfo","Network","Kwu","Inbis"]);
  }
}).catch(error => {
    console.error("Gagal memuat divisi:", error);
});


// 2. Load Target ketika Divisi dipilih
divisiSelect.addEventListener("change", ()=>{
  const d = divisiSelect.value;
  targetSelect.innerHTML = '<option>Memuat...</option>';

  if(!d){
    targetSelect.innerHTML = '<option value="">Pilih Target</option>';
    return;
  }

  db.ref("anggota").orderByChild("divisi").equalTo(d).once("value").then(s=>{
    targetSelect.innerHTML = '<option value="">Pilih Target</option>';
    s.forEach(ch=>{
      targetSelect.innerHTML += `<option value="${ch.val().nama}">${ch.val().nama}</option>`;
    });
  }).catch(error => {
    console.error("Gagal memuat target:", error);
  });
});

// 3. Kirim Kritik ketika tombol ditekan
sendBtn.addEventListener("click", ()=>{
  const divisi = divisiSelect.value;
  const target = targetSelect.value;
  const judul  = document.getElementById("judul").value.trim();
  const kritik = document.getElementById("kritik").value.trim();

  if(!divisi || !target || !kritik){
    alert("Isi Divisi, Target, dan Kritik.");
    return;
  }

  // Menonaktifkan tombol saat mengirim
  sendBtn.disabled = true;
  sendBtn.textContent = "Mengirim...";

  const payload = {
    pengirim: anonID,
    divisi,
    target,
    judul: judul || "(tanpa judul)",
    kritik,
    status:"pending",
    waktu: new Date().toISOString()
  };

  db.ref("kritik").push().set(payload).then(()=>{
    statusArea.style.display = "block";
    statusArea.textContent = "Berhasil dikirim. Terima kasih!";
    document.getElementById("judul").value="";
    document.getElementById("kritik").value="";
    
    // Mengaktifkan kembali tombol
    sendBtn.disabled = false;
    sendBtn.textContent = "KIRIM";

    setTimeout(()=> statusArea.style.display="none",4500);
    loadKritik();
  }).catch(error => {
    // Handle error jika pengiriman gagal
    statusArea.style.display = "block";
    statusArea.textContent = "❌ Gagal mengirim: " + error.message;
    sendBtn.disabled = false;
    sendBtn.textContent = "KIRIM";
    setTimeout(()=> statusArea.style.display="none",6000);
  });
});
const cekUserBtn = document.getElementById("cekUserBtn");

cekUserBtn.addEventListener("click", () => {
  window.location.href = "cek_user.html"; // langsung ke halaman cek_user.html
});


// 4. Load kritik saat halaman dibuka
loadKritik();
                         
