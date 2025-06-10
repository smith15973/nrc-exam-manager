import { Alert, Button } from "@mui/material";
import { Box } from "@mui/system";
import React, { useState } from "react";


interface ExportQuestionsButtonProps {
    questionIds: number[];
    buttonText?: string;
    onClick?: () => void;
}

export default function ExportQuestionsButton(props: ExportQuestionsButtonProps) {
    const { questionIds, buttonText, onClick } = props;
    const [status, setStatus] = useState<null | { success: boolean, msg: React.ReactNode }>();

    const openFileLocation = (filePath: string) => {
        window.files.openLocation(filePath);
    };


    const handleExport = async () => {
        try {
            const result = await window.files.export.questions(questionIds);
            if (result.success) {
                const filePath = result.filePath;
                setStatus({
                    success: true,
                    msg: filePath ? (
                        <>
                            Successfully Exported! See in files:{" "}
                            <button
                                onClick={() => openFileLocation(filePath)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    padding: 0,
                                    textDecoration: "underline",
                                    color: "#1976d2",
                                    cursor: 'pointer'
                                }}
                            >
                                {filePath}
                            </button>
                        </>
                    ) : <> Successfully Exported! </>
                });
            } else {
                if (result.error === "Export cancelled by user") {
                    setStatus(null);
                } else {
                    setStatus({ success: false, msg: `Error: ${result.error}` });
                }
            }
        } catch (error: any) {
            setStatus({ success: false, msg: `Unexpected error: ${error?.message || error}` });
        }

        if (onClick) {
            onClick();
        }
    }

    return (
        <>
            <Button
                disabled={questionIds.length < 1}
                onClick={handleExport}
            >
                {buttonText || "Export Questions"}
            </Button>


            {status ?
                <Box sx={{ pt: 2 }}>
                    <Alert severity={status?.success ? "success" : 'error'} onClose={() => setStatus(null)}>
                        {status.msg}
                    </Alert>
                </Box> : ''
            }


        </>
    )
}