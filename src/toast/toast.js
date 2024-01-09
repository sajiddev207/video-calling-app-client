import { toast } from 'react-toastify';

export const toastAction = {
    show,
}

function show(msg) {
    const message = msg.toString();
    toast(message)
}
