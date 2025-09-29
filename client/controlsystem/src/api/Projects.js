import api from './axiosInstance'

export const fetchAllProjects = async () => {
    try{
        const response = await api.axiosInstance.get('/projects/');
        return response;
    }
    catch (err){
        console.error("API Error fetchAllProjects:", err.response || err.message || err);
        throw new Error(err.response?.data?.error || err.message || "Failed to fetch projects information");
    }
}