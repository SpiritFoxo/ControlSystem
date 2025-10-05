import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
import {DefectCard, MobileDefectCard} from '../components/Cards'
import { fetchAllDefects } from '../api/Defects';
import {AddEntityModal} from "../components/Modals";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import { fetchProjectById } from "../api/Projects";


const ProjectPage = () => {
    const nav = useNavigate();

    const handleDefectClick = (defectId) => {
        nav(`/defect/${defectId}`);
    }
    const { projectId } = useParams();
    const [projectName, setProjectName] = useState('');
    const [projectDescription, setProjectDescription] = useState('');
    const [defects, setDefects] = useState([]);
    const [pagination, setPagination] = useState({
        page: 1,
        totalPages: 1,
        limit: 4,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deadline, setDeadline] = useState('');
    const [status, setStatus] = useState('');

    const loadProject = async () => {
        try {
            const response = await fetchProjectById(projectId);
            setProjectName(response.project_name || "Без названия");
            setProjectDescription(response.project_description || "Нет описания");
        } catch (err) {
            console.error("Ошибка загрузки проекта:", err);
            setError("Не удалось загрузить проект");
        }
    };

    const loadDefects = async (page = 1) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetchAllDefects(projectId, { page });
            setDefects(response.defects || []);
            setPagination({
                page: response.pagination.page,
                totalPages: response.pagination.totalPages,
                limit: response.pagination.limit,
            });
        } catch (err) {
            console.error("Ошибка загрузки дефектов:", err);
            setError("Не удалось загрузить дефекты");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProject();
        loadDefects(1);
    }, [projectId]);

    return (
        <div className={bakground.background}>
            <Header />
            <div className={bakground.contentParent}>
                <Typography variant="h4">{projectName}</Typography>
                <Typography variant="body1">{projectDescription}</Typography>
                <DefectCounter />
                <Grid container spacing={2} alignItems={'center'} justifyContent={'center'}>
                    <SearchField />
                    <Box>
                        <FormControl sx={{ m: 1, minWidth: 100 }}>
                            <InputLabel id="status-select-label">Статус</InputLabel>
                            <Select
                                labelId="status-select-label"
                                id="status-select"
                                autoWidth
                                value={status}
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
                                value={deadline}
                                label="deadline"
                            >
                                <MenuItem value="">
                                    <em>None</em>
                                </MenuItem>
                                <MenuItem value={1}>Не просрочен</MenuItem>
                                <MenuItem value={2}>Просрочен</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                    <AddEntityModal entityType={'defect'} projectId={projectId}></AddEntityModal>
                </Grid>

                {loading && <p>Загрузка...</p>}
                {error && <p className={styles.error}>{error}</p>}

                <Grid container spacing={3} justifyContent={'center'}>
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
                                onClick={() => handleDefectClick(defect.id)}
                            />
                        );
                    })}

                    {defects.map((defect) => {
                        const authorName = `${defect.creator.firstName} ${defect.creator.lastName}`;
                        const defectStatus = defect.status || 1; 
                        const defectName = defect.title; 

                        return (
                            <MobileDefectCard
                                key={defect.id}
                                title={defectName}
                                authorName={authorName}
                                defectStatus={defectStatus}
                                defectName={defectName}
                                photoUrl={defect.photoUrl}
                                onClick={() => handleDefectClick(defect.id)}
                            />
                        );
                    })}
                    
                </Grid>

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