/* ---------- Anonymous ID ---------- */
let anonID = localStorage.getItem("anonID_v1");
if(!anonID){
  anonID = "anon-" + Math.random().toString(36).substr(2,9);
  localStorage.setItem("anonID_v1", anonID);
}
document.getElementById("anonDisplay").textContent = anonID;

/* ---------- KIRIM KRITIK ---------- */
document.getElementById("sendBtn").addEventListener("click", ()=>{

  const divisi = document.getElementById("divisi").value;
  const target = document.getElementById("target").value;
  const judul  = document.getElementById("judul").value.trim();
  const kritik = document.getElementById("kritik").value.trim();
  const statusArea = document.getElementById("statusArea");

  if(!divisi || !target || !kritik){
    alert("Isi Divisi, Target, dan Kritik.");
    return;
  }

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
    statusArea.textContent = "⚡ Kritik berhasil dikirim. Terima kasih!";
    document.getElementById("judul").value="";
    document.getElementById("kritik").value="";
    setTimeout(()=> statusArea.style.display="none",4500);
  });

});
