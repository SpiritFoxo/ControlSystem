import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Typography from '@mui/material/Typography';
import {Header} from '../components/AppBar';
import styles from '../css/ProjectPage.module.css';
import bakground from "../css/Background.module.css";
import {DefectCounter} from '../components/DefectsCounter';
import {SearchField} from '../components/SearchField';
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import {PaginationField} from '../components/PaginationField';
import {DefectCard} from '../components/Cards'
import { fetchAllDefects } from '../api/Defects';
import {AddEntityModal} from "../components/Modals";


const ProjectPage = () => {
    const { projectId } = useParams();
    const [defects, setDefects] = useState([]);
    const [pagination, setPagination] = useState({
        page: 1,
        totalPages: 1,
        limit: 4,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadDefects = async (page = 1) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetchAllDefects(projectId, { page });
            setDefects(response.data.defects || []);
            setPagination({
                page: response.data.pagination.page,
                totalPages: response.data.pagination.totalPages,
                limit: response.data.pagination.limit,
            });
        } catch (err) {
            console.error("Ошибка загрузки дефектов:", err);
            setError("Не удалось загрузить дефекты");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDefects(1);
    }, [projectId]);

    return (
        <div className={bakground.background}>
            <Header />
            <div className={bakground.contentParent}>
                <Typography variant="h4">ЖК "Тест"</Typography>
                <DefectCounter />
                <div className={styles.searchfield}>
                    <SearchField />
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
                    <AddEntityModal entityType={'defect'} projectId={projectId}></AddEntityModal>
                </div>

                {loading && <p>Загрузка...</p>}
                {error && <p className={styles.error}>{error}</p>}

                <div className={styles.defectList}>
                    {defects.map((defect) => {
                        const authorName = `${defect.creator.firstName} ${defect.creator.lastName}`;
                        const defectStatus = defect.status || 1; 
                        const defectName = defect.title; 

                        return (
                            <DefectCard
                                key={defect.id}
                                title={defectName}
                                authorName={authorName}
                                defectStatus={defectStatus}
                                defectName={defectName}
                                photoUrl={defect.photoUrl}
                            />
                        );
                    })}
                </div>

                <PaginationField
                    count={pagination.totalPages}
                    page={pagination.page}
                    onChange={(e, value) => loadDefects(value)}
                />
            </div>
        </div>
    );
}

export default ProjectPage