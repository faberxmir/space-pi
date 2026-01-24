console.info('Command report: led-controls enabled')
const ledButtons = document.querySelectorAll('#led-controls .col button');

ledButtons.forEach(button => {
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