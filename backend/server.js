import { SerialPort } from 'serialport';
import express from 'express';
import cors from 'cors';

const app = express();
const port = 3000;

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

const portPath = 'COM6';
const bluetoothPort = new SerialPort({
  path: portPath,
  baudRate: 9600,
  autoOpen: true
});

// Store the latest received state globally in the background
let latestDetectedState = false;

bluetoothPort.on('error', (err) => {
  console.error('Serial Port Error:', err.message);
});

// Listen continuously in the background to catch data from the hardware
bluetoothPort.on('data', (data) => {
  const receivedStr = data.toString().trim();
  console.log("Received from serial:", receivedStr);
  
  if (receivedStr === "true") {
    latestDetectedState = true;
  } else if (receivedStr === "false") {
    latestDetectedState = false;
  }
});

// When the frontend hits POST, it sends the current state and then resets it
app.post('/', (req, res) => {
  // Capture the current state to send back
  const currentState = latestDetectedState;

  // Send the response to the frontend
  res.json({ detected: currentState });

  // Reset the data immediately after sending so it doesn't linger
  latestDetectedState = false; 
  console.log("State sent to frontend and reset to: false");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});