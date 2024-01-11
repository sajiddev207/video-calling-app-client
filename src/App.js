import { Routes, Route } from "react-router-dom";
import "./App.css";
import LoginScreen from "./screens/Login";
import LobbyScreen from "./screens/Lobby";
import RoomPage from "./screens/Room";
import Header from "./screens/Header";
import { PrivateRoute } from "./PrivateRoute";

function App() {
  const userData = JSON.parse(localStorage.getItem('user'));

  return (
    <div className="App">
      {userData ?
        <Header />
        : null}
      <Routes>
        <Route element={<PrivateRoute />}>
          <Route path="/app/lobby" element={<LobbyScreen />} />
          <Route path="/app/room/:roomId" element={<RoomPage />} />
        </Route>
        <Route path="/" element={<LoginScreen />} />

      </Routes>
    </div>
  );
}

export default App;
