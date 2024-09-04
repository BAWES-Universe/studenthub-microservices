
 // Connection opened
 socket.addEventListener('open', (event) => {
    console.log('Connected to the Secure WebSocket server');
  });
 
  // Listen for messages
  socket.addEventListener('message', (event) => {
    console.log('Message from server:', event.data);
    const li = document.createElement('li');
    li.textContent = event.data;
    document.getElementById('messages').appendChild(li);
  });
 
  // Send a message to the WebSocket server
  function sendMessage() {
    const input = document.getElementById('messageInput');
    const message = input.value;
    socket.send(message);
    input.value = '';
  }
 
  // Handle WebSocket errors
  socket.addEventListener('error', (event) => {
    console.error('WebSocket error observed:', event.message);
  });
 
  // Handle connection closed
  socket.addEventListener('close', (event) => {
    console.log('WebSocket connection closed:', event.message);
  });
 