import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {Header} from "../components/AppBar";
import {SearchField} from "../components/SearchField";
import styles from "../css/ProjectsPage.module.css";
import bakground from "../css/Background.module.css";
import {PaginationField} from "../components/PaginationField";
import {ProjectCard, MobileProjectCard} from "../components/Cards";
import { fetchAllProjects } from "../api/Projects";
import {AddEntityModal} from "../components/Modals";

const ProjectsPage = () => {
    const nav = useNavigate();

    const handleProjectClick = (projectId) => {
        nav(`/project/${projectId}`);
    }
    const [projects, setProjects] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadProjects = async (page = 1) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetchAllProjects(page);
            setProjects(response.data.projects || []);
            setPagination(response.data.pagination || { page: 1, totalPages: 1 });
        } catch (err) {
            console.error("Ошибка загрузки проектов:", err);
            setError("Не удалось загрузить проекты");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProjects(1);
    }, []);

    return (
        <div className={bakground.background}>
            <Header />
            <div className={bakground.contentParent}>
                <div>
                <SearchField />
                <AddEntityModal entityType={'project'}></AddEntityModal>
                </div>

                {loading && <p>Загрузка...</p>}
                {error && <p className={styles.error}>{error}</p>}

                <div className={styles.projectList}>
                    {projects.map((project) => (
                        <ProjectCard
                            key={project.id}
                            title={project.name}
                            photoUrl={project.photoUrl}
                            onClick={() => handleProjectClick(project.id)}
                        />
                    ))}

                    {projects.map((project) => (
                        <MobileProjectCard
                            key={`mobile-${project.id}`}
                            title={project.name}
                            photoUrl={project.photoUrl}
                            onClick={() => handleProjectClick(project.id)}
                        />
                    ))}
                </div>

                <PaginationField
                    count={pagination.totalPages}
                    page={pagination.page}
                    onChange={(e, value) => loadProjects(value)}
                />
            </div>
        </div>
    );
};

export default ProjectsPage;
