import SearchIcon from '@mui/icons-material/Search';
import TextField from "@mui/material/TextField";
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';

export const SearchField = ({ value, onChange, placeholder }) => {
    return (
        <TextField 
        id="outlined-search" 
        label="Найти" 
        type="search"
        InputProps={{
            endAdornment: (
            <InputAdornment position="end">
                <IconButton edge="end" aria-label="search" onClick={() => alert("Поиск...")}>
                <SearchIcon />
                </IconButton>
            </InputAdornment>
                        ),
                    }}
        sx={{width: { md: '50vw', xs: '85vw' }}}
        />
    );

}


