import Pagination from "@mui/material/Pagination";

const PaginationField = ({count, page, onChange}) => {
    return (
        <Pagination count={count} page={page} onChange={onChange} color="primary" shape="rounded" sx={{ mb: 3 }} />
    );
}

export default PaginationField;