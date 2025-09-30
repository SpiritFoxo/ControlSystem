import * as React from 'react';
import Backdrop from '@mui/material/Backdrop';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Fade from '@mui/material/Fade';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import { createDefect } from '../api/Defects';
import { createProject } from '../api/Projects';
import { uploadAttachment } from '../api/Attachments';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: '#e6e6fa',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
};

const AddEntityModal = ({ entityType, projectId }) => {
  const [open, setOpen] = React.useState(false);
  const [files, setFiles] = React.useState([]);
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setFiles([]);
    setTitle('');
    setDescription('');
  };

  const handleFileChange = (event) => {
    setFiles(Array.from(event.target.files));
  };

  const handleTitleChange = (event) => {
    setTitle(event.target.value);
  };

  const handleDescriptionChange = (event) => {
    setDescription(event.target.value);
  };

  const handleSubmit = async () => {
    if (!title || !description || files.length === 0) {
      alert('Пожалуйста, заполните все поля и выберите хотя бы один файл.');
      return;
    }

    try {
      let response;
      let entityId;
      switch (entityType) {
        case 'project':
          response = await createProject(title, description);
          entityId = response.project_id;
          break;
        case 'defect':
          response = await createDefect(projectId, title, description);
          entityId = response.data.defect?.ID;
          break;
        default:
          throw new Error('Неизвестный тип сущности');
      }

      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append(entityType === 'project' ? 'projectId' : 'defectId', entityId);
        await uploadAttachment(formData);
      }

      alert(`${entityType === 'project' ? 'Проект' : 'Дефект'} и вложения успешно добавлены!`);
      handleClose();
    } catch (err) {
      console.error(`Ошибка при добавлении ${entityType === 'project' ? 'проекта' : 'дефекта'} или вложений:`, err);
      alert(`Произошла ошибка при добавлении ${entityType === 'project' ? 'проекта' : 'дефекта'} или вложений.`);
    }
  };

  return (
    <div>
      <Button onClick={handleOpen}>
        {entityType === 'project' ? 'Создать проект' : 'Сообщить о дефекте'}
      </Button>
      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        open={open}
        onClose={handleClose}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{
          backdrop: {
            timeout: 500,
          },
        }}
      >
        <Fade in={open}>
          <Box sx={style}>
            <Typography id="transition-modal-title" variant="h6" component="h2" sx={{ mb: 2 }}>
              {entityType === 'project' ? 'Добавить новый проект' : 'Добавить новый дефект'}
            </Typography>
            <TextField
              placeholder="Заголовок"
              variant="outlined"
              value={title}
              onChange={handleTitleChange}
              fullWidth
              sx={{ mb: 2 }}
            />
            <TextField
              placeholder="Описание"
              variant="outlined"
              value={description}
              onChange={handleDescriptionChange}
              fullWidth
              sx={{ mb: 2 }}
            />
            <input
              type="file"
              accept={entityType === 'project' ? 'image/*' : 'image/*,application/pdf'}
              onChange={handleFileChange}
              style={{ marginBottom: '16px' }}
              multiple
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
              <Button variant="contained" color="primary" onClick={handleSubmit}>
                Создать
              </Button>
            </Box>
          </Box>
        </Fade>
      </Modal>
    </div>
  );
};

export default AddEntityModal;