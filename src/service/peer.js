class PeerService {
  constructor() {
    if (!this.peer) {
      this.peer = new RTCPeerConnection({
        iceServers: [
          // {
          //   urls: [
          //     "stun:stun.l.google.com:19302",
          //     "stun:global.stun.twilio.com:3478",
          //   ],
          // },
          {
            urls: "turn:standard.relay.metered.ca:80",
            username: "cfc7f79989f6fcc87677374c",
            credential: "YMknZYAy0rFDWIAH",
          },
          {
            urls: "turn:standard.relay.metered.ca:80?transport=tcp",
            username: "cfc7f79989f6fcc87677374c",
            credential: "YMknZYAy0rFDWIAH",
          },
          {
            urls: "turn:standard.relay.metered.ca:443",
            username: "cfc7f79989f6fcc87677374c",
            credential: "YMknZYAy0rFDWIAH",
          },
          {
            urls: "turns:standard.relay.metered.ca:443?transport=tcp",
            username: "cfc7f79989f6fcc87677374c",
            credential: "YMknZYAy0rFDWIAH",
          },
        ],
      });
    }
  }

  async getAnswer(offer) {
    if (this.peer) {
      await this.peer.setRemoteDescription(offer);
      const ans = await this.peer.createAnswer();
      await this.peer.setLocalDescription(new RTCSessionDescription(ans));
      return ans;
    }
  }

  async setLocalDescription(ans) {
    if (this.peer) {
      await this.peer.setRemoteDescription(new RTCSessionDescription(ans));
    }
  }

  async getOffer() {
    if (this.peer) {
      const offer = await this.peer.createOffer();
      await this.peer.setLocalDescription(new RTCSessionDescription(offer));
      return offer;
    }
  }

  async close() {
    if (this.peer) {
      this.peer.close();
    }
  }
}

export default new PeerService();
