import api from './axiosInstance'

export const RegisterNewUser = async (firstName, middleName, lastName, email, role) =>{
    try{
        const response = api.axiosInstance.post('/admin/register', {
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