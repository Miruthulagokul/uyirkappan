import { io, Socket } from 'socket.io-client';
import { Booking } from './types';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001';

let socket: Socket | null = null;
let simulationInterval: ReturnType<typeof setInterval> | null = null;

export const connectSocket = (): Socket => {
  if (socket?.connected) return socket;

  try {
    socket = io(SOCKET_URL, {
      transports: ['websocket'],
      reconnectionAttempts: 3,
      timeout: 5000,
    });

    socket.on('connect', () => {
      console.log('Socket connected');
    });

    socket.on('connect_error', (error) => {
      console.warn('Socket connection failed, using simulation mode', error);
      startSimulationMode();
    });

    return socket;
  } catch (error) {
    console.warn('Socket initialization failed, using simulation mode');
    startSimulationMode();
    return socket!;
  }
};

const startSimulationMode = () => {
  if (simulationInterval) return;

  console.log('Starting simulation mode for real-time updates');

  // Simulate periodic location updates
  simulationInterval = setInterval(() => {
    const event = new CustomEvent('socket:location_update', {
      detail: {
        lat: 13.0527 + (Math.random() - 0.5) * 0.01,
        lng: 80.2511 + (Math.random() - 0.5) * 0.01,
      },
    });
    window.dispatchEvent(event);
  }, 2000);
};

export const subscribeToBooking = (bookingId: string, callback: (data: any) => void) => {
  if (!socket) {
    connectSocket();
  }

  if (socket?.connected) {
    socket.emit('join_booking', bookingId);

    socket.on('offer_created', callback);
    socket.on('status_changed', callback);
    socket.on('location_update', callback);
    socket.on('eta_update', callback);
  } else {
    // Use custom events for simulation mode
    const handleSimulation = (event: Event) => {
      callback((event as CustomEvent).detail);
    };

    window.addEventListener('socket:offer_created', handleSimulation);
    window.addEventListener('socket:status_changed', handleSimulation);
    window.addEventListener('socket:location_update', handleSimulation);
    window.addEventListener('socket:eta_update', handleSimulation);

    return () => {
      window.removeEventListener('socket:offer_created', handleSimulation);
      window.removeEventListener('socket:status_changed', handleSimulation);
      window.removeEventListener('socket:location_update', handleSimulation);
      window.removeEventListener('socket:eta_update', handleSimulation);
    };
  }

  return () => {
    if (socket?.connected) {
      socket.off('offer_created', callback);
      socket.off('status_changed', callback);
      socket.off('location_update', callback);
      socket.off('eta_update', callback);
    }
  };
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
  if (simulationInterval) {
    clearInterval(simulationInterval);
    simulationInterval = null;
  }
};

export const emitDriverLocation = (location: { lat: number; lng: number }) => {
  if (socket?.connected) {
    socket.emit('driver_location', location);
  }
};

export const emitBookingStatus = (bookingId: string, status: Booking['status']) => {
  if (socket?.connected) {
    socket.emit('booking_status', { bookingId, status });
  }
};
