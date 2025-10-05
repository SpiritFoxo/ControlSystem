import { useState, useEffect } from "react";
import Typography from "@mui/material/Typography";
import { AdminTable } from "../components/AdminTable";
import {Header} from "../components/AppBar";
import background from "../css/Background.module.css";
import styles from '../css/AdminPage.module.css';
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import {SearchField} from "../components/SearchField";
import {PaginationField} from "../components/PaginationField";
import { registerNewUser } from "../api/Admin";
import { getAllUsers } from "../api/Admin";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";

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
    const [page, setPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [pagination, setPagination] = useState({ limit: 10, page: 1, total: 0, totalPages: 1 });
    const [userUpdateTrigger, setUserUpdateTrigger] = useState(0);
    
    useEffect(() => {
        const fetchPagination = async () => {
            const { pagination } = await getAllUsers({
                page,
                email: searchQuery
            });
            setPagination(pagination);
        };
        fetchPagination();
    }, [page, searchQuery, userUpdateTrigger]);

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
            await registerNewUser(
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
            setUserUpdateTrigger((prev) => prev + 1);
        } catch (err) {
            setError('Ошибка при регистрации пользователя: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleSearchChange = (value) => {
        setSearchQuery(value);
    };

    const handleSearchClick = () => {
        setPage(1);
        setUserUpdateTrigger((prev) => prev + 1);
    };

    const handlePageChange = (newPage) => {
        setPage(newPage);
    };

    return (
        <div className={background.background}>
            <Header />
            <div className={background.contentParent}>
                <div className={styles.userCreationParent}>
                    <Typography variant="h4" sx={{ mb: 5 }}>Зарегистрировать пользователя</Typography>
                    <Box>
                        <Grid container spacing={2} justifyItems={'center'} marginBottom={6}>
                            <Box>
                                <TextField
                                    required
                                    id="lastName"
                                    name="lastName"
                                    label="Обязательное поле"
                                    placeholder="Фамилия"
                                    value={formData.lastName}
                                    onChange={handleInputChange}
                                />
                            </Box>
                            <Box>
                                <TextField
                                    required
                                    id="firstName"
                                    name="firstName"
                                    label="Обязательное поле"
                                    placeholder="Имя"
                                    value={formData.firstName}
                                    onChange={handleInputChange}
                                />
                            </Box>
                            <Box>
                                <TextField
                                    id="middleName"
                                    name="middleName"
                                    label="Отчество"
                                    placeholder="Отчество"
                                    value={formData.middleName}
                                    onChange={handleInputChange}
                                />
                            </Box>
                            <Box>
                                <TextField
                                    required
                                    id="email"
                                    name="email"
                                    label="Обязательное поле"
                                    placeholder="Email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                />
                            </Box>
                            <Grid container spacing={2}>
                                <FormControl sx={{ minWidth: 80 }}>
                                    <InputLabel id="role-select-label">Роль</InputLabel>
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
                                            <em>Выберите роль</em>
                                        </MenuItem>
                                        <MenuItem value={1}>Инженер</MenuItem>
                                        <MenuItem value={2}>Менеджер</MenuItem>
                                        <MenuItem value={3}>Руководитель</MenuItem>
                                        <MenuItem value={4}>Администратор</MenuItem>
                                    </Select>
                                </FormControl>
                                <Button variant="contained" onClick={handleSubmit}>Зарегистрировать</Button>
                            </Grid>
                        </Grid>
                    </Box>
                    {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}
                    {success && <Typography color="success.main" sx={{ mt: 2 }}>{success}</Typography>}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                        <Typography variant="h4">Управление</Typography>
                        <Grid container>
                            <Box sx={{ display: 'flex', flexDirection: { xl: 'row', sm: 'column', xs: 'column' }, alignItems: 'center', gap: '30px' }}>
                                <SearchField
                                    value={searchQuery}
                                    onChange={handleSearchChange}
                                    onSearchClick={handleSearchClick}
                                />
                                <PaginationField
                                    onPageChange={handlePageChange}
                                    totalPages={pagination.totalPages}
                                    currentPage={page}
                                />
                            </Box>
                        </Grid>
                    </Box>
                </div>
                <AdminTable
                    tableWidth={"74vw"}
                    page={page}
                    searchQuery={searchQuery}
                    onUserUpdate={userUpdateTrigger}
                />
            </div>
        </div>
    );
};

export default AdminPage