import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyB__t1T_40j6zg-0QdaVu-uk-GwpnSonvg",
  authDomain: "csn-nhom2.firebaseapp.com",
  projectId: "csn-nhom2",
  storageBucket: "csn-nhom2.appspot.com",
  messagingSenderId: "1075854870322",
  appId: "1:1075854870322:web:b17c2eb1abc97d8ae1392b",
  measurementId: "G-MLM6RP4K7Q"
};

firebase.initializeApp(firebaseConfig);
firebase.analytics();

const auth = firebase.auth();
const db = firebase.firestore();

export { auth, db };
export default firebase;