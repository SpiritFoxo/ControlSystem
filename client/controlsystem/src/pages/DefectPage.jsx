import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import {Header} from '../components/AppBar';
import background from "../css/Background.module.css";
import { ReportsTable } from '../components/ReportsTable';
import { PreviewTable } from '../components/PrevievTable';
import { Box, CircularProgress, Alert } from '@mui/material';
import { fetchDefectById, leaveComment, fetchComments } from '../api/Defects';

const DefectPage = () => {
    const { defectId } = useParams();
    const [defect, setDefect] = useState(null);
    const [comments, setComments] = useState([]);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadDefectAndComments = async (page = 1, limit = 10) => {
        try {
        setLoading(true);
        const defectResponse = await fetchDefectById(defectId);
        setDefect(defectResponse.defect);

        const commentsResponse = await fetchComments(defectId, page, limit);
        setComments(commentsResponse.comments || []);
        setPagination(commentsResponse.pagination || {
            page: 1,
            limit: 10,
            total: 0,
            totalPages: 0,
            hasNextPage: false,
            hasPrevPage: false,
        });
        setError(null);
        } catch (err) {
        setError('Failed to load data: ' + err.message);
        } finally {
        setLoading(false);
        }
    };

  useEffect(() => {
    if (defectId) {
      loadDefectAndComments();
    }
  }, [defectId]);

    const handleCommentSubmit = async (comment) => {
        try {
        const newComment = await leaveComment(defectId, comment);
        setComments((prevComments) => [newComment, ...prevComments]);
        setPagination((prev) => ({
            ...prev,
            total: prev.total + 1,
            totalPages: Math.ceil((prev.total + 1) / prev.limit),
            hasNextPage: prev.page < Math.ceil((prev.total + 1) / prev.limit),
        }));
        } catch (err) {
        setError('Failed to post comment: ' + err.message);
        }
    };

    const handlePageChange = (newPage) => {
        loadDefectAndComments(newPage, pagination.limit);
    };


    if (loading) {
        return (
        <div className={background.background}>
            <Header />
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <CircularProgress />
            </Box>
        </div>
        );
    }

    if (error) {
        return (
        <div className={background.background}>
            <Header />
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <Alert severity="error">{error}</Alert>
            </Box>
        </div>
        );
    }

    if (!defect) {
        return (
        <div className={background.background}>
            <Header />
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <Alert severity="warning">Defect not found</Alert>
            </Box>
        </div>
        );
    }
    return (
        <div className={background.background}>
            <Header />
            <div className={background.contentParent}>
                <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: '30px',
                }}>
                    <Typography variant='h3'>{defect.title}</Typography>
                    <Typography variant='body1'>{defect.description}</Typography>
                    <Typography variant='h4'>Медиафайлы</Typography>
                    <PreviewTable images={defect.photosUrl || []} files={defect.filesUrl || []} />
                    <Typography variant='h4'>Комментарии</Typography>
                    <ReportsTable
                        onCommentSubmit={handleCommentSubmit}
                        comments={comments}
                        pagination={pagination}
                        onPageChange={handlePageChange}
                    />
                </Box>
            </div>
        </div>
    );
}

export default DefectPage