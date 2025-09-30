import api from './axiosInstance'

export const registerNewUser = async (firstName, middleName, lastName, email, role) =>{
    try{
        const response = await api.axiosInstance.post('/admin/register', {
            first_name: firstName,
            middle_name: middleName,
            last_name: lastName,
            email: email,
            role: parseInt(role, 10),
        });
        return response.data;

    }
    catch(err){

    }
}

export const editUser = async (userId, firstName, middleName, lastName, role, isEnabled) => {
    try{
        const response = await api.axiosInstance.patch(`/admin/edit-user/${userId}`, {
            first_name: firstName,
            middle_name: middleName,
            last_name: lastName,
            role: role,
            is_enabled: isEnabled,
        });
        return response.data;
    }
    catch (err){

    }
}


export const getAllUsers = async ({page = 1} = {}) => {
    try {
        const response = await api.axiosInstance.get(`/admin/page=${page}`);
        return response.data;
    }
    catch (err){

    }
}