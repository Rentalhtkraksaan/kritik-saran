/* ---------- Firebase ---------- */
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

/* ELEMENT */
const divisiSelect = document.getElementById("divisi");
const targetSelect = document.getElementById("target");

/* SET DIVISI */
function setDivisiOptions(list){
  divisiSelect.innerHTML = '<option value="">Pilih Divisi</option>';
  list.forEach(d=>{
    divisiSelect.innerHTML += `<option value="${d}">${d}</option>`;
  });
}

/* LOAD DIVISI */
db.ref("divisi").once("value").then(s=>{
  const v = s.val();
  if(v){
    const arr = Object.keys(v).map(k=>v[k].nama);
    setDivisiOptions(arr);
  } else {
    setDivisiOptions(["Bpi","Medinfo","Network","Kwu","Inbis"]);
  }
});

/* LOAD TARGET */
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
  });
});
