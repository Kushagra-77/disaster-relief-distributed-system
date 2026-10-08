export const INITIAL_NODES = [
  {
    id: "node-warehouse-a",
    name: "Warehouse A",
    type: "Warehouse",
    location: "North Sector Depot",
    status: "ONLINE",
    inventory: {
      Water: { available: 100, reserved: 0, allocated: 0 },
      Food: { available: 50, reserved: 0, allocated: 0 },
      Medicines: { available: 0, reserved: 0, allocated: 0 },
      EmergencyEquipment: { available: 0, reserved: 0, allocated: 0 }
    }
  },
  {
    id: "node-warehouse-b",
    name: "Warehouse B",
    type: "Warehouse",
    location: "East Medical Hub",
    status: "ONLINE",
    inventory: {
      Water: { available: 0, reserved: 0, allocated: 0 },
      Food: { available: 20, reserved: 0, allocated: 0 },
      Medicines: { available: 30, reserved: 0, allocated: 0 },
      EmergencyEquipment: { available: 0, reserved: 0, allocated: 0 }
    }
  },
  {
    id: "node-warehouse-c",
    name: "Warehouse C",
    type: "Warehouse",
    location: "South Logistics Reserve",
    status: "ONLINE",
    inventory: {
      Water: { available: 70, reserved: 0, allocated: 0 },
      Food: { available: 0, reserved: 0, allocated: 0 },
      Medicines: { available: 0, reserved: 0, allocated: 0 },
      EmergencyEquipment: { available: 15, reserved: 0, allocated: 0 }
    }
  },
  {
    id: "node-relief-a",
    name: "Relief Center A",
    type: "ReliefCenter",
    location: "District 4 Field Camp",
    status: "ONLINE",
    inventory: {
      Water: { available: 0, reserved: 0, allocated: 0 },
      Food: { available: 0, reserved: 0, allocated: 0 },
      Medicines: { available: 0, reserved: 0, allocated: 0 },
      EmergencyEquipment: { available: 0, reserved: 0, allocated: 0 }
    }
  },
  {
    id: "node-relief-b",
    name: "Relief Center B",
    type: "ReliefCenter",
    location: "Coastal Sector Clinic",
    status: "ONLINE",
    inventory: {
      Water: { available: 0, reserved: 0, allocated: 0 },
      Food: { available: 0, reserved: 0, allocated: 0 },
      Medicines: { available: 0, reserved: 0, allocated: 0 },
      EmergencyEquipment: { available: 0, reserved: 0, allocated: 0 }
    }
  }
];

export const RESOURCE_TYPES = ["Water", "Food", "Medicines", "EmergencyEquipment"];
