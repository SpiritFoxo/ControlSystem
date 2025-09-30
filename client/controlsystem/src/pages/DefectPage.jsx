import Typography from '@mui/material/Typography';
import Header from '../components/AppBar';
import styles from '../css/DefectPage.module.css';
import bakground from "../css/Background.module.css";

const DefectPage = () => {
    return(
        <div className={bakground.background}>
            <Header />
            <div className={bakground.contentHolder}>
                <div className={styles.stepBack}>
                    <Typography>Название дефекта</Typography>

                </div>
                <Typography>Медиафайлы</Typography>
                
            </div>
        </div>
    );
}

export default DefectPage