import { useState } from "react";
import Typography from "@mui/material/Typography";
import { AdminTable } from "../components/AdminTable";
import {Header} from "../components/AppBar";
import bakground from "../css/Background.module.css";
import styles from '../css/AdminPage.module.css';
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import {SearchField} from "../components/SearchField";
import {PaginationField} from "../components/PaginationField";
import { RegisterNewUser } from "../api/Admin";

const AdminPage = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        middleName: '',
        lastName: '',
        email: '',
        role: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [id.replace('-', '')]: value
        }));
    };

    const handleRoleChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            role: e.target.value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!formData.firstName || !formData.lastName || !formData.email || !formData.role) {
            setError('Все обязательные поля должны быть заполнены');
            return;
        }

        try {
            await RegisterNewUser(
                formData.firstName,
                formData.middleName,
                formData.lastName,
                formData.email,
                formData.role
            );
            setSuccess('Пользователь успешно зарегистрирован!');
            setFormData({
                firstName: '',
                middleName: '',
                lastName: '',
                email: '',
                role: ''
            });
        } catch (err) {
            setError('Ошибка при регистрации пользователя: ' + (err.response?.data?.message || err.message));
        }
    };

    return(
        <div className={bakground.background}>
            <Header />
            <div className={bakground.contentParent}>
                <div className={styles.userCreationParent}>
                    <Typography variant="h4" sx={{ mb: 5 }}>Зарегестрировать пользователя</Typography>
                    <div className={styles.userCreationMenu}>
                        <TextField
                            required
                            id="lastName"
                            name="lastName"
                            label="Обязательное поле"
                            placeholder="Фамилия"
                            value={formData.lastName}
                            onChange={handleInputChange}
                        />
                        <TextField
                            required
                            id="firstName"
                            name="firstName"
                            label="Обязательное поле"
                            placeholder="Имя"
                            value={formData.firstName}
                            onChange={handleInputChange}
                        />
                        <TextField
                            required
                            id="middleName"
                            name="middleName"
                            label="Обязательное поле"
                            placeholder="Отчество"
                            value={formData.middleName}
                            onChange={handleInputChange}
                        />
                        <TextField
                            required
                            id="email"
                            name="email"
                            label="Обязательное поле"
                            placeholder="Email"
                            value={formData.email}
                            onChange={handleInputChange}
                        />
                        <FormControl sx={{ m: 1, minWidth: 80 }}>
                        <InputLabel id="demo-simple-select-autowidth-label">Роль</InputLabel>
                        <Select
                            labelId="role-select-label"
                            id="role"
                            name="role"
                            value={formData.role}
                            onChange={handleRoleChange}
                            autoWidth
                            label="Роль"
                        >
                        <MenuItem value="">
                            <em>None</em>
                        </MenuItem>
                            <MenuItem value={1}>Инженер</MenuItem>
                            <MenuItem value={2}>Менеджер</MenuItem>
                            <MenuItem value={3}>Руководитель</MenuItem>
                            <MenuItem value={4}>Администратор</MenuItem>
                        </Select>
                    </FormControl>
                    <Button variant="contained" onClick={handleSubmit}>Зарегестрировать</Button>
                    </div>
                    {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}
                    {success && <Typography color="success.main" sx={{ mt: 2 }}>{success}</Typography>}
                    <div className={styles.userControlMenu}>
                        <Typography variant="h4">Управление</Typography>
                        <SearchField></SearchField>
                        <PaginationField></PaginationField>
                    </div> 
                </div>
                <AdminTable tableWidth={"74vw"} />
            </div>
        </div>
    );
}

export default AdminPage