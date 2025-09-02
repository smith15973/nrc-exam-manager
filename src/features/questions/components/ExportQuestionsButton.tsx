import { Alert, Button, Dialog, DialogTitle, DialogContent, DialogActions, FormControl, InputLabel, Select, MenuItem, FormControlLabel, Checkbox } from "@mui/material";
import { Box } from "@mui/system";
import React, { useState } from "react";

interface ExportQuestionsButtonProps {
    questionIds: number[];
    examId?: number;
    buttonText?: string;
    onClick?: () => void;
    onExport: () => void;
}

type ExportFormat = 'json' | 'docx';

export default function ExportQuestionsButton(props: ExportQuestionsButtonProps) {
    const { questionIds, buttonText, onClick, onExport, examId } = props;
    const [status, setStatus] = useState<null | { success: boolean, msg: React.ReactNode }>();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState('template1');
    const [entireExam, setEntireExam] = useState(true);

    // Placeholder templates - you can replace this with your actual data later
    const templates = [
        { id: 'template1', name: 'Template 1' },
        { id: 'template2', name: 'Template 2' },
        { id: 'template3', name: 'Template 3' }
    ];

    const openFileLocation = (filePath: string) => {
        window.files.openLocation(filePath);
    };

    const handleExportFormat = async (format: ExportFormat) => {
        if (format === 'json') {
            setDialogOpen(false);
            
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
        }
        // For DOCX, we don't close the dialog yet - user needs to select template and options
    };

    const handleDocxExport = async () => {
        setDialogOpen(false);
        
        try {
            // You can pass the selectedTemplate and entireExam to your export function
            const result = await window.files.export.docx(questionIds, entireExam ? examId : undefined);

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
                        
                        {/* <Box
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
                        </Box> */}

                        {/* DOCX Options - shown when DOCX is being configured */}
                        <Box sx={{ 
                            mt: 2, 
                            p: 2, 
                            border: '1px solid #e0e0e0', 
                            borderRadius: 2,
                            backgroundColor: '#fafafa'
                        }}>
                            <Box sx={{ fontWeight: 'bold', mb: 2 }}>DOCX</Box>
                            
                            <FormControl fullWidth sx={{ mb: 2 }}>
                                <InputLabel>Template</InputLabel>
                                <Select
                                    value={selectedTemplate}
                                    onChange={(e) => setSelectedTemplate(e.target.value)}
                                    label="Template"
                                >
                                    {templates.map((template) => (
                                        <MenuItem key={template.id} value={template.id}>
                                            {template.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            {examId && (
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={entireExam}
                                            onChange={(e) => setEntireExam(e.target.checked)}
                                        />
                                    }
                                    label="Include Exam Data"
                                />
                            )}

                            <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                                <Button 
                                    variant="contained" 
                                    onClick={handleDocxExport}
                                    size="small"
                                >
                                    Export DOCX
                                </Button>
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