import { useState, useEffect } from 'react';
import { defaultQuestion } from '../../../data/db/schema';
import { Box, Button, Typography, Alert, Dialog, DialogContent, DialogActions, DialogTitle } from '@mui/material';
import { QuestionFormContent } from './QuestionForm';
import { useDatabase } from '../../../common/hooks/useDatabase';

interface ImportViewerProps {
  onImport: () => void;
}

interface ExtendedQuestion extends Question {
  questionNumber: number;
}

export default function ImportViewer({ onImport }: ImportViewerProps) {
  const [open, setOpen] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [reviewedQuestions, setReviewedQuestions] = useState<ExtendedQuestion[]>([]);
  const [currentQuestionNumber, setCurrentQuestionNumber] = useState<number | null>(null);
  const [importErrors, setImportErrors] = useState<{ questionNumber: number; msgs: string[] }[]>([]);

  const currentQuestion = reviewedQuestions.find((q) => q.questionNumber === currentQuestionNumber) || defaultQuestion;
  const [selectedSystemKas, setSelectedSystemKas] = useState<string[]>([]);
  const { getExamByName, addQuestion, addQuestionsBatch } = useDatabase();


  const [answers, setAnswers] = useState<[Answer, Answer, Answer, Answer]>([
    { answer_text: '', justification: '', isCorrect: 0 },
    { answer_text: '', justification: '', isCorrect: 0 },
    { answer_text: '', justification: '', isCorrect: 0 },
    { answer_text: '', justification: '', isCorrect: 0 },
  ]);

  useEffect(() => {
    setAnswers([
      {
        answer_text: currentQuestion?.answer_a,
        justification: currentQuestion.answer_a_justification,
        isCorrect: currentQuestion.correct_answer === "A" ? 1 : 0,
      },
      {
        answer_text: currentQuestion?.answer_b,
        justification: currentQuestion.answer_b_justification,
        isCorrect: currentQuestion.correct_answer === "B" ? 1 : 0,
      },
      {
        answer_text: currentQuestion?.answer_c,
        justification: currentQuestion.answer_c_justification,
        isCorrect: currentQuestion.correct_answer === "C" ? 1 : 0,
      },
      {
        answer_text: currentQuestion?.answer_d,
        justification: currentQuestion.answer_d_justification,
        isCorrect: currentQuestion.correct_answer === "D" ? 1 : 0,
      },
    ]);
  }, [currentQuestion]);

  const handleChange = (key: string, value: unknown) => {
    setReviewedQuestions((prev) => {
      const updated = [...prev];
      const index = updated.findIndex((q) => q.questionNumber === currentQuestionNumber);
      if (index !== -1) {
        updated[index] = { ...updated[index], [key]: value };
      }
      return updated;
    });
  };

  const handleQuestionExamChange = (key: string, value: unknown, idx?: number) => {
    setReviewedQuestions((prev) => {
      const updated = [...prev];
      const index = updated.findIndex((q) => q.questionNumber === currentQuestionNumber);
      if (index === -1) return prev;

      if (key === "question_exams" && Array.isArray(value)) {
        updated[index] = {
          ...updated[index],
          question_exams: value as ExamQuestion[]
        };
      } else if (typeof idx === 'number') {
        updated[index] = {
          ...updated[index],
          question_exams: updated[index].question_exams?.map((qe, i) =>
            i === idx ? { ...qe, [key]: value } : qe
          ) || []
        };
      }
      return updated;
    });
  };

  const goToNext = () => {
    const currentIdx = reviewedQuestions.findIndex((q) => q.questionNumber === currentQuestionNumber);
    if (currentIdx < reviewedQuestions.length - 1) {
      setCurrentQuestionNumber(reviewedQuestions[currentIdx + 1].questionNumber);
    }
  };

  const goToPrevious = () => {
    const currentIdx = reviewedQuestions.findIndex((q) => q.questionNumber === currentQuestionNumber);
    if (currentIdx > 0) {
      setCurrentQuestionNumber(reviewedQuestions[currentIdx - 1].questionNumber);
    }
  };

  const handleRemoveQuestion = (questionNumber: number) => {
    setReviewedQuestions((prev) => {
      const updated = prev.filter((q) => q.questionNumber !== questionNumber);
      if (questionNumber === currentQuestionNumber) {
        const currentIdx = prev.findIndex((q) => q.questionNumber === questionNumber);
        if (updated.length === 0) {
          setCurrentQuestionNumber(null);
        } else if (currentIdx < updated.length) {
          setCurrentQuestionNumber(updated[currentIdx].questionNumber);
        } else {
          setCurrentQuestionNumber(updated[currentIdx - 1].questionNumber);
        }
      }
      return updated;
    });
  };

  const handleImportCurrentQuestion = async () => {
    if (!currentQuestionNumber) return;

    try {
      await addQuestion(currentQuestion);
      handleRemoveQuestion(currentQuestionNumber);
      onImport();
    } catch (error) {
      console.error('Error importing current question:', error);
      // You might want to show an error message to the user here
    }
  };

  const handleImport = async () => {
    try {
      const result = await window.files.import.questions();

      let questions: QuestionForDataTransfer[] = [];
      if (result.questions) {
        questions = result.questions;
      }


      questions.forEach(async (question) => {
        if (Array.isArray(question.question_exams)) {
          const exams = await Promise.all(
            question.question_exams.map(qe =>
              getExamByName(qe.exam_name)
            )
          );
          question.exam_ids = exams.map(exam => exam?.exam_id).filter((id): id is number => id !== undefined);
        }
      });





      if (result.questions && result.questions.length > 0) {
        setQuestions(result.questions);
        setOpen(true);
      } else {
        console.error('Import failed or no questions returned:', result);
      }
      if (result.stats?.warnings && result.stats.warnings.length > 0) {
        setImportErrors(result.stats.warnings);
      } else {
        setImportErrors([]);
      }
    } catch (error) {
      console.error('Error during import:', error);
      setImportErrors([{ questionNumber: 0, msgs: [`Import failed: ${error.message || 'Unknown error'}`] }]);
    }
  };

  useEffect(() => {
    if (questions.length > 0) {
      const questionsWithNumbers = questions.map((question, index) => ({
        ...question,
        questionNumber: index + 1,
      }));
      setReviewedQuestions(questionsWithNumbers);
      setCurrentQuestionNumber(questionsWithNumbers[0]?.questionNumber || null);
    }
  }, [questions]);

  useEffect(() => {
    const systemKaNums = currentQuestion.system_kas?.map(system_ka => system_ka.system_ka_number).filter((num): num is string => num !== undefined) || [];
    setSelectedSystemKas(systemKaNums);
  }, [currentQuestion.system_kas]);

  const handleClose = () => {
    setQuestions([]);
    setReviewedQuestions([]);
    setCurrentQuestionNumber(null);
    setImportErrors([]);
    setOpen(false);
  };

  const handleConfirmImports = async () => {
    // console.log('Submitting reviewed questions:', reviewedQuestions);
    const result = await addQuestionsBatch(reviewedQuestions)
    // console.log(result)
    onImport();
    setOpen(false);
  };

  function errorDisplay() {
    const relevantErrors =
      importErrors.find((error) => error.questionNumber === currentQuestionNumber)?.msgs || [];

    return (
      <>
        {relevantErrors.length > 0 && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Import Warnings for Question {currentQuestionNumber}:
            </Typography>
            <Box component="ul" sx={{ pl: 2, m: 0 }}>
              {relevantErrors.map((msg, index) => (
                <Typography component="li" key={index} variant="body2">
                  {msg}
                </Typography>
              ))}
            </Box>
          </Alert>
        )}
      </>
    );
  }

  return (
    <>
      <Dialog disableRestoreFocus open={open} title="Import Questions" onClose={handleClose} fullWidth maxWidth="lg">
        <DialogTitle>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              {reviewedQuestions.length} Remaining : Question {currentQuestionNumber} of {Math.max(0, ...reviewedQuestions.map(q => q.questionNumber))}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                color="error"
                onClick={() => {
                  if (currentQuestionNumber !== null) handleRemoveQuestion(currentQuestionNumber);
                }}
                disabled={currentQuestionNumber === null}
              >
                Remove Question
              </Button>
            </Box>
          </Box>
          {errorDisplay()}
        </DialogTitle>
        <DialogContent>
          {reviewedQuestions.length > 0 ? (
            <QuestionFormContent
              questionForm={currentQuestion}
              selectedSystemKas={selectedSystemKas}
              handleChange={handleChange}
              handleQuestionExamChange={handleQuestionExamChange}
              answers={answers}
            />
          ) : (
            <Typography>No questions to display. Try importing again.</Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ display: 'flex', gap: 1, justifyContent: 'space-between', p:2 }}>

          {/* <Button disabled={reviewedQuestions.length <= 0} onClick={handleConfirmImports}>Import All</Button> */}

          <Button onClick={handleClose}>Cancel</Button>

          <Button
            variant="contained"
            color="success"
            onClick={handleImportCurrentQuestion}
            disabled={currentQuestionNumber === null}
          >
            Import Current Question
          </Button>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              onClick={goToPrevious}
              disabled={
                !currentQuestionNumber ||
                reviewedQuestions.findIndex((q) => q.questionNumber === currentQuestionNumber) === 0
              }
            >
              Previous
            </Button>
            <Button
              variant="outlined"
              onClick={goToNext}
              disabled={
                !currentQuestionNumber ||
                reviewedQuestions.findIndex((q) => q.questionNumber === currentQuestionNumber) ===
                reviewedQuestions.length - 1
              }
            >
              Next
            </Button>
          </Box>

        </DialogActions>
      </Dialog>
      <Button onClick={handleImport}>Import Questions</Button>
      {reviewedQuestions.length === 0 && errorDisplay()}
    </>
  );
}