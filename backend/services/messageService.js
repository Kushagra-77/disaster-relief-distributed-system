let ioInstance = null;
const messageLog = [];
const MAX_LOG_SIZE = 300;

export const initMessageService = (io) => {
  ioInstance = io;
};

export const logMessage = ({
  type = "EVENT", // RPC_CALL, RPC_RESPONSE, P2P_MESSAGE, MIDDLEWARE, RESERVATION, ALLOCATION, FAULT, RECOVERY, INFO
  sender = "System",
  receiver = "All",
  action = "Message",
  details = "",
  status = "SUCCESS", // SUCCESS, PENDING, FAILED, WARNING
  rpcDetails = null,
  isP2P = false,
  metadata = {}
}) => {
  const message = {
    id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    timestamp: new Date().toISOString(),
    type,
    sender,
    receiver,
    action,
    details,
    status,
    rpcDetails,
    isP2P,
    metadata
  };

  messageLog.unshift(message);
  if (messageLog.length > MAX_LOG_SIZE) {
    messageLog.pop();
  }

  if (ioInstance) {
    ioInstance.emit("message:new", message);
  }

  return message;
};

export const getRecentMessages = (limit = 100) => {
  return messageLog.slice(0, limit);
};

export const clearMessageLog = () => {
  messageLog.length = 0;
  if (ioInstance) {
    ioInstance.emit("message:cleared");
  }
};

export const broadcastStateUpdate = (payload) => {
  if (ioInstance) {
    ioInstance.emit("system:state_update", payload);
  }
};
