import Typography from '@mui/material/Typography';
import Header from '../components/AppBar';
import styles from '../css/ProjectPage.module.css'
import DefectCounter from '../components/DefectsCounter';
import SearchField from '../components/SearchField';
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import PaginationField from '../components/PaginationField';
import CardParent from '../components/Cards'

const ProjectPage = () => {
    return (
        <div className={styles.background}>
            <Header></Header>
            <div className={styles.contentParent}>
                <Typography variant='h4'>ЖК "Тест"</Typography>
                <DefectCounter></DefectCounter>
                <div className={styles.searchfield}>
                    <SearchField></SearchField>
                    <FormControl sx={{ m: 1, minWidth: 100 }}>
                        <InputLabel id="status-select-label">Статус</InputLabel>
                            <Select
                                labelId="status-select-label"
                                id="status-select"
                                autoWidth
                                label="status"
                            >
                                <MenuItem value="">
                                    <em>None</em>
                                </MenuItem>
                                <MenuItem value={1}>В работе</MenuItem>
                                <MenuItem value={2}>Завершен</MenuItem>
                            </Select>
                    </FormControl>
                    <FormControl sx={{ m: 1, minWidth: 80 }}>
                        <InputLabel id="deadline-select-label">Срок</InputLabel>
                            <Select
                                labelId="deadline-select-label"
                                id="deadline-select"
                                autoWidth
                                label="deadline"
                            >
                                <MenuItem value="">
                                    <em>None</em>
                                </MenuItem>
                                <MenuItem value={1}>Не просрочен</MenuItem>
                                <MenuItem value={2}>Просрочен</MenuItem>
                            </Select>
                    </FormControl>
                </div>

                <CardParent.DefectCard></CardParent.DefectCard>
                <PaginationField></PaginationField>
            </div>
        </div>
    );
}

export default ProjectPage