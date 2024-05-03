/**
 * Modular select filter used throughout the application for multi-selects
 */

import { useMemo } from "react";
import { Row } from "react-table";
import { Form } from "react-bootstrap";

export default function SelectColumnFilter({ column: { filterValue, setFilter, preFilteredRows, id } }) {
    // Calculate the options for filtering
    // using the preFilteredRows
    const options = useMemo(() => {
        const options = new Set();
        preFilteredRows.forEach((row: Row) => {
            options.add(row.values[id]);
        });
        return Array.from(options);
    }, [id, preFilteredRows]);

    // Render a multi-select box
    return (
        <Form.Select
            value={filterValue}
            onChange={(e) => {
                setFilter(e.target.value || undefined);
            }}
        >
            <option value="">All</option>
            {options.map((option, i) => (
                <option key={i} value={option}>
                    {option}
                </option>
            ))}
        </Form.Select>
    );
};
