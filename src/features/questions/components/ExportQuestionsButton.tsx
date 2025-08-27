import { Alert, Button, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { Box } from "@mui/system";
import React, { useState } from "react";

interface ExportQuestionsButtonProps {
    questionIds: number[];
    buttonText?: string;
    onClick?: () => void;
    onExport: () => void;
}

type ExportFormat = 'json' | 'docx';

export default function ExportQuestionsButton(props: ExportQuestionsButtonProps) {
    const { questionIds, buttonText, onClick, onExport } = props;
    const [status, setStatus] = useState<null | { success: boolean, msg: React.ReactNode }>();
    const [dialogOpen, setDialogOpen] = useState(false);

    const openFileLocation = (filePath: string) => {
        window.files.openLocation(filePath);
    };

    const handleExportFormat = async (format: ExportFormat) => {
        setDialogOpen(false);
        
        try {
            let result;
            if (format === 'json') {
                result = await window.files.export.questions(questionIds);
            } else {
                result = await window.files.export.docx(questionIds);
            }

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
                onExport();
            } else {
                if (result.error === "Export cancelled by user") {
                    setStatus(null);
                } else {
                    setStatus({ success: false, msg: `Error: ${result.error}` });
                }
            }
        } catch (error: unknown) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            setStatus({ success: false, msg: `Unexpected error: ${errorMsg}` });
        }

        if (onClick) {
            onClick();
        }
    };

    const handleExportClick = () => {
        setDialogOpen(true);
    };

    const handleDialogClose = () => {
        setDialogOpen(false);
    };

    return (
        <>
            <Button
                disabled={questionIds.length < 1}
                onClick={handleExportClick}
            >
                {buttonText || "Export Questions"}
            </Button>

            <Dialog open={dialogOpen} onClose={handleDialogClose} maxWidth="sm" fullWidth>
                <DialogTitle>Choose Export Format</DialogTitle>
                <DialogContent sx={{ pb: 2 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                        <Box
                            onClick={() => handleExportFormat('json')}
                            sx={{
                                border: '1px solid #e0e0e0',
                                borderRadius: 2,
                                p: 3,
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                '&:hover': {
                                    borderColor: '#1976d2',
                                    backgroundColor: '#f5f5f5'
                                }
                            }}
                        >
                            <Box sx={{ fontWeight: 'bold', fontSize: '1.1rem', mb: 0.5 }}>
                                JSON
                            </Box>
                            <Box sx={{ color: 'text.secondary', fontSize: '0.9rem' }}>
                                Export as structured JSON data file
                            </Box>
                        </Box>
                        
                        <Box
                            onClick={() => handleExportFormat('docx')}
                            sx={{
                                border: '1px solid #e0e0e0',
                                borderRadius: 2,
                                p: 3,
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                '&:hover': {
                                    borderColor: '#1976d2',
                                    backgroundColor: '#f5f5f5'
                                }
                            }}
                        >
                            <Box sx={{ fontWeight: 'bold', fontSize: '1.1rem', mb: 0.5 }}>
                                DOCX
                            </Box>
                            <Box sx={{ color: 'text.secondary', fontSize: '0.9rem' }}>
                                Export as Microsoft Word document
                            </Box>
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ justifyContent: 'flex-start', pl: 3, pb: 2 }}>
                    <Button onClick={handleDialogClose} variant="outlined">
                        Cancel
                    </Button>
                </DialogActions>
            </Dialog>

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