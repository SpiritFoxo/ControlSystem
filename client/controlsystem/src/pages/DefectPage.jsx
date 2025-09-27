import Typography from '@mui/material/Typography';
import Header from '../components/AppBar';
import styles from '../css/DefectPage.module.css'

const DefectPage = () => {
    return(
        <div className={styles.background}>
            <Header />
            <div className={styles.contentHolder}>
                <div className={styles.stepBack}>
                    <Typography>Название дефекта</Typography>

                </div>
                <Typography>Медиафайлы</Typography>
                
            </div>
        </div>
    );
}

export default DefectPage