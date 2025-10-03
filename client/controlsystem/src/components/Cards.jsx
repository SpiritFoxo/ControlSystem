import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";

export const ProjectCard = ({ title, photoUrl, onClick }) => {
    const imagePhoto = photoUrl || "/images/placeholder-project-desktop.jpg";
    return (
        <Card
        sx={{
            display:{ xs: "none", md: "block" },
            maxHeight: 350,
            maxWidth: 240,
            minHeight: 350,
            minWidth: 240,
            cursor: "pointer",
        }}
        onClick={onClick}
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

export const MobileProjectCard = ({ title, photoUrl, onClick }) => {
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
        onClick={onClick}
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

export const DefectCard = ({ title, authorName, defectStatus, defectName, photoUrl, onClick }) => {
    return (
        <Card sx={{ minWidth: 320, maxWidth: 340, minHeight: 360, maxHeight: 360, display: {xl: 'block', lg: 'block', sm: 'none', xs: 'none'} }} onClick={onClick}>
            <CardContent sx={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
                <Typography>{authorName}</Typography>
                <div
                    style={{
                        background: defectStatus === 1 ? "yellow" : "red",
                        borderRadius: "999px",
                        width: 10,
                        height: 10,
                    }}
                ></div>
            </CardContent>
            <CardMedia
                sx={{ height: 185 }}
                image={photoUrl || "/images/placeholder-project-desktop.jpg"}
                title={defectName}
            />
            <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                    {title || defectName}
                </Typography>
            </CardContent>
            <CardActions>
                <Button size="small">Редактировать</Button>
                <Button size="small">Удалить</Button>
            </CardActions>
        </Card>
    );
}

export const MobileDefectCard = ({ title, defectStatus, defectName, photoUrl, onClick }) => {
    return (
        <Card sx={{ maxHeight: 200, width: '90vw',display: {xl: 'none', lg: 'none', sm: 'flex', xs: 'flex'}, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }} onClick={onClick}>
            <CardContent>
                <div
                    style={{
                        background: defectStatus === 1 ? "yellow" : "red",
                        borderRadius: "999px",
                        width: 40,
                        height: 40,
                    }}
                />
            </CardContent>
            <CardContent>
                <Box>
                    <Typography gutterBottom variant="h5" component="div">
                        {title || defectName}
                    </Typography>
                </Box>
            </CardContent>
            <CardMedia
                sx={{ width: 100, height: 100 }}
                image={photoUrl || "/images/placeholder-project-desktop.jpg"}
                title={defectName}
            />
        </Card>
    );
}
