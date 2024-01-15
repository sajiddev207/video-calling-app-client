import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../context/SocketProvider";
import axios from "axios";
import { getToken } from "firebase/messaging";
import messaging from '../firebaseConfig'
import { toastAction } from "../toast/toast";
import { config } from "../config";
import './style.css'
// import './style.css'

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [userPass, setUserPass] = useState("");
  const [room, setRoom] = useState("");
  const [token, setToken] = useState("");


  const socket = useSocket();
  const navigate = useNavigate();

  const handleSubmitForm = useCallback(
    (e) => {
      e.preventDefault();
      const userData = {
        email: email,
        userPass: userPass,
        deviceId: token
      };
      let header = new Headers({
        'Content-Type': 'application/json',
        // "Authorization": authHeader().Authorization
      });
      const requestOptions = {
        method: "POST",
        headers: header,
        body: JSON.stringify(userData)
      }
      fetch(`${config.url}/loginUser`, requestOptions)
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.json(); // Parse the JSON response
        })
        .then(user => {
          if (user && user.data) {
            console.log('User data received:', user.data);
            localStorage.setItem('user', JSON.stringify(user.data));
            navigate(`/app/lobby`);
            window.location.reload();
          } else {
            console.log('Invalid Credential');
            toastAction.show('Invalid Credential')
          }
        })
        .catch(error => {
          console.error('Error:', error);
          toastAction.show(error)
        });
    },
    [email, userPass]
  );

  const handleJoinRoom = useCallback(
    (data) => {
      const { email, room } = data;
      navigate(`/app/room/${room}`);
    },
    [navigate]
  );

  const requestPermission = () => {
    console.log('Requesting permission...');
    Notification.requestPermission().then((permission) => {
      if (permission === 'granted') {
        console.log('Notification permission granted.');
        getToken(messaging, { vapidKey: config.Vapid_Key }).then((data) => {
          console.log(data)
          setToken(data);
        }).catch((err) => {
          console.log('err_____', err);
        });
      } else {
        console.log('Notification BLOCKED____________.');
        alert('Please Give Permission...');

      }
    }
    ).catch((err) => {
      alert('Notification Permission Denied');
      console.log('Permission Denied', err);
    })
  }

  useEffect(() => {
    requestPermission();
    socket.on("room:join", handleJoinRoom);
    return () => {
      socket.off("room:join", handleJoinRoom);
    };
  }, [socket, handleJoinRoom]);
  console.log('___________LOGIN________', email, userPass);

  return (
    <>
      {/* <div>
      <h1>User Login</h1>
      <form onSubmit={handleSubmitForm}>
        <label htmlFor="email">Email ID</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <br />
        <br />
        <button>Login</button>
      </form>
    </div> */}
      <div class="login-page">
        <div class="form">
          <div class="login">
            <div class="login-header">
              <h3>LOGIN</h3>
              <p>Please enter your credentials to login.</p>
            </div>
          </div>
          <form class="login-form">
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              placeholder="Email..."
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              id="userPass"
              name="userPass"
              value={userPass}
              placeholder="Password..."
              onChange={(e) => setUserPass(e.target.value)}
            />
            <button onClick={handleSubmitForm}>login</button>
            {/* <p class="message">Not registered? <a href="#">Create an account</a></p> */}
          </form>
        </div>
      </div>
    </>
  );
};

export default LoginScreen;
