import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";

const ProjectCard = ({ title, onClick }) => {
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
                image="/images/placeholder-project-desktop.jpg"
            />
            <CardContent>
                <Typography variant="h5">
                    {title}
                </Typography>
            </CardContent>
        </Card>
    );
}

const MobileProjectCard = ({ title, onClick }) => {
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
                image="/images/placeholder-project-desktop.jpg"
            />
            <CardContent>
                <Typography variant="h5" sx={{ maxWidth: '12ch', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {title}
                </Typography>
            </CardContent>
        </Card>
    );
}

const CardParent = {
    ProjectCard,
    MobileProjectCard
}

export default CardParent;