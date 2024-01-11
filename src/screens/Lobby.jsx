import React, { useState, useCallback, useEffect } from "react";
import { useNavigate, } from "react-router-dom";
import { useSocket } from "../context/SocketProvider";
import { config } from "../config";
import axios from 'axios';
import { toastAction } from "../toast/toast";
import { confirmAlert } from 'react-confirm-alert'; // Import
import 'react-confirm-alert/src/react-confirm-alert.css'; // Import css

// const messaging = firebase.messaging(firebaseApp);

const LobbyScreen = () => {
  const [email, setEmail] = useState("");
  const [room, setRoom] = useState("");
  const [userList, setUserList] = useState("");
  const [currentUser, setCurrentUser] = useState("");
  const [notificationComing, setNotificationComing] = useState(false);
  const [notificationData, setNotificationData] = useState('');

  const socket = useSocket();
  const navigate = useNavigate();
  // const audio = new Audio("https://2u039f-a.akamaihd.net/downloads/ringtones/files/mp3/16796-download-iphone-7-ringtone-iphone-ringtones-47717.mp3");


  const getUserList = () => {
    let userData = JSON.parse(localStorage.getItem('user'))

    let header = new Headers({
      'Content-Type': 'application/json',
      "Authorization": 'Bearer ' + userData.token
    });
    const requestOptions = {
      method: "GET",
      headers: header,
      // body: JSON.stringify(userData)
    }
    fetch(`${config.url}/getUserList`, requestOptions)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json(); // Parse the JSON response
      })
      .then(user => {
        console.log('user__________', user.data);
        let userData = localStorage.getItem('user');
        let parseData = JSON.parse(userData)
        if (user && user.data) {

          setUserList(user.data)
          // navigate(`/lobby`);
        } else {
          console.log('No Data Found');
          toastAction.show('User Not Found')
          // alert('Invalid Credential');
        }
      })
      .catch(error => {
        toastAction.show('Error while fetch')
        console.error('Error:', error);
      });
  }

  const handleSubmitForm = useCallback(
    (data) => {
      // e.preventDefault();
      let userData = localStorage.getItem('user');
      let parseData = JSON.parse(userData)
      console.log('userData________', parseData);
      console.log('socket__________', socket);
      let socketPayload = {
        email: parseData.email,
        fromDeviceId: parseData.deviceId,
        room: parseData.email + "_" + data.email,
        to: data.email
      }
      console.log('socketPayload________', socketPayload);
      axios.post(
        config.fcmEndpoint,
        {
          to: data.deviceId,
          notification: {
            title: "Calling",
            body: `Incoming Call From ${parseData.email}Calling`
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `key=${config.FCM_SERVER_KEY}`,
          },
        }
      )
        .then(response => {
          socket.emit("room:join", socketPayload);
          console.log('FCM response:', response.data);
        })
        .catch(error => {
          console.error('Error sending push notification:', error.message);
        });
    },
    [email, room, socket]
  );

  const answerCall = useCallback(
    () => {
      console.log('notificationData______', notificationData);
      config.audio.pause();
      let userData = localStorage.getItem('user');
      let parseData = JSON.parse(userData)
      console.log('userData________', parseData);
      console.log('socket__________', socket);
      let socketPayload = {
        email: parseData.email,
        room: notificationData.room,
        to: notificationData.from
      }
      console.log('socketPayload________', socketPayload);
      axios.post(
        config.fcmEndpoint,
        {
          to: notificationData.fromDeviceId,
          notification: {
            title: "Call Picked Up",
            body: `By  ${parseData.email}`,
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `key=${config.FCM_SERVER_KEY}`,
          },
        }
      )
        .then(response => {
          socket.emit("room:join", socketPayload);
          console.log('FCM response:', response.data);
        })
        .catch(error => {
          console.error('Error sending push notification:', error.message);
        });
    },
    [email, room, socket, notificationData]
  );

  const handleJoinRoom = useCallback(
    (data) => {
      // audio.pause();
      const { email, room } = data;
      navigate(`/app/room/${room}`);
    },
    [navigate]
  );

  const checkIncomingCall = (data) => {
    console.log('data____________', data);
    let userData = localStorage.getItem('user');
    let parseData = JSON.parse(userData)
    console.log('userData_______', userData);
    if (data.to === parseData.email) {
      setNotificationComing(true)
      setNotificationData(data)

      config.audio.play();

    }
  }

  const setCurrentUserData = (data) => {
    console.log('data____________', data);
    let userData = localStorage.getItem('user');
    let parseData = JSON.parse(userData);
    setCurrentUser(parseData);
  }

  const unableConnect = (data) => {
    console.log('data____________unableConnect', data);
    toastAction.show(data.message)
  }

  const userBusy = (data) => {
    console.log('data________userBusy', data);
    confirmAlert({
      title: 'User Busy',
      message: data.message,
      buttons: [
        {
          label: 'Ok',
          // onClick: () => alert('Click Yes')
        },

      ]
    });
  }

  const handleEndedCall = useCallback((data) => {
    console.log('data_______________socket.id', data, socket.id);
    let userData = localStorage.getItem('user');
    let parseData = JSON.parse(userData);
    if (data && data.toEmail == parseData.email) {
      window.location.reload();
    }
    // socket.emit("end:call", { to: remoteSocketId });
  }, []);

  const handleCallEnd = useCallback(() => {
    console.log('notificationData_______', notificationData);
    // socket.emit("end:call", { to: remoteSocketId, from: socket.id, toEmail: toEmail, room: roomId });
    // navigate(`/lobby`);
    socket.emit("end:call", { to: null, from: socket.id, toEmail: notificationData .email, room: notificationData.room });
    window.location.reload();
  }, [notificationData]);

  useEffect(() => {
    setCurrentUserData();
    getUserList();
    socket.on("room:join", handleJoinRoom);
    return () => {
      socket.off("room:join", handleJoinRoom);
    };
  }, [socket, handleJoinRoom,]);


  useEffect(() => {
    socket.on('notify:user', checkIncomingCall)
    socket.on('unable:connect', unableConnect)
    socket.on('user:busy', userBusy)
    socket.on("end:call", handleEndedCall);
    return () => {
      socket.off("notify:user", checkIncomingCall);
      socket.off("unable:connect", unableConnect);
      socket.off("user:busy", userBusy);
      socket.off("end:call", handleEndedCall);
    };
  }, [checkIncomingCall, unableConnect, userBusy, handleEndedCall])


  console.log('CUr_____', currentUser);
  return (
    <div >
      <h3>Hello {currentUser && currentUser.email ? currentUser.email : "-"}</h3>
      <h1>You are in lobby section</h1>
      {/* <form onSubmit={handleSubmitForm}>
        <label htmlFor="email">Email ID</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <br />
        <label htmlFor="room">Room Number</label>
        <input
          type="text"
          id="room"
          value={room}
          onChange={(e) => setRoom(e.target.value)}
        />
        <br />
        <button>Join</button>
      </form> */}
      {notificationComing ? <><button class="button-36" style={{ margin: '10px' }} onClick={answerCall}>Answer</button>
        <button class="button-37" onClick={handleCallEnd}>End </button></> :
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {userList && userList.length > 0 ?
            userList.map((element) => (
              <>
                <p class='.button-41:hover .button-41:focus' style={{
                  cursor: 'pointer', padding: '10px',
                  margin: '5px',
                  border: '1px solid black',
                  width: '50%', // Set the content size width
                  textAlign: 'center',
                }} onClick={() => handleSubmitForm(element)}>
                  {element.email}
                </p>
              </>
            ))
            :
            <h3>No User Found</h3>}
        </div>
      }

    </div>
  );
};

export default LobbyScreen;
