console.info('Command report: led-controls enabled')
const ledNumbers = document.querySelectorAll('#led-controls .numbered button');
const ledControls = document.getElementById('#led-controls .controls button');

ledNumbers.forEach(button => {
    button.addEventListener('click', () => {
        const ledNumber = button.getAttribute('data-number');
        fetch(`/led/toggle?byte=${ledNumber}`)
        .then(response => {
            if(response.ok){
                console.info(`LED ${ledNumber} toggled successfully`);
            } else {
                console.error(`Failed to toggle LED ${ledNumber}`);
            }
        })
        .catch(error => {
            console.error(`Error toggling LED ${ledNumber}:`, error);
        });
    });
});

ledControls.forEach(control => {
    control.addEventListener('click', () => {
    const ledState = control.getAttribute('data-number');
    fetch(`/led/set?byte=${ledState}`)
        .then(response => {
            if(response.ok){
                console.info(`LEDs set to ${ledState} successfully`);
            } else {
                console.error(`Failed to set LEDs to ${ledState}`);
            }   
        })
        .catch(error => {
            console.error(`Error setting LEDs to ${ledState}:`, error);
        });
    });
});