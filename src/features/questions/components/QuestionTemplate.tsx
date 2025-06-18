import { Box, Divider, Typography } from "@mui/material";

type QuestionTemplateProps = {
    question: Question;
    print?: true | boolean;
    student?: true | boolean;
    questionNumber?: number;
    examName?: string;
};

export default function QuestionTemplate({ question, print = false, student = false, questionNumber, examName }: QuestionTemplateProps) {
    const answerA = question.answers?.find(answer => answer.option === 'A');
    const answerB = question.answers?.find(answer => answer.option === 'B');
    const answerC = question.answers?.find(answer => answer.option === 'C');
    const answerD = question.answers?.find(answer => answer.option === 'D');
    const correctAnswer = question.answers?.find(answer => answer.is_correct === 1);

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

    const InfoRow = ({ label, value, flex = 1 }: { label: string; value: any; flex?: number }) => (
        <Box sx={{ flex, mb: 1.5, ...printStyles }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'text.secondary', mb: 0.5, ...printStyles }}>
                {label}
            </Typography>
            <Typography variant="body2">{value || 'N/A'}</Typography>
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
                {[answerA, answerB, answerC, answerD].map((answer, index) => (
                    <Box
                        key={String.fromCharCode(65 + index)}
                        sx={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            mb: 2,
                            p: 1.5,
                            borderRadius: 1,
                            bgcolor: !student && answer?.is_correct ? 'success.50' : 'grey.50',
                            border: !student && answer?.is_correct ? '2px solid' : '1px solid',
                            borderColor: !student && answer?.is_correct ? 'success.main' : 'grey.300',
                            ...printStyles
                        }}
                    >
                        <OptionLabel>{String.fromCharCode(65 + index)}.</OptionLabel>
                        <Typography sx={{ ml: 2, flex: 1, whiteSpace: 'pre-wrap', ...printStyles }}>
                            {answer?.answer_text}
                        </Typography>
                    </Box>
                ))}
            </Box>



            {!student ? <>

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
                            Correct Answer: {correctAnswer?.option}
                        </Typography>
                    </Box>

                    {/* Justifications */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, ...printStyles }}>
                        {[answerA, answerB, answerC, answerD].map((answer, index) => (
                            <Box
                                key={String.fromCharCode(65 + index)}
                                sx={{
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    p: 1.5,
                                    borderRadius: 1,
                                    bgcolor: answer?.is_correct ? 'success.50' : 'error.50',
                                    ...printStyles
                                }}
                            >
                                <OptionLabel>{String.fromCharCode(65 + index)}.</OptionLabel>
                                <Box sx={{ ml: 2, flex: 1 }}>
                                    <Typography sx={{ fontWeight: 'bold', mb: 0.5, ...printStyles }}>
                                        {answer?.is_correct ? "Correct" : "Incorrect"}
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

                {/* Question Details Section */}
                <Box sx={{ mb: 4 }}>
                    <SectionHeader>Question Details</SectionHeader>

                    {/* First Row - Systems, Category, KA Statement */}
                    <Box sx={{ display: 'flex', gap: 3, mb: 3, flexWrap: 'wrap', ...printStyles }}>
                        <Box sx={{ flex: 1, minWidth: '200px', ...printStyles }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, ...printStyles }}>
                                Systems
                            </Typography>
                            <Box sx={{ bgcolor: 'grey.50', borderRadius: 1, p: 1.5, ...printStyles }}>
                                {question.systems?.map((system, index) => (
                                    <Box
                                        key={system.number}
                                        sx={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            ...printStyles,
                                            borderBottom: index < question.systems!.length - 1 ? '1px solid' : 'none',
                                            borderColor: 'grey.300',
                                            py: 0.5,
                                        }}
                                    >
                                        <Typography variant="body2" sx={{ fontWeight: 'bold', ...printStyles }}>
                                            {system.number}
                                        </Typography>
                                        <Typography variant="body2">{system.name}</Typography>
                                    </Box>
                                ))}
                            </Box>
                        </Box>

                        <Box sx={{ flex: 1, minWidth: '200px', ...printStyles }}>
                            <InfoRow label="Category" value={question.category} />
                            <InfoRow
                                label="KA Statement"
                                value="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
                            />
                        </Box>
                    </Box>

                    {/* Second Row - KA Numbers, KA Importance, Exam Level */}
                    <Box sx={{ display: 'flex', gap: 3, mb: 3, flexWrap: 'wrap', ...printStyles }}>
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, ...printStyles }}>
                                K/A Numbers
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', ...printStyles }}>
                                {question.kas?.map((ka) => (
                                    <Box
                                        key={ka.ka_number}
                                        sx={{
                                            px: 1.5,
                                            py: 0.5,
                                            bgcolor: 'primary.100',
                                            borderRadius: 1,
                                            border: '1px solid',
                                            borderColor: 'primary.300',
                                            // ...printStyles
                                        }}
                                    >
                                        <Typography variant="body2" sx={{ fontWeight: 'bold', ...printStyles }}>
                                            {ka.ka_number}
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>
                        </Box>
                        <InfoRow label="K/A Importance" value="3.8" />
                        <InfoRow label="Exam Level" value={question.exam_level} />
                    </Box>

                    {/* Third Row - References */}
                    <Box sx={{ display: 'flex', gap: 3, mb: 3, flexWrap: 'wrap', ...printStyles }}>
                        <InfoRow label="References Provided to Candidate" value="none" />
                        <InfoRow label="Technical References" value={question.technical_references} />
                    </Box>

                    {/* Fourth Row - Source, Difficulty */}
                    <Box sx={{ display: 'flex', gap: 3, mb: 3, flexWrap: 'wrap', ...printStyles }}>
                        <InfoRow label="Question Source" value="Bank DB 2015 NRC Exam Q2" />
                        <InfoRow label="Level of Difficulty (1-5)" value={question.difficulty_level} />
                    </Box>

                    {/* Fifth Row - Cognitive Level, CFR Content */}
                    <Box sx={{ display: 'flex', gap: 3, mb: 3, flexWrap: 'wrap', ...printStyles }}>
                        <InfoRow label="Cognitive Level" value={question.cognitive_level} />
                        <InfoRow label="10 CFR Part 55 Content" value="41.8 / 41.10 / 45.3" />
                    </Box>

                    {/* Sixth Row - Objective */}
                    <Box sx={{ display: 'flex', gap: 3, mb: 3, flexWrap: 'wrap', ...printStyles }}>
                        <InfoRow label="Objective" value={question.objective} />
                    </Box>
                </Box>
            </> : ''}
        </Box>
    );
}