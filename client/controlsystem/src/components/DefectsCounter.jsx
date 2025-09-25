import Typography from "@mui/material/Typography";
import styles from "../css/DefectCounter.module.css"

const DefectCounter = () => {
    return (
        <div className={styles.parent}>
            <div>
                <Typography>Всего</Typography>
                <Typography variant="h5">27</Typography>
            </div>
            <div>
                <Typography>Новые</Typography>
                <Typography variant="h5">6</Typography>
            </div>
            <div className={styles.hideFromMobile}>
                <Typography>В работе</Typography>
                <Typography variant="h5">13</Typography>
            </div>
            <div>
                <Typography>Исправлены</Typography>
                <Typography variant="h5">8</Typography>
            </div>
        </div>
    );
}

export default DefectCounter