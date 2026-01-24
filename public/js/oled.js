const oledinput = document.querySelector('#oled-message');

oledinput.addEventListener('submit', async (e) => {
    e.preventDefault();
    const message = oledinput.value;
    oledinput.value = '';
    try {
        const response = await fetch(`/oled/setMessage?message=${encodeURIComponent(message)}`);
        if (response.ok) {
            console.info('OLED message set successfully');
        } else {
            console.error('Failed to set OLED message');
        }
    } catch (error) {
        console.error('Error setting OLED message:', error);
    }
});