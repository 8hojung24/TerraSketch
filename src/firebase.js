//firebase.js
import firebase from "firebase/compat/app"
import 'firebase/compat/firestore';

// firebase 설정과 관련된 개인 정보
const firebaseConfig = {
  apiKey: "AIzaSyAS8D3VdygxkBb9sQRrL5QVkMM2F6ZRsjI",
  authDomain: "terrasketch-5bf1a.firebaseapp.com",
  databaseURL: "https://terrasketch-5bf1a-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "terrasketch-5bf1a",
  storageBucket: "terrasketch-5bf1a.appspot.com",
  messagingSenderId: "388837547106",
  appId: "1:388837547106:web:16d17806b7424a3a04453b"
};

// firebaseConfig 정보로 firebase 시작
firebase.initializeApp(firebaseConfig);

// firebase의 firestore 인스턴스를 변수에 저장
const firestorecode = firebase.firestore();

// 필요한 곳에서 사용할 수 있도록 내보내기
// 다른 곳에서 불러올때 아래 이름으로 불러와야 함!!
export { firestorecode };