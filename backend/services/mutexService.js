import { broadcastStateUpdate, logMessage } from "./messageService.js";
import { lamportService } from "./lamportService.js";

class MutexService {
  constructor() {
    this.locks = new Map(); // key: "nodeId:resource", value: { status, owner, waiting: [] }
    this.initialize();
  }

  initialize() {
    this.locks.clear();
    // Pre-register main resource critical sections
    const initialKeys = [
      "Warehouse A:Water",
      "Warehouse A:Food",
      "Warehouse B:Medicines",
      "Warehouse B:Food",
      "Warehouse C:Water",
      "Warehouse C:EmergencyEquipment"
    ];

    initialKeys.forEach((key) => {
      this.locks.set(key, {
        resourceKey: key,
        status: "AVAILABLE", // AVAILABLE, LOCKED, WAITING
        currentOwner: null,
        waitingQueue: []
      });
    });
  }

  getLockInfo(resourceKey) {
    if (!this.locks.has(resourceKey)) {
      this.locks.set(resourceKey, {
        resourceKey,
        status: "AVAILABLE",
        currentOwner: null,
        waitingQueue: []
      });
    }
    return this.locks.get(resourceKey);
  }

  async acquireLock(resourceKey, requesterId, requesterName, quantity) {
    const lock = this.getLockInfo(resourceKey);
    const reqId = `req-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;

    if (lock.status === "AVAILABLE") {
      lock.status = "LOCKED";
      lock.currentOwner = {
        requesterId,
        requesterName,
        quantity,
        acquiredAt: new Date().toISOString()
      };

      const clock = lamportService.tick(requesterId, `Acquired Lock on ${resourceKey}`);

      logMessage({
        type: "MUTEX",
        sender: requesterName,
        receiver: resourceKey,
        action: `[Mutual Exclusion] Lock Acquired`,
        details: `${requesterName} acquired exclusive lock on Critical Section [${resourceKey}]`,
        status: "SUCCESS",
        metadata: { resourceKey, requesterName, status: "LOCKED", lamportClock: clock }
      });

      broadcastStateUpdate({ type: "MUTEX_UPDATE", locks: this.getAllLocks() });
      return { acquired: true, waitPromise: null };
    } else {
      // Lock is currently busy; add to waiting queue
      let resolveWait;
      const waitPromise = new Promise((resolve) => {
        resolveWait = resolve;
      });

      const waitEntry = {
        id: reqId,
        requesterId,
        requesterName,
        quantity,
        queuedAt: new Date().toISOString(),
        resolve: resolveWait
      };

      lock.waitingQueue.push(waitEntry);
      lock.status = "LOCKED"; // lock remains locked with waiters

      const clock = lamportService.tick(requesterId, `Queued for Lock on ${resourceKey}`);

      logMessage({
        type: "MUTEX",
        sender: requesterName,
        receiver: resourceKey,
        action: `[Mutual Exclusion] Request Queued (Waiting)`,
        details: `Critical Section [${resourceKey}] is busy (Owner: ${lock.currentOwner?.requesterName}). ${requesterName} queued in position #${lock.waitingQueue.length}`,
        status: "WARNING",
        metadata: { resourceKey, requesterName, position: lock.waitingQueue.length, lamportClock: clock }
      });

      broadcastStateUpdate({ type: "MUTEX_UPDATE", locks: this.getAllLocks() });
      return { acquired: false, waitPromise };
    }
  }

  releaseLock(resourceKey, requesterId) {
    const lock = this.getLockInfo(resourceKey);
    const prevOwner = lock.currentOwner?.requesterName || requesterId;

    const clock = lamportService.tick(requesterId, `Released Lock on ${resourceKey}`);

    logMessage({
      type: "MUTEX",
      sender: prevOwner,
      receiver: resourceKey,
      action: `[Mutual Exclusion] Lock Released`,
      details: `${prevOwner} released lock on Critical Section [${resourceKey}]`,
      status: "INFO",
      metadata: { resourceKey, prevOwner, lamportClock: clock }
    });

    if (lock.waitingQueue.length > 0) {
      // Grant lock to next waiting requester (FIFO order)
      const nextReq = lock.waitingQueue.shift();
      lock.status = "LOCKED";
      lock.currentOwner = {
        requesterId: nextReq.requesterId,
        requesterName: nextReq.requesterName,
        quantity: nextReq.quantity,
        acquiredAt: new Date().toISOString()
      };

      const grantClock = lamportService.tick(nextReq.requesterId, `Lock Granted on ${resourceKey}`);

      logMessage({
        type: "MUTEX",
        sender: "Mutex Coordinator",
        receiver: nextReq.requesterName,
        action: `[Mutual Exclusion] Lock Granted to Waiter`,
        details: `Critical Section [${resourceKey}] granted to next queued requester: ${nextReq.requesterName}`,
        status: "SUCCESS",
        metadata: { resourceKey, newOwner: nextReq.requesterName, lamportClock: grantClock }
      });

      broadcastStateUpdate({ type: "MUTEX_UPDATE", locks: this.getAllLocks() });
      nextReq.resolve({ granted: true });
    } else {
      lock.status = "AVAILABLE";
      lock.currentOwner = null;
      broadcastStateUpdate({ type: "MUTEX_UPDATE", locks: this.getAllLocks() });
    }
  }

  getAllLocks() {
    const list = [];
    for (const [key, lock] of this.locks.entries()) {
      list.push({
        resourceKey: key,
        status: lock.status,
        currentOwner: lock.currentOwner,
        waitingQueue: lock.waitingQueue.map((w) => ({
          id: w.id,
          requesterId: w.requesterId,
          requesterName: w.requesterName,
          quantity: w.quantity,
          queuedAt: w.queuedAt
        }))
      });
    }
    return list;
  }

  reset() {
    this.initialize();
  }
}

export const mutexService = new MutexService();
