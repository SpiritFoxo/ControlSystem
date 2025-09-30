import { useEffect, useState } from "react";
import Header from "../components/AppBar";
import SearchField from "../components/SearchField";
import styles from "../css/ProjectsPage.module.css";
import PaginationField from "../components/PaginationField";
import CardParent from "../components/Cards";
import { fetchAllProjects } from "../api/Projects";

const ProjectsPage = () => {
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
        <div className={styles.background}>
            <Header />
            <div className={styles.contentParent}>
                <SearchField />

                {loading && <p>Загрузка...</p>}
                {error && <p className={styles.error}>{error}</p>}

                <div className={styles.projectList}>
                    {projects.map((project) => (
                        <CardParent.ProjectCard
                            key={project.id}
                            title={project.name}
                            photoUrl={project.photoUrl}
                            onClick={() => console.log("Go to project", project.id)}
                        />
                    ))}

                    {projects.map((project) => (
                        <CardParent.MobileProjectCard
                            key={`mobile-${project.id}`}
                            title={project.name}
                            photoUrl={project.photoUrl}
                            onClick={() => console.log("Go to project", project.id)}
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
