import { Box } from "@mui/material";


type QuestionTemplateProps = {
    question: Question;
};

export default function QuestionTemplate({ question }: QuestionTemplateProps) {

    const answerA = question.answers?.find(answer => answer.option === 'A')
    const answerB = question.answers?.find(answer => answer.option === 'B')
    const answerC = question.answers?.find(answer => answer.option === 'C')
    const answerD = question.answers?.find(answer => answer.option === 'D')
    const correctAnswer = question.answers?.find(answer => answer.is_correct === 1)

    return (
        <>
            <Box>

                <Box>{1}. {question.question_text}.</Box>

                <br></br>

                <Box display={"flex"}>
                    <Box sx={{
                        fontWeight: 'bold',
                        fontSize: '1.1rem',
                        letterSpacing: 1,
                        mr: 1,
                    }}>A. </Box>
                    <Box>{answerA?.answer_text}</Box>
                </Box>
                <Box display={"flex"}>
                    <Box sx={{
                        fontWeight: 'bold',
                        fontSize: '1.1rem',
                        letterSpacing: 1,
                        mr: 1,
                    }}>B. </Box>
                    <Box>{answerB?.answer_text}</Box>
                </Box>
                <Box display={"flex"}>
                    <Box sx={{
                        fontWeight: 'bold',
                        fontSize: '1.1rem',
                        letterSpacing: 1,
                        mr: 1,
                    }}>C. </Box>
                    <Box>{answerC?.answer_text}</Box>
                </Box>
                <Box display={"flex"}>
                    <Box sx={{
                        fontWeight: 'bold',
                        fontSize: '1.1rem',
                        letterSpacing: 1,
                        mr: 1,
                    }}>D. </Box>
                    <Box>{answerD?.answer_text}</Box>
                </Box>

                <hr />
                <Box
                    sx={{
                        fontWeight: 'bold',
                        textDecoration: 'underline',
                        fontSize: '1.2rem',
                        my: 1,
                        letterSpacing: 1,
                    }}
                >
                    Answer: {correctAnswer?.option}
                </Box>

                <Box display={"flex"}>
                    <Box sx={{
                        fontWeight: 'bold',
                        fontSize: '1.1rem',
                        letterSpacing: 1,
                        mr: 1,
                    }}>A.</Box>
                    <Box>{answerA?.is_correct ? "Correct" : "Incorrect"} - {"justification"} </Box>
                </Box>
                <Box display={"flex"}>
                    <Box sx={{
                        fontWeight: 'bold',
                        fontSize: '1.1rem',
                        letterSpacing: 1,
                        mr: 1,
                    }}>B.</Box>
                    <Box>{answerB?.is_correct ? "Correct" : "Incorrect"} - {"justification"} </Box>
                </Box>
                <Box display={"flex"}>
                    <Box sx={{
                        fontWeight: 'bold',
                        fontSize: '1.1rem',
                        letterSpacing: 1,
                        mr: 1,
                    }}>C.</Box>
                    <Box>{answerC?.is_correct ? "Correct" : "Incorrect"} - {"justification"} </Box>
                </Box>
                <Box display={"flex"}>
                    <Box sx={{
                        fontWeight: 'bold',
                        fontSize: '1.1rem',
                        letterSpacing: 1,
                        mr: 1,
                    }}>D.</Box>
                    <Box>{answerD?.is_correct ? "Correct" : "Incorrect"} - {"justification"} </Box>
                </Box>

                <hr />

                <Box display={'flex'}>

                    <Box width={'20%'}>
                        {/* Headers */}
                        <Box display="flex" fontWeight="bold" mb={1}>
                            <Box flex={1}>Sys#s</Box>
                            <Box flex={1}>System</Box>
                        </Box>

                        {/* Content rows */}
                        {question.systems?.map((system, index) => (
                            <Box
                                key={system.number}
                                display="flex"
                                mb={0.5}
                                sx={{
                                    backgroundColor: index % 2 === 0 ? 'action.hover' : 'transparent',
                                    borderRadius: 1,
                                    px: 1,
                                    py: 0.5
                                }}
                            >
                                <Box flex={1}>{system.number}</Box>
                                <Box flex={1}>{system.name}</Box>
                            </Box>
                        ))}
                    </Box>

                    <Box width={'50%'}>
                        <Box fontWeight='bold' mb={1}>Category</Box>
                        <Box>{question.category}</Box>
                    </Box>
                    <Box>
                        <Box fontWeight='bold' mb={1}>KA Statement</Box>
                        <Box>KA Statement filler. KA Statement filler. KA Statement filler. KA Statement filler. KA Statement filler. KA Statement filler. KA Statement filler</Box>
                    </Box>
                </Box>

                <Box display={'flex'}>
                    <Box display={'flex'} flex={1}>
                        <Box flex={1}>
                            {/* Headers */}
                            <Box display="flex" fontWeight="bold">
                                <Box flex={1}>K/A#s</Box>
                                <Box flex={1}>
                                    {question.kas?.map((ka, index) => (
                                        <Box
                                            key={ka.ka_number}
                                            display="flex"
                                            mb={0.5}
                                            sx={{
                                                backgroundColor: index % 2 === 0 ? 'action.hover' : 'transparent',
                                                borderRadius: 1,
                                                px: 1,
                                                py: 0.5
                                            }}
                                        >
                                            <Box flex={1}>{ka.ka_number}</Box>
                                        </Box>
                                    ))}
                                </Box>
                            </Box>
                        </Box>

                        <Box display={'flex'} flex={1}>
                            <Box fontWeight="bold">K/A Importance</Box>
                            <Box>{3.8}</Box>
                        </Box>
                    </Box>

                    <Box display={'flex'} flex={1}>
                        <Box fontWeight="bold">Exam Level </Box>
                        <Box>{question.exam_level}</Box>
                    </Box>


                </Box>

                <Box display={'flex'}>
                    <Box display={'flex'} flex={1}>
                        <Box fontWeight="bold">References Provided to Candiate</Box>
                        <Box>none</Box>
                    </Box>
                    <Box display={'flex'} flex={1}>
                        <Box fontWeight="bold">Technical References</Box>
                        <Box>{question.technical_references}</Box>
                    </Box>
                </Box>

                <Box display={'flex'}>
                    <Box display={'flex'} flex={1}>
                        <Box fontWeight="bold">Question Source:</Box>
                        <Box>Bank DB 2015 NRC Exam Q2</Box>
                    </Box>

                    <Box display='flex' flex={1}>
                        <Box fontWeight="bold">Level of Difficutly: (1-5)</Box>
                        <Box>{question.difficulty_level}</Box>
                    </Box>
                </Box>

                <Box display={'flex'}>
                    <Box display={'flex'} flex={1}>
                        <Box fontWeight="bold" >Cognitive Level</Box>
                        <Box>{question.cognitive_level}</Box>
                    </Box>

                    <Box display={'flex'} flex={1}>
                        <Box fontWeight="bold">10 CFR Part 55 Content:</Box>
                        <Box>41.8 / 41.10 / 45.3</Box>
                    </Box>
                </Box>

                <Box display={'flex'}>
                    <Box fontWeight="bold">Objective</Box>
                    <Box>{question.objective}</Box>
                </Box>



            </Box>
        </>
    )
}