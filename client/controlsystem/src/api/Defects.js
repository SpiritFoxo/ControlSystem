import api from './axiosInstance'

export const fetchAllDefects = async (projectId, { page = 1} = {}) => {
    try{
        const response = await api.axiosInstance.get(`/defects/?projectId=${projectId}&page=${page}`);
        return response;
    }
    catch (err){
        console.error("API Error fetchAllDefects:", err.response || err.message || err);
        throw new Error(err.response?.data?.error || err.message || "Failed to fetch projects information");
    }
}