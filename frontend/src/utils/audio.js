export const playSound = (type) => {
    let file = '';
    
    switch (type) {
        case 'success':
            file = '/assets/microwave-timer.mp3';
            break;
        case 'money':
            file = '/assets/coin-collision.mp3'; 
            break;
        default:
            return;
    }

    const audio = new Audio(file);
    audio.volume = 0.5; 
    audio.play().catch(e => console.log("Audio play failed (user interactions needed first)", e));
};