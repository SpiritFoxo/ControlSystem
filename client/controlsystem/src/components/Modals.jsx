import * as React from 'react';
import { useState } from 'react';
import Backdrop from '@mui/material/Backdrop';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Fade from '@mui/material/Fade';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { createDefect, editDefect } from '../api/Defects';
import { createProject, editProject } from '../api/Projects';
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
  sm: {width:'250px'},
};

export const AddEntityModal = ({ entityType, projectId }) => {
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
      <Button onClick={handleOpen} variant='contained'>
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


export const EditEntityModal = ({ entityType, entityId, title: initialTitle, description: initialDescription, status: initialStatus, priority: initialPriority }) => {
  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState([]);
  const [title, setTitle] = useState(initialTitle || '');
  const [description, setDescription] = useState(initialDescription || '');
  const [status, setStatus] = useState(initialStatus || 'Новая');
  const [priority, setPriority] = useState(initialPriority || 'Средний');

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setFiles([]);
    setTitle(initialTitle || '');
    setDescription(initialDescription || '');
    setStatus(initialStatus || 'Новая');
    setPriority(initialPriority || 'Средний');
  };

  const handleTitleChange = (event) => {
    setTitle(event.target.value);
  };

  const handleDescriptionChange = (event) => {
    setDescription(event.target.value);
  };

  const handleStatusChange = (event) => {
    setStatus(event.target.value);
  };

  const handlePriorityChange = (event) => {
    setPriority(event.target.value);
  };

  const handleSubmit = async () => {
    try {
      let response;
      if (entityType === 'project') {
        response = await editProject(entityId, title, description, status);
      } else if (entityType === 'defect') {
        response = await editDefect(entityId, title, description, priority, status);
      } else {
        throw new Error('Неизвестный тип сущности');
      }

      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append(entityType === 'project' ? 'projectId' : 'defectId', entityId);
        await uploadAttachment(formData);
      }

      alert(`${entityType === 'project' ? 'Проект' : 'Дефект'} успешно обновлен!`);
      handleClose();
    } catch (err) {
      console.error(`Ошибка при обновлении ${entityType === 'project' ? 'проекта' : 'дефекта'}:`, err);
      alert(`Произошла ошибка при обновлении ${entityType === 'project' ? 'проекта' : 'дефекта'}.`);
    }
  };

  return (
    <div>
      <Button onClick={handleOpen} variant="contained">
        {entityType === 'project' ? 'Редактировать проект' : 'Редактировать дефект'}
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
              {entityType === 'project' ? 'Редактировать проект' : 'Редактировать дефект'}
            </Typography>
            <TextField
              label="Заголовок"
              variant="outlined"
              value={title}
              onChange={handleTitleChange}
              fullWidth
              sx={{ mb: 2 }}
            />
            <TextField
              label="Описание"
              variant="outlined"
              value={description}
              onChange={handleDescriptionChange}
              fullWidth
              multiline
              rows={4}
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="status-label">Статус</InputLabel>
              <Select
                labelId="status-label"
                value={status}
                label="Статус"
                onChange={handleStatusChange}
              >
                <MenuItem value="1">Новая</MenuItem>
                <MenuItem value="2">В работе</MenuItem>
                <MenuItem value="3">На проверке</MenuItem>
                <MenuItem value="4">Закрыта</MenuItem>
              </Select>
            </FormControl>
            {entityType === 'defect' && (
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel id="priority-label">Приоритет</InputLabel>
                <Select
                  labelId="priority-label"
                  value={priority}
                  label="Приоритет"
                  onChange={handlePriorityChange}
                >
                  <MenuItem value="1">Низкий</MenuItem>
                  <MenuItem value="2">Средний</MenuItem>
                  <MenuItem value="3">Высокий</MenuItem>
                </Select>
              </FormControl>
            )}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
              <Button variant="contained" color="primary" onClick={handleSubmit}>
                Сохранить
              </Button>
              <Button variant="outlined" onClick={handleClose}>
                Отмена
              </Button>
            </Box>
          </Box>
        </Fade>
      </Modal>
    </div>
  );
};
