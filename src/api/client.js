import axios from 'axios'

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: { 'Content-Type': 'application/json' }
});

export const getmessages = (params) =>
    api.get('/messages', { params });

export const getMessageStats = () =>
    api.get('/messages/stats');

export const getUsers = (params) =>
    api.get('/users', { params });

export const getUser = (userId) =>
    api.get(`user/${userId}`);

export const getRooms = () =>
    api.get('/rooms');

export const getRoom = (roomId) =>
    api.get(`/room/${roomId}`);

export const getOverview = () =>
    api.get('/overview');