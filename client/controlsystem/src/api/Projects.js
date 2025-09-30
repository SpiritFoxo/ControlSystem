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

export const createProject = async (title, description) => {
    try{
        const response = await api.axiosInstance.post('/projects/', {
            name: title,
            description: description,
        })
        return response.data;
    }
    catch (err){
        throw new Error(`Ошибка при создании проекта: ${err.message}`);
    }
}

export const editProject = async (projectId, projectName, description, status) => {
    try{
        const response = await api.axiosInstance.patch(`/projects/${projectId}`, {
            name: projectName,
            description: description,
            status: status,
        });
        return response.data;
    }
    catch (err){

    }
}