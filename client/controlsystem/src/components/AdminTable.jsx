import { useState, useEffect } from 'react';
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Button from "@mui/material/Button";
import { getAllUsers } from '../api/Admin';

export const AdminTable = ({ tableWidth, page, searchQuery, onUserUpdate }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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
                const { users } = await getAllUsers({ page, search: searchQuery });
                setUsers(users);
                setLoading(false);
            } catch (err) {
                setError('Ошибка при загрузке пользователей');
                setLoading(false);
            }
        };
        fetchUsers();
    }, [page, searchQuery, onUserUpdate]);

    const handleEdit = (user) => {
        console.log(`Редактирование пользователя с ID: ${user.id}`);
    };

    if (loading) return <div>Загрузка...</div>;
    if (error) return <div>{error}</div>;

    return (
        <TableContainer sx={{ width: tableWidth }}>
            <Table>
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
                                <TableCell>{`${user.lastName} ${user.firstName} ${user.middleName || ''}`}</TableCell>
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
    );
};