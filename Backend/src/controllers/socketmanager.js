import { Server } from "socket.io";

// Store active connections per room
let connections = {};
let messages = {};
let timeOnline = {};

// Attach Socket.IO to HTTP server
const ConnectToSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      allowedHeaders: ["*"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // =====================
    // Join Call (Room)
    // =====================
    socket.on("join-call", (path) => {
      if (!connections[path]) {
        connections[path] = [];
      }

      connections[path].push(socket.id);
      timeOnline[socket.id] = new Date();

      // Notify others in room
      connections[path].forEach((id) => {
        io.to(id).emit("user-joined", socket.id, connections[path]);
      });

      // Send previous chat messages
      if (messages[path]) {
        messages[path].forEach((msg) => {
          io.to(socket.id).emit(
            "chat-message",
            msg.data,
            msg.sender,
            msg["socket-id-sender"]
          );
        });
      }
    });

    // =====================
    // WebRTC Signaling
    // =====================
    socket.on("signal", (toId, message) => {
      io.to(toId).emit("signal", socket.id, message);
    });

    // =====================
    // Chat Messages
    // =====================
    socket.on("chat-message", (data, sender) => {
      const [room, found] = Object.entries(connections).reduce(
        ([r, f], [key, value]) => {
          if (!f && value.includes(socket.id)) {
            return [key, true];
          }
          return [r, f];
        },
        ["", false]
      );

      if (found) {
        if (!messages[room]) messages[room] = [];

        messages[room].push({
          sender,
          data,
          "socket-id-sender": socket.id,
        });

        connections[room].forEach((id) => {
          io.to(id).emit("chat-message", data, sender, socket.id);
        });
      }
    });

    // =====================
    // Disconnect
    // =====================
    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);

      for (const [room, users] of Object.entries(connections)) {
        if (users.includes(socket.id)) {
          connections[room] = users.filter((id) => id !== socket.id);

          connections[room].forEach((id) => {
            io.to(id).emit("user-left", socket.id);
          });

          if (connections[room].length === 0) {
            delete connections[room];
          }
          break;
        }
      }

      delete timeOnline[socket.id];
    });
  });

  return io;
};

// ✅ DEFAULT EXPORT (IMPORTANT)
export default ConnectToSocket;