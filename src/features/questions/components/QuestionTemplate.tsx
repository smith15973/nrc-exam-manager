import { Box, Divider, Typography } from "@mui/material";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";


type QuestionTemplateProps = {
    question: Question;
    print?: true | boolean;
    student?: true | boolean;
    questionNumber?: number;
    examName?: string;
    examQuestionData?: ExamQuestion
};

export default function QuestionTemplate({ question, print = false, student = false, questionNumber, examName, examQuestionData }: QuestionTemplateProps) {

    const main_system_ka = examQuestionData ? question.system_kas?.find(system_ka =>
        system_ka.ka_number === examQuestionData.main_system_ka_ka && system_ka.system_number === examQuestionData.main_system_ka_system)
        : undefined;


    useEffect(() => {
        // console.log("main_system_ka", main_system_ka)
    }, [main_system_ka])
    useEffect(() => {
        // console.log("eqData", examQuestionData)
    }, [examQuestionData])

    const navigate = useNavigate();

    const answers = [
        {
            answer_text: question.answer_a,
            justification: question.answer_a_justification,
            isCorrect: question.correct_answer === "A",
        },
        {
            answer_text: question.answer_b,
            justification: question.answer_b_justification,
            isCorrect: question.correct_answer === "B",
        },
        {
            answer_text: question.answer_c,
            justification: question.answer_c_justification,
            isCorrect: question.correct_answer === "C",
        },
        {
            answer_text: question.answer_d,
            justification: question.answer_d_justification,
            isCorrect: question.correct_answer === "D",
        },
    ]

    // Print-specific styles
    const printStyles = print ? {
        fontSize: '14px',
        margin: 0,
        padding: 0,
        border: 'none',
        color: 'black !important',
        bgcolor: 'transparent !important',
        borderRadius: 0,
        '@media print': {
            color: 'black !important',
            bgcolor: 'transparent !important'
        }
    } : {};

    const OptionLabel = ({ children }: { children: React.ReactNode }) => (
        <Typography
            component="span"
            sx={{
                fontWeight: 'bold',
                fontSize: '1.1rem',
                letterSpacing: 0.5,
                minWidth: '32px',
                color: 'primary.main',
                ...printStyles
            }}
        >
            {children}
        </Typography>
    );

    const SectionHeader = ({ children }: { children: React.ReactNode }) => (
        <Typography
            variant="h6"
            sx={{
                fontWeight: 'bold',
                color: 'primary.main',
                mb: 2,
                borderBottom: '2px solid',
                borderColor: 'primary.main',
                pb: 0.5,
                ...printStyles
            }}
        >
            {children}
        </Typography>
    );

    const InfoRow = ({ label, value, flex = 1 }: { label: string; value: unknown; flex?: number }) => (
        <Box sx={{ flex, mb: 1.5, ...printStyles }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'text.secondary', mb: 0.5, ...printStyles }}>
                {label}
            </Typography>
            <Typography variant="body2">{value != null ? String(value) : 'N/A'}</Typography>
        </Box>
    );

    return (
        <Box sx={{
            p: 3,
            maxWidth: '100%',
            bgcolor: 'background.paper',
            ...printStyles,
            ...(print && {
                width: '100vw', // Make it use the full width of the printed page
                maxWidth: '100%',
                p: 0,            // Remove padding for edge-to-edge printing
                m: 0,
                '@media print': {
                    width: '100vw',
                    margin: 0,
                    padding: 0,
                },
            }),
        }}>
            {examName ? (
                <Box display="flex" justifyContent="center">
                    <Typography
                        variant="h4"
                        sx={{
                            fontWeight: 'bold',
                            mb: 1,
                            color: 'text.primary',
                            textAlign: 'center',
                            ...printStyles,
                        }}
                    >
                        {examName}
                    </Typography>
                </Box>
            ) : ''}

            {/* Question Section */}
            <Box sx={{ mb: 4 }}>
                {questionNumber ?
                    <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1, color: 'text.primary', ...printStyles }}>
                        Question {questionNumber}
                    </Typography> : ''
                }
                <Typography
                    variant="body1"
                    sx={{
                        mb: 3,
                        lineHeight: 1.6,
                        fontSize: '1.1rem',
                        whiteSpace: 'pre-wrap',
                        ...printStyles
                    }}
                >
                    {question.question_text}
                </Typography>
            </Box>

            {/* Answer Options */}
            <Box sx={{ mb: 4 }}>
                {answers.map((answer, index) => (
                    <Box
                        key={String.fromCharCode(65 + index)}
                        sx={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            mb: 2,
                            p: 1.5,
                            borderRadius: 1,
                            bgcolor: !student && answer?.isCorrect ? 'success.50' : 'grey.50',
                            border: !student && answer?.isCorrect ? '2px solid' : '1px solid',
                            borderColor: !student && answer?.isCorrect ? 'success.main' : 'grey.300',
                            ...printStyles
                        }}
                    >
                        <OptionLabel>{String.fromCharCode(65 + index)}.</OptionLabel>
                        <Typography sx={{ ml: 2, flex: 1, whiteSpace: 'pre-wrap', ...printStyles }}>
                            {answer.answer_text}
                        </Typography>
                    </Box>
                ))}
            </Box>



            {!student ?
                <>

                    <Divider sx={{ my: 3 }} />

                    {/* Correct Answer Section */}
                    <Box sx={{ mb: 4 }}>
                        <SectionHeader>Answer & Justifications</SectionHeader>
                        <Box
                            sx={{
                                p: 2,
                                bgcolor: 'success.50',
                                borderRadius: 1,
                                border: '2px solid',
                                borderColor: 'success.main',
                                mb: 3,
                                ...printStyles
                            }}
                        >
                            <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'success.dark', ...printStyles }}>
                                Correct Answer: {question.correct_answer}
                            </Typography>
                        </Box>

                        {/* Justifications */}
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, ...printStyles }}>
                            {answers.map((answer, index) => (
                                <Box
                                    key={String.fromCharCode(65 + index)}
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        p: 1.5,
                                        borderRadius: 1,
                                        bgcolor: answer?.isCorrect ? 'success.50' : 'error.50',
                                        ...printStyles
                                    }}
                                >
                                    <OptionLabel>{String.fromCharCode(65 + index)}.</OptionLabel>
                                    <Box sx={{ ml: 2, flex: 1 }}>
                                        <Typography sx={{ fontWeight: 'bold', mb: 0.5, ...printStyles }}>
                                            {answer?.isCorrect ? "Correct" : "Incorrect"}
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{ whiteSpace: 'pre-wrap', ...printStyles }}
                                        >
                                            {answer?.justification}
                                        </Typography>
                                    </Box>
                                </Box>
                            ))}
                        </Box>
                    </Box>

                    <Divider sx={{ my: 3 }} />

                    <Box sx={{ mb: 4 }}>
                        <SectionHeader>Question Details</SectionHeader>

                        {/* First Row - KA Numbers, KA Importance, Exam Level */}
                        <Box sx={{ display: 'flex', gap: 3, mb: 3, flexWrap: 'wrap', ...printStyles }}>
                            <Box sx={{ flex: 1 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, ...printStyles }}>
                                    Related System KA Numbers
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', ...printStyles }}>
                                    {question.system_kas?.map((system_ka) => (
                                        <Box
                                            onClick={() => navigate(`/system_kas/${system_ka.system_ka_number}`)}
                                            key={system_ka.system_ka_number}
                                            sx={{
                                                px: 1.5,
                                                py: 0.5,
                                                bgcolor: 'primary.100',
                                                borderRadius: 1,
                                                border: '1px solid',
                                                borderColor: 'primary.300',
                                                color: system_ka.system_ka_number === main_system_ka?.system_ka_number ? 'green' : '',
                                                cursor: 'pointer', // Add pointer cursor for link style
                                                // ...printStyles
                                            }}
                                        >
                                            <Typography variant="body2" sx={{ fontWeight: 'bold', ...printStyles }}>
                                                {system_ka.system_ka_number}
                                            </Typography>
                                        </Box>
                                    ))}
                                </Box>
                            </Box>
                            <InfoRow label="Exam Level" value={question.exam_level ? 'SRO' : 'RO'} />
                        </Box>

                        {/* Second Row - References */}
                        <Box sx={{ display: 'flex', gap: 3, mb: 3, flexWrap: 'wrap', ...printStyles }}>
                            <InfoRow label="References Provided to Candidate" value="none" />
                            <InfoRow label="Technical References" value={question.technical_references} />
                        </Box>

                        {/* Third Row - Cognitive Level, Objective */}
                        <Box sx={{ display: 'flex', gap: 3, mb: 3, flexWrap: 'wrap', ...printStyles }}>
                            <InfoRow label="Cognitive Level" value={question.cognitive_level ? 'HIGH' : 'LOW'} />
                            <InfoRow label="Objective" value={question.objective} />
                        </Box>

                        {/* Exam Relations */}

                        <Box sx={{ display: 'flex', gap: 3, mb: 3, flexWrap: 'wrap', ...printStyles }}>
                            <Box sx={{ flex: 1, minWidth: '200px', ...printStyles }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, ...printStyles }}>
                                    Exams
                                </Typography>
                                <Box sx={{ bgcolor: 'grey.50', borderRadius: 1, p: 1.5, ...printStyles }}>
                                    {question.question_exams && question.question_exams.length > 0 ? question.question_exams.map((qe, index) => (
                                        <Box
                                        onClick={() => navigate(`/exams/${qe.exam_id}`)}
                                        sx={{
                                            cursor: 'pointer',
                                            '&:hover': {
                                                bgcolor: 'primary.100',
                                            },
                                            ...printStyles,
                                            borderBottom: question.question_exams && index < question.question_exams.length - 1 ? '1px solid' : 'none',
                                            borderColor: 'grey.300',
                                            py: 0.5,
                                            color: qe.exam_id === examQuestionData?.exam_id ? 'green' : ''
                                        }}
                                            key={qe.exam_id}
                                            // sx={{
                                            //     display: 'flex',
                                            //     // justifyContent: 'space-between',
                                            //     ...printStyles,
                                            //     borderBottom: question.question_exams && index < question.question_exams.length - 1 ? '1px solid' : 'none',
                                            //     borderColor: 'grey.300',
                                            //     py: 0.5,
                                            //     color: qe.exam_id === examQuestionData?.exam_id ? 'green' : ''
                                            // }}
                                        >
                                            <Typography variant="body2" sx={{ fontWeight: 'bold', ...printStyles }}>
                                                Question #{qe.question_number}:
                                            </Typography>
                                            <Typography variant="body2">{qe.exam?.name}</Typography>
                                        </Box>
                                    ))
                                        : <Box
                                            sx={{
                                                display: 'flex',
                                                justifyContent: 'center',
                                                ...printStyles,
                                                borderBottom: 'none',
                                                borderColor: 'grey.300',
                                                py: 0.5,
                                            }}
                                        >
                                            <Typography variant="body2" sx={{ fontWeight: 'bold', ...printStyles }}>
                                                No Exam Relations
                                            </Typography>
                                        </Box>}
                                </Box>
                            </Box>
                        </Box>

                    </Box>

                    {main_system_ka ?

                        // Question Details Section
                        <Box sx={{ mb: 4 }}>
                            <SectionHeader>Exam Question Details</SectionHeader>

                            {/* Justification */}
                            <Box sx={{ display: 'flex', gap: 3, mb: 3, flexWrap: 'wrap', ...printStyles }}>
                                <InfoRow label="KA Match Justification" value={examQuestionData?.ka_match_justification} />
                                {examQuestionData?.sro_match_justification ? <InfoRow label="SRO Match Justification" value={examQuestionData?.sro_match_justification} /> : ''}
                            </Box>

                            {/* Third Row - Cognitive Level, Objective */}
                            <Box sx={{ display: 'flex', gap: 3, mb: 3, flexWrap: 'wrap', ...printStyles }}>
                                <InfoRow label="Category" value={main_system_ka.category} />
                                <InfoRow label="KA Statement" value={main_system_ka.ka_statement} />
                            </Box>

                            <Box sx={{ display: 'flex', gap: 3, mb: 3, flexWrap: 'wrap', ...printStyles }}>
                                <InfoRow label="Importance Level" value={question.exam_level === 1 ? main_system_ka.sro_importance : main_system_ka.ro_importance} />
                                <InfoRow label="10 CFR Part 55 Content" value={main_system_ka.cfr_content} />
                            </Box>
                        </Box> : ""
                    }

                </> : ''
            }
        </Box>
    );
}