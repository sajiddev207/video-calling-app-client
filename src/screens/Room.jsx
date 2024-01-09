import React, { useEffect, useCallback, useState, } from "react";
import ReactPlayer from "react-player";
import peer from "../service/peer";
import { useSocket } from "../context/SocketProvider";
import { useNavigate, useParams } from "react-router-dom";


const RoomPage = () => {
  const socket = useSocket();
  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [myStream, setMyStream] = useState();
  const [remoteStream, setRemoteStream] = useState();
  const [currentUser, setCurrentUser] = useState("");
  const [sameUser, setSameUser] = useState(false);
  console.log('remoteSocketId________111', remoteSocketId);
  const navigate = useNavigate();
  const { roomId } = useParams();
  const handleUserJoined = useCallback(({ email, id }) => {
    console.log(`remoteSocketId________222${email, id}`);
    setRemoteSocketId(id);
  }, [remoteSocketId]);

  const handleCallUser = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    const offer = await peer.getOffer();
    socket.emit("user:call", { to: remoteSocketId, offer });
    setMyStream(stream);
  }, [remoteSocketId, socket]);

  // const stopSendingStreams = () => {
  //   console.log('Stopping sending streams and turning off camera');
  //   myStream.getTracks().forEach((track) => track.stop());
  //   const senders = peer.peer.getSenders();
  //   console.log('senders_______', senders);
  //   senders.forEach((sender) => {
  //     peer.peer.removeTrack(sender);
  //   });
  //   setMyStream(null);
  // }

  const stopSendingStreams = async () => {
    console.log('remoteSocketId_______', remoteSocketId);
    const toEmail = roomId.split('_')[1];
    console.log('toEmail__________', toEmail);
    const senders = peer.peer.getSenders();
    console.log('senders_________', senders);
    senders.forEach((sender) => {
      peer.peer.removeTrack(sender);
    });
    if (myStream || remoteStream) {
      myStream.getTracks().forEach((track) => track.stop());
      remoteStream.getTracks().forEach((track) => track.stop());
    }
    setMyStream(null);
    setRemoteStream(null);
    await peer.close();
    socket.emit("end:call", { to: remoteSocketId, from: socket.id, toEmail: toEmail, room: roomId });
    navigate(`/lobby`);
    window.location.reload();
  };

  // const stopSendingStreams = useCallback(async () => {
  //   console.log('Stopping sending streams and turning off camera');
  //   myStream.getTracks().forEach((track) => track.stop());
  //   const senders = peer.peer.getSenders();
  //   console.log('senders_______', senders);
  //   senders.forEach((sender) => {
  //     peer.peer.removeTrack(sender);
  //   });
  //   await peer.close();
  //   setMyStream(null);
  //   socket.emit("end:call", { to: remoteSocketId });
  //   console.log('Streams stopped and camera turned off');
  // }, [peer.peer, myStream, socket, remoteSocketId]);


  const handleEndedCall = useCallback(async (data) => {
    console.log('handleEndedCall_______Socket', data.to, currentUser.email, remoteSocketId, socket.id);
    // let userData = localStorage.getItem('user');
    // let parseData = JSON.parse(userData);
    if (data && data.to == socket.id) {
      console.log('2222');
      const senders = peer.peer.getSenders();
      senders.forEach((sender) => {
        peer.peer.removeTrack(sender);
      });
      if (myStream || remoteStream) {
        myStream.getTracks().forEach((track) => track.stop());
        remoteStream.getTracks().forEach((track) => track.stop());
      }
      setMyStream(null);
      setRemoteStream(null);
      await peer.close();
      // socket.emit("end:call", { to: remoteSocketId });
      navigate(`/lobby`);
      window.location.reload();
    }
    // socket.emit("end:call", { to: remoteSocketId });
  }, []);

  const handleIncommingCall = useCallback(
    async ({ from, offer }) => {
      setRemoteSocketId(from);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      setMyStream(stream);
      console.log(`Incoming Call`, from, offer);
      const ans = await peer.getAnswer(offer);
      socket.emit("call:accepted", { to: from, ans });
    },
    [socket]
  );

  const sendStreams = useCallback(() => {
    for (const track of myStream.getTracks()) {
      peer.peer.addTrack(track, myStream);
    }
  }, [myStream]);

  const handleCallAccepted = useCallback(
    ({ from, ans }) => {
      peer.setLocalDescription(ans);
      console.log("Call Accepted!");
      sendStreams();
    },
    [sendStreams]
  );

  const handleNegoNeeded = useCallback(async () => {
    const offer = await peer.getOffer();
    socket.emit("peer:nego:needed", { offer, to: remoteSocketId });
  }, [remoteSocketId, socket]);


  const handleNegoNeedIncomming = useCallback(
    async ({ from, offer }) => {
      const ans = await peer.getAnswer(offer);
      socket.emit("peer:nego:done", { to: from, ans });
    },
    [socket]
  );

  const checkStream = useCallback(async ({ ans }) => {
    console.log('___________', myStream);
  }, []);

  const handleNegoNeedFinal = useCallback(async ({ ans }) => {
    await peer.setLocalDescription(ans);
  }, []);

  const setCurrentUserData = (data) => {
    console.log('data____________', data);
    let userData = localStorage.getItem('user');
    let parseData = JSON.parse(userData)
    let firstUser = roomId.split('_')[0]
    if (firstUser == parseData.email) {
      setSameUser(true)
    }
    setCurrentUser(parseData);
  }

  useEffect(() => {
    peer.peer.addEventListener("negotiationneeded", handleNegoNeeded);
    return () => {
      peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded);
    };
  }, [handleNegoNeeded]);


  useEffect(() => {
    setCurrentUserData();
    peer.peer.addEventListener("track", async (ev) => {
      const remoteStream = ev.streams;
      console.log("GOT TRACKS!!");
      setRemoteStream(remoteStream[0]);
    });
  }, []);

  useEffect(() => {
    socket.on("user:joined", handleUserJoined);
    socket.on("incomming:call", handleIncommingCall);
    socket.on("call:accepted", handleCallAccepted);
    socket.on("peer:nego:needed", handleNegoNeedIncomming);
    socket.on("peer:nego:final", handleNegoNeedFinal);
    socket.on("end:call", handleEndedCall);

    return () => {
      socket.off("user:joined", handleUserJoined);
      socket.off("incomming:call", handleIncommingCall);
      socket.off("call:accepted", handleCallAccepted);
      socket.off("peer:nego:needed", handleNegoNeedIncomming);
      socket.off("peer:nego:final", handleNegoNeedFinal);
      socket.off("end:call", handleEndedCall);
    };
  }, [
    socket,
    handleUserJoined,
    handleIncommingCall,
    handleCallAccepted,
    handleNegoNeedIncomming,
    handleNegoNeedFinal,
    handleEndedCall
  ]);

  return (
    <div>
      <h1>Room Page</h1>
      <h4>{remoteSocketId ? "User Connected" : "No one in room"}</h4>
      {/* {myStream && <button onClick={sendStreams}>Send Stream</button>} */}
      {remoteSocketId && <> <button class="button-41" onClick={handleCallUser}>Send Stream</button>
        <button class="button-40"
          onClick={stopSendingStreams}
        // onClick={handleEndCall}
        >End Call</button></>}
      {/* <button onClick={checkStream}>CALL</button> */}
      {
        remoteSocketId ?
          null :
          <>
            {sameUser ? <button class="button-40"
              onClick={stopSendingStreams}
            // onClick={handleEndCall}
            >End Call</button> : null}
          </>
      }

      {myStream && (
        <>
          <h1>My Stream</h1>
          <ReactPlayer
            playing
            muted
            height="300px"
            width="400px"
            url={myStream}
          />
        </>
      )}
      {remoteStream && (
        <>
          <h1>Remote Stream</h1>
          <ReactPlayer
            playing
            // muted
            height="300px"
            width="400px"
            url={remoteStream}
          />
        </>
      )}
    </div>
  );
};

export default RoomPage;
