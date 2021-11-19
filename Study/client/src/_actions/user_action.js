import axios from 'axios';

export function loginUser(ddataToSubmit) {
    const request = axios.post('/api/users/login', body)
    .then(response => { response.data })
}