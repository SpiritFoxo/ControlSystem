import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from "@mui/material/Button";
import Container from '@mui/material/Container';
import Toolbar from '@mui/material/Toolbar';
import { useNavigate } from 'react-router-dom';
import { RequireRole } from './RequiredRole';

export const Header = () => {
    const nav = useNavigate();

    const handleLogoClick = () => {
        nav("/");
    }

    return (
        <Box sx={{ flexGrow: 1, position: 'relative', zIndex: 999 }}>
            <AppBar position="static" sx={{ backgroundColor: '#ffffffff' }}>
                <Container maxWidth="xl">
                    <Toolbar disableGutters>
                        <Box onClick={handleLogoClick} component="img" src="/images/logotype-desktop.png" alt="Logo" sx={{ display: {xs: 'none', md: 'block'}}}></Box>
                        <Box onClick={handleLogoClick} component="img" src="/images/logotype-mobile.png" alt="Logo" sx={{ display: {xs: 'block', md: 'none'}}}></Box>
                        
                        <Box sx={{ ml: 'auto', gap: {xs: 1, md: 2}, display: 'flex' }}>
                            <RequireRole allowedRoles={[]}><Button variant="contained" href="/admin">Админ-панель</Button></RequireRole>
                            <Button variant="contained" href="/logout">Выйти</Button>
                        </Box>
                    </Toolbar>
                </Container>
            </AppBar>
        </Box>
    );
}
