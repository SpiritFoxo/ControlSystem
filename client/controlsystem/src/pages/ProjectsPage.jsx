import Header from "../components/AppBar";
import SearchField from "../components/SearchField";
import styles from '../css/ProjectsPage.module.css';
import PaginationField from "../components/PaginationField";
import CardParent from "../components/Cards";

const ProjectsPage = () => {

    return (
        <div className={styles.background}>
            <Header />
            <div className={styles.contentHolder}>
                <SearchField />
                <div className={styles.projectList}>
                    <CardParent.ProjectCard title="ЖК 'Тест'" onClick={() => console.log("Go to project 1")} />
                    <CardParent.MobileProjectCard title="ЖК 'Тест'" onClick={() => console.log("Go to project 1")} />
                </div>

                <PaginationField count={10} page={1} onChange={() => console.log("Change page")} />
                
            </div>
        </div>
    );
}

export default ProjectsPage;