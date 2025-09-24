import Pagination from "@mui/material/Pagination";

const PaginationField = ({count, page, marginBottom, onChange}) => {
    return (
        <Pagination count={count} page={page} onChange={onChange} color="primary" shape="rounded" sx={{ mb: marginBottom }} />
    );
}

export default PaginationField;