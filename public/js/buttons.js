console.log('buttons.js loaded');

const oledSendButton = document.querySelector('#oled-send');
const oledInputField = document.querySelector('#oled-controls input[type="text"]');

oledSendButton.addEventListener('click', () => {
    const text = oledInputField.value || 'Go goofy!'; 
    fetch(`/setText?text=${encodeURIComponent(text)}&x=0&y=0`)
    .then(response => response.json())
    .then(data => {
        console.log('OLED response:', data);
    })
    .catch(error => {
        console.error('Error sending text to OLED:', error);
    });
});