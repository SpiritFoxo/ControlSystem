import * as React from 'react';
import { useState, useEffect } from 'react';
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
import {
  List,
  ListItem,
  ListItemText,
  Checkbox,
  Alert,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { createDefect, editDefect } from '../api/Defects';
import { createProject, editProject, assignEngineer } from '../api/Projects';
import { getAllUsers } from '../api/Admin';
import { uploadAttachment } from '../api/Attachments';
import { PaginationField } from './PaginationField';

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

export const AssignEngineerModal = ({projectId}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchEmail, setSearchEmail] = useState('');
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ limit: 10, page: 1, total: 0, totalPages: 1 });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchEngineers = async (page = 1, email = '') => {
    try {
      const { users, pagination } = await getAllUsers({ page, email, role: '1' });
      setUsers(users);
      setPagination(pagination);
      setError('');
    } catch (err) {
      setError(err.message || 'Ошибка при получении списка');
      setUsers([]);
      setPagination({ limit: 10, page: 1, total: 0, totalPages: 1 });
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchEngineers(1, searchEmail);
    }
  }, [isOpen, searchEmail]);

  const handleAssign = async (engineerId) => {
    try {
      const response = await assignEngineer(projectId, engineerId);
      setSuccess(response.message || 'Успешно назначен');
      setError('');
      fetchEngineers(pagination.page, searchEmail);
    } catch (err) {
      setError(err.message || 'Ошибка при назначении');
      setSuccess('');
    }
  };

  const handleSearch = (e) => {
    setSearchEmail(e.target.value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    fetchEngineers(newPage, searchEmail);
  };

  return (
    <div>
      <Button
        variant="contained"
        color="primary"
        onClick={() => setIsOpen(true)}
      >
        Назначить инженера
      </Button>

      <Modal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        aria-labelledby="assign-engineer-modal"
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            borderRadius: 1,
            maxHeight: '80vh',
            overflowY: 'auto',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" id="assign-engineer-modal">
              Назначить инженера в проект {projectId}
            </Typography>
            <IconButton onClick={() => setIsOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>

          <TextField
            fullWidth
            label="Поиск по почте"
            variant="outlined"
            value={searchEmail}
            onChange={handleSearch}
            sx={{ mb: 2 }}
          />

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          <List sx={{ maxHeight: 200, overflowY: 'auto', mb: 2 }}>
            {users.length === 0 ? (
              <Typography color="text.secondary" sx={{ p: 2 }}>
                Пустота
              </Typography>
            ) : (
              users.map((user) => (
                <ListItem
                  key={user.id}
                  sx={{ borderBottom: '1px solid', borderColor: 'divider', py: 1 }}
                >
                  <ListItemText primary={user.email} />
                  <Checkbox
                    onChange={() => handleAssign(user.id)}
                    sx={{ color: 'primary.main' }}
                  />
                </ListItem>
              ))
            )}
          </List>

          <PaginationField
            pagination={pagination}
            onPageChange={handlePageChange}
          />

          <Button
            fullWidth
            variant="contained"
            color="secondary"
            onClick={() => setIsOpen(false)}
            sx={{ mt: 2 }}
          >
            Закрыть
          </Button>
        </Box>
      </Modal>
    </div>
  );
};