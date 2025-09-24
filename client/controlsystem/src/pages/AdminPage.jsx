import Typography from "@mui/material/Typography";
import AdminTable from "../components/AdminTable";
import Header from "../components/AppBar";
import styles from '../css/AdminPage.module.css';
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import SearchField from "../components/SearchField";
import PaginationField from "../components/PaginationField";

const AdminPage = () => {
    return(
        <div className={styles.background}>
            <Header />
            <div className={styles.contentHolder}>
                <div className={styles.userCreationParent}>
                    <Typography variant="h4" sx={{ mb: 5 }}>Зарегестрировать пользователя</Typography>
                    <div className={styles.userCreationMenu}>
                        <TextField
                            required
                            id="last-name"
                            label="Обязательное поле"
                            defaultValue="Фамилия"
                        />
                        <TextField
                            required
                            id="first-name"
                            label="Обязательное поле"
                            defaultValue="Имя"
                        />
                        <TextField
                            required
                            id="middle-name"
                            label="Обязательное поле"
                            defaultValue="Отчество"
                        />
                        <FormControl sx={{ m: 1, minWidth: 80 }}>
                        <InputLabel id="demo-simple-select-autowidth-label">Роль</InputLabel>
                        <Select
                            labelId="demo-simple-select-autowidth-label"
                            id="demo-simple-select-autowidth"
                            autoWidth
                            label="role"
                        >
                        <MenuItem value="">
                            <em>None</em>
                        </MenuItem>
                            <MenuItem value={1}>Инженер</MenuItem>
                            <MenuItem value={2}>Менеджер</MenuItem>
                            <MenuItem value={3}>Руководитель</MenuItem>
                            <MenuItem value={4}>Алминистратор</MenuItem>
                        </Select>
                    </FormControl>
                    <Button variant="contained">Зарегестрировать</Button>
                    </div>
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