/**
 * Modular table filter used throughout the application for filtering table records easily
 */

import { Form } from "react-bootstrap";

// Define a default UI for filtering
export default function DefaultColumnFilter({ column: { filterValue, preFilteredRows, setFilter } }) {
    const count = preFilteredRows.length;
    return (
        <Form.Control
            value={filterValue || ""}
            onChange={(e) => {
                setFilter(e.target.value || undefined); // Set undefined to remove the filter entirely
            }}
            placeholder={`Search ${count} records...`}
        />
    );
};
