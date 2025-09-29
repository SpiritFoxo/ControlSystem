import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";

const ProjectCard = ({ title, photoUrl, onClick }) => {
    const imagePhoto = photoUrl || "/images/placeholder-project-desktop.jpg";
    return (
        <Card
        sx={{
            display:{ xs: "none", md: "block" },
            maxHeight: 350,
            maxWidth: 240,
            minHeight: 350,
            minWidth: 240,
        }}
        >
            <CardMedia
                sx={{ height: 200 }}
                image={imagePhoto}
            />
            <CardContent>
                <Typography variant="h5">
                    {title}
                </Typography>
            </CardContent>
        </Card>
    );
}

const MobileProjectCard = ({ title, photoUrl, onClick }) => {
    const imagePhoto = photoUrl || "/images/placeholder-project-desktop.jpg";
    return(
        <Card
        sx={{
            display: { xs: "flex", md: "none" },
            alignItems: "center",
            flexDirection: "row-reverse",
            justifyContent: "space-between",
            overflow: "hidden",
            borderRadius: 3,
            maxHeight: 200,
            width: "85vw"
        }}
        >
            <CardMedia
                sx={{ height: 75, width: 100 }}
                image={imagePhoto}
            />
            <CardContent>
                <Typography variant="h5" sx={{ maxWidth: '12ch', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {title}
                </Typography>
            </CardContent>
        </Card>
    );
}

const DefectCard = ({title, authorName, defectStatus, defectName}) => {
    return (
    <Card sx={{ minWidth: 320, maxWidth: 340, minHeight: 360, maxHeight: 360 }}>
        <CardContent sx={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
            <Typography>Фамилия имя</Typography>
            <div style={{background: 'red', borderRadius: '999px'}}></div>
        </CardContent>
      <CardMedia
        sx={{ height: 185 }}
        image="/images/placeholder-project-desktop.jpg"
        title="green iguana"
      />
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          Название
        </Typography>
      </CardContent>
      <CardActions>
        <Button size="small">Редактировать</Button>
        <Button size="small">Удалить</Button>
      </CardActions>
    </Card>
    );
}

const CardParent = {
    ProjectCard,
    MobileProjectCard,
    DefectCard
}

export default CardParent;