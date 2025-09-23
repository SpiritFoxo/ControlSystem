import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";

const ProjectCard = ({ title, article, onClick }) => {
    return (
        <Card
        sx={{
            maxHeight: 350,
            maxWidth: 240,
            minHeight: 350,
            minWidth: 240,
        }}
        >
            <CardMedia
                sx={{ height: 200 }}
                image="/images/placeholder-project-desktop.jpg"
            />
            <CardContent>
                <Typography variant="h5">
                    {title}
                </Typography>
                <Typography variant="body2">
                    {article}
                </Typography>
            </CardContent>
        </Card>
    );
}

export default ProjectCard;