import { useState, useEffect } from 'react';
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Button from "@mui/material/Button";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import { getAllUsers } from '../api/Admin';
import Box from "@mui/material/Box";
import { EditUserModal } from './Modals';

export const AdminTable = ({ tableWidth, page, searchQuery, onUserUpdate }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [roleFilter, setRoleFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    const roleMap = {
        1: 'Инженер',
        2: 'Менеджер',
        3: 'Руководитель',
        4: 'Администратор'
    };

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true);
                const { users } = await getAllUsers({ 
                    page, 
                    email: searchQuery,
                    role: roleFilter,
                    isEnabled: statusFilter
                });
                setUsers(users);
                setLoading(false);
            } catch (err) {
                setError('Ошибка при загрузке пользователей');
                setLoading(false);
            }
        };
        fetchUsers();
    }, [page, searchQuery, roleFilter, statusFilter]);

    const handleEdit = (user) => {
        setCurrentUser(user);
        setOpenEditDialog(true);
    };

    const handleCloseEditDialog = () => {
        setOpenEditDialog(false);
        setCurrentUser(null);
    };

    if (loading) return <div>Загрузка...</div>;
    if (error) return <div>{error}</div>;

    return (
        <Box>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <FormControl size="small" sx={{minWidth:80}}>
                    <InputLabel>Роль</InputLabel>
                    <Select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        label="Роль"
                    >
                        <MenuItem value=""><em>Все</em></MenuItem>
                        {Object.entries(roleMap).map(([key, label]) => (
                            <MenuItem key={key} value={key}>{label}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <FormControl size="small" sx={{minWidth:100}}>
                    <InputLabel>Статус</InputLabel>
                    <Select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        label="Статус"
                    >
                        <MenuItem value=""><em>Все</em></MenuItem>
                        <MenuItem value="true">Активен</MenuItem>
                        <MenuItem value="false">Отключён</MenuItem>
                    </Select>
                </FormControl>
            </Box>

            <TableContainer sx={{ width: tableWidth }}>
                <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell>ФИО</TableCell>
                            <TableCell>Почта</TableCell>
                            <TableCell>Роль</TableCell>
                            <TableCell>Статус</TableCell>
                            <TableCell>Действия</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {users.length > 0 ? (
                            users.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell>{`${user.last_name} ${user.first_name} ${user.middle_name || ''}`}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>{roleMap[user.role] || 'Неизвестная роль'}</TableCell>
                                    <TableCell>{user.is_enabled ? 'Активен' : 'Отключён'}</TableCell>
                                    <TableCell>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            size="small"
                                            onClick={() => handleEdit(user)}
                                        >
                                            Редактировать
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5}>Нет пользователей</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {currentUser && (
                <EditUserModal
                    open={openEditDialog}
                    user={currentUser}
                    onClose={handleCloseEditDialog}
                    onUserUpdate={onUserUpdate}
                />
            )}
        </Box>
    );
};
