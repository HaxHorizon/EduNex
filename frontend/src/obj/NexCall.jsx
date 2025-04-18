import React, { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";

const VideoCall = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isCalling, setIsCalling] = useState(false);
  const [isReceivingCall, setIsReceivingCall] = useState(false);
  const [caller, setCaller] = useState(null);
  const [screenSharing, setScreenSharing] = useState(false);
  const videoRef = useRef(null);
  const peerRef = useRef(null);
  const socket = useRef(null);

  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  // Fetch users
  useEffect(() => {
    fetch("http://localhost:5000/api/users", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setUsers(data));
  }, [token]);

  // Initialize socket connection
  useEffect(() => {
    socket.current = io("http://localhost:5000", {
      query: { token },
      transports: ["websocket"],
    });

    // Listen for incoming call
    socket.current.on("incoming_call", (caller) => {
      setIsReceivingCall(true);
      setCaller(caller);
    });

    // Listen for the answer to the call
    socket.current.on("call_accepted", (peerId) => {
      startVideoCall(peerId);
    });

    // Listen for screen sharing status
    socket.current.on("screen_sharing", (isScreenSharing) => {
      setScreenSharing(isScreenSharing);
    });

    return () => {
      socket.current.disconnect();
    };
  }, [token]);

  // Request a video call
  const requestVideoCall = (user) => {
    socket.current.emit("video_call_request", user._id);
    setIsCalling(true);
  };

  // Accept the incoming video call
  const acceptCall = () => {
    socket.current.emit("accept_call", caller._id);
    startVideoCall(caller._id);
  };

  // Reject the incoming video call
  const rejectCall = () => {
    setIsReceivingCall(false);
    socket.current.emit("reject_call", caller._id);
  };

  // Start the video call
  const startVideoCall = (peerId) => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        videoRef.current.srcObject = stream;
        peerRef.current = new RTCPeerConnection();

        stream.getTracks().forEach((track) => {
          peerRef.current.addTrack(track, stream);
        });

        peerRef.current.onicecandidate = (e) => {
          if (e.candidate) {
            socket.current.emit("candidate", { candidate: e.candidate, peerId });
          }
        };

        peerRef.current.ontrack = (e) => {
          const remoteStream = e.streams[0];
          const remoteVideo = document.getElementById("remote-video");
          remoteVideo.srcObject = remoteStream;
        };

        socket.current.emit("start_call", peerId);

        peerRef.current.createOffer().then((offer) => {
          return peerRef.current.setLocalDescription(offer);
        }).then(() => {
          socket.current.emit("offer", { offer: peerRef.current.localDescription, peerId });
        });
      })
      .catch((err) => {
        console.error("Error getting media devices:", err);
      });
  };

  // Start screen sharing
  const startScreenSharing = () => {
    navigator.mediaDevices
      .getDisplayMedia({ video: true })
      .then((stream) => {
        setScreenSharing(true);
        const screenTrack = stream.getTracks()[0];
        const sender = peerRef.current.getSenders().find((s) => s.track.kind === "video");
        sender.replaceTrack(screenTrack);

        socket.current.emit("screen_sharing", true);
      })
      .catch((err) => {
        console.error("Error sharing screen:", err);
      });
  };

  // Stop screen sharing
  const stopScreenSharing = () => {
    setScreenSharing(false);
    socket.current.emit("screen_sharing", false);

    // Revert back to the original video track
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        const videoTrack = stream.getVideoTracks()[0];
        const sender = peerRef.current.getSenders().find((s) => s.track.kind === "video");
        sender.replaceTrack(videoTrack);
      })
      .catch((err) => {
        console.error("Error reverting screen share:", err);
      });
  };

  return (
    <div className="video-call">
      {/* Left sidebar for users */}
      <div className="user-list">
        <h2>Select a user to video call</h2>
        {users.map((user) => (
          <div key={user._id} onClick={() => requestVideoCall(user)}>
            {user.fullName}
          </div>
        ))}
      </div>

      {/* Video call section */}
      <div className="video-call-container">
        <h3>Video Call</h3>

        {isReceivingCall && (
          <div className="incoming-call">
            <p>{caller.fullName} is calling...</p>
            <button onClick={acceptCall}>Accept</button>
            <button onClick={rejectCall}>Reject</button>
          </div>
        )}

        {isCalling && !isReceivingCall && <p>Calling...</p>}

        <div className="video-chat">
          <video ref={videoRef} id="local-video" autoPlay muted />
          <video id="remote-video" autoPlay />

          {/* Screen sharing button */}
          {!screenSharing ? (
            <button onClick={startScreenSharing}>Start Screen Sharing</button>
          ) : (
            <button onClick={stopScreenSharing}>Stop Screen Sharing</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoCall;
