import { Alert } from "@mui/material";
import { useDatabase } from "../hooks/useDatabase";

export default function ErrorPopup() {
    const { error } = useDatabase();
    return (
        error ? (
            <Alert severity="error" sx={{ mb: 2 }}>
                {error}
            </Alert>
        ) : null
    );
}