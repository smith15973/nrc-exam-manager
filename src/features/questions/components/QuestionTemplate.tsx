import { Box, Divider, Typography } from "@mui/material";

type QuestionTemplateProps = {
    question: Question;
};

export default function QuestionTemplate({ question }: QuestionTemplateProps) {
    const answerA = question.answers?.find(answer => answer.option === 'A');
    const answerB = question.answers?.find(answer => answer.option === 'B');
    const answerC = question.answers?.find(answer => answer.option === 'C');
    const answerD = question.answers?.find(answer => answer.option === 'D');
    const correctAnswer = question.answers?.find(answer => answer.is_correct === 1);

    // Define your reusable styles
    const styles = {
        sectionHeader: {
            fontWeight: 'bold',
            fontSize: '1.2rem',
            color: 'primary.main',
            mb: 2,
            borderBottom: '2px solid',
            borderColor: 'primary.main',
            pb: 0.5
        },

        cardStyle: {
            p: 2,
            bgcolor: 'grey.50',
            borderRadius: 1,
            border: '1px solid',
            borderColor: 'grey.300',
            mb: 2
        },

        optionLabel: {
            fontWeight: 'bold',
            fontSize: '1.1rem',
            letterSpacing: 0.5,
            minWidth: '32px',
            color: 'primary.main'
        }
    };

    const OptionLabel = ({ children }: { children: React.ReactNode }) => (
        <Typography
            component="span"
            sx={styles.optionLabel}
        >
            {children}
        </Typography>
    );

    const SectionHeader = ({ children }: { children: React.ReactNode }) => (
        <Typography
            variant="h6"
            sx={styles.sectionHeader}
        >
            {children}
        </Typography>
    );

    const InfoRow = ({ label, value, flex = 1 }: { label: string; value: any; flex?: number }) => (
        <Box sx={{ flex, mb: 1.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'text.secondary', mb: 0.5 }}>
                {label}
            </Typography>
            <Typography variant="body2">{value || 'N/A'}</Typography>
        </Box>
    );



    return (
        <Box sx={{ p: 3, maxWidth: '100%', bgcolor: 'background.paper' }}>
            {/* Question Section */}
            <Box sx={{ mb: 4, display: 'flex' }}>
                <OptionLabel>
                    {1}.
                </OptionLabel>
                <Typography
                    variant="body1"
                    sx={{
                        mb: 3,
                        lineHeight: 1.6,
                        fontSize: '1.1rem',
                        whiteSpace: 'pre-wrap'
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
                            bgcolor: 'grey.50',
                            border: '1px solid',
                            borderColor: 'grey.300'
                        }}
                    >
                        <OptionLabel>{String.fromCharCode(65 + index)}.</OptionLabel>
                        <Typography sx={{ ml: 2, flex: 1, whiteSpace: 'pre-wrap' }}>
                            {answer?.answer_text}
                        </Typography>
                    </Box>
                ))}
            </Box>

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
                        mb: 3
                    }}
                >
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'success.dark' }}>
                        Correct Answer: {correctAnswer?.option}
                    </Typography>
                </Box>

                {/* Justifications */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    {[answerA, answerB, answerC, answerD].map((answer, index) => (
                        <Box
                            key={String.fromCharCode(65 + index)}
                            sx={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                p: 1.5,
                                borderRadius: 1,
                                bgcolor: answer?.is_correct ? 'success.50' : 'error.50'
                            }}
                        >
                            <OptionLabel>{String.fromCharCode(65 + index)}.</OptionLabel>
                            <Box sx={{ ml: 2, flex: 1 }}>
                                <Typography sx={{ fontWeight: 'bold', mb: 0.5 }}>
                                    {answer?.is_correct ? "Correct" : "Incorrect"}
                                </Typography>
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{ whiteSpace: 'pre-wrap' }}
                                >
                                    {"justification"}
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
                <Box sx={{ display: 'flex', gap: 3, mb: 3, flexWrap: 'wrap' }}>
                    <Box sx={{ flex: 1, minWidth: '200px' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                            Systems
                        </Typography>
                        <Box sx={{ bgcolor: 'grey.50', borderRadius: 1, p: 1.5 }}>
                            {question.systems?.map((system, index) => (
                                <Box
                                    key={system.number}
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        py: 0.5,
                                        borderBottom: index < question.systems!.length - 1 ? '1px solid' : 'none',
                                        borderColor: 'grey.300'
                                    }}
                                >
                                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                        {system.number}
                                    </Typography>
                                    <Typography variant="body2">{system.name}</Typography>
                                </Box>
                            ))}
                        </Box>
                    </Box>

                    <Box sx={{ flex: 1, minWidth: '200px' }}>
                        <InfoRow label="Category" value={question.category} />
                        <InfoRow label="KA Statement" value="KA Statement filler. KA Statement filler. KA Statement filler. KA Statement filler." />
                    </Box>
                </Box>

                {/* Second Row - KA Numbers, KA Importance, Exam Level */}
                <Box sx={{ display: 'flex', gap: 3, mb: 3, flexWrap: 'wrap' }}>
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                            K/A Numbers
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            {question.kas?.map((ka) => (
                                <Box
                                    key={ka.ka_number}
                                    sx={{
                                        px: 1.5,
                                        py: 0.5,
                                        bgcolor: 'primary.100',
                                        borderRadius: 1,
                                        border: '1px solid',
                                        borderColor: 'primary.300'
                                    }}
                                >
                                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
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
                <Box sx={{ display: 'flex', gap: 3, mb: 3, flexWrap: 'wrap' }}>
                    <InfoRow label="References Provided to Candidate" value="none" />
                    <InfoRow label="Technical References" value={question.technical_references} />
                </Box>

                {/* Fourth Row - Source, Difficulty */}
                <Box sx={{ display: 'flex', gap: 3, mb: 3, flexWrap: 'wrap' }}>
                    <InfoRow label="Question Source" value="Bank DB 2015 NRC Exam Q2" />
                    <InfoRow label="Level of Difficulty (1-5)" value={question.difficulty_level} />
                </Box>

                {/* Fifth Row - Cognitive Level, CFR Content */}
                <Box sx={{ display: 'flex', gap: 3, mb: 3, flexWrap: 'wrap' }}>
                    <InfoRow label="Cognitive Level" value={question.cognitive_level} />
                    <InfoRow label="10 CFR Part 55 Content" value="41.8 / 41.10 / 45.3" />
                </Box>

                {/* Sixth Row - Objective */}
                <Box sx={{ display: 'flex', gap: 3, mb: 3, flexWrap: 'wrap' }}>
                    <InfoRow label="Objective" value={question.objective} />
                </Box>
            </Box>
        </Box>
    );
}