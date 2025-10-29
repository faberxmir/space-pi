console.log('buttons.js loaded');

const oledSendButton = document.querySelector('#oled-send');
const oledInputField = document.querySelector('#oled-controls input[type="text"]');

const onButton = document.querySelector('#on');
const offButton = document.querySelector('#off');

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

onButton.addEventListener('click', () => {
    fetch('/on')
    .then(response => {
        if(response.ok){
            console.info('All lights turned ON');
        } else {
            console.error('Failed to turn on lights');
        }
    })
    .catch(error => {
        console.error('Error turning on lights:', error);
    });
});

offButton.addEventListener('click', () => {
    fetch('/off')
    .then(response => {
        if(response.ok){
            console.info('All lights turned OFF');
        } else {
            console.error('Failed to turn OFF lights');
        }
    })
    .catch(error => {
        console.error('Error turning OFF lights:', error);
    });
});