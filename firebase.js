/* firebase-config.js */

const firebaseConfig = {
  apiKey: "AIzaSyDpPEkKbEt6b_v2OWlBfGuaVQpBg2-RWR4",
  authDomain: "cwu-gen-2.firebaseapp.com",
  databaseURL: "https://cwu-gen-2-default-rtdb.firebaseio.com",
  projectId: "cwu-gen-2",
  storageBucket: "cwu-gen-2.appspot.com",
  messagingSenderId: "40585612014",
  appId: "1:40585612014:web:c88141fee3699aca68181ff"
};

// Inisialisasi Firebase dan Database
firebase.initializeApp(firebaseConfig);
const db = firebase.database();