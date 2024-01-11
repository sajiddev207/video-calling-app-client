
importScripts("https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js");
importScripts(
  "https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js"
);

const firebaseConfig = {
    apiKey: "AIzaSyA7C-s2axLwc4raYRik-6h92srvGSKFXq4",
    authDomain: "client-61820.firebaseapp.com",
    projectId: "client-61820",
    storageBucket: "client-61820.appspot.com",
    messagingSenderId: "241579686208",
    appId: "1:241579686208:web:3a7df9567f8c71fb0fe2a5",
    measurementId: "G-6YM4G13GMM"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log(
    "[firebase-messaging-sw.js] Received background message ",
    payload
  );
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.image,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});