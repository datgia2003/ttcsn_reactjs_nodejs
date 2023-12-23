import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyB__t1T_40j6zg-0QdaVu-uk-GwpnSonvg",
  authDomain: "csn-nhom2.firebaseapp.com",
  projectId: "csn-nhom2",
  storageBucket: "csn-nhom2.appspot.com",
  messagingSenderId: "1075854870322",
  appId: "1:1075854870322:web:b17c2eb1abc97d8ae1392b",
  measurementId: "G-MLM6RP4K7Q"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);