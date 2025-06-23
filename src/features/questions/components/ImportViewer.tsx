// import { useState, useEffect } from 'react';
// import { defaultQuestion, questionSchema, defaultAnswer } from '../../../data/db/schema';
// import { Box, TextField, SxProps, Button, Typography, Alert, Dialog, DialogContent, DialogActions, DialogTitle } from '@mui/material';
// import { useDatabase } from '../../../common/hooks/useDatabase';
// import AnswerForm from './AnswerForm';
// import CheckExams from '../../exams/components/CheckExams';
// import CheckSystems from '../../systems/components/CheckSystems';
// import CheckKas from '../../kas/components/CheckKas';

// interface ImportViewerProps {
//   onSubmit: (questions: Question[]) => void;
// }

// interface ExtendedQuestion extends Question {
//   questionNumber: number;
// }

// export default function ImportViewer({ onSubmit }: ImportViewerProps) {
//   const [open, setOpen] = useState(false);
//   const [questions, setQuestions] = useState<Question[]>([]);
//   const [reviewedQuestions, setReviewedQuestions] = useState<ExtendedQuestion[]>([]);
//   const [currentQuestionNumber, setCurrentQuestionNumber] = useState<number | null>(null);
//   const { exams, systems, kas } = useDatabase();
//   const [importErrors, setImportErrors] = useState<{ questionNumber: number; msgs: string[] }[]>([]);

//   const currentQuestion = reviewedQuestions.find((q) => q.questionNumber === currentQuestionNumber) || defaultQuestion;

//   const selectedExams = currentQuestion.exams?.map((exam) => exam.exam_id).filter((id): id is number => id !== undefined) || [];
//   const selectedSystems = currentQuestion.systems?.map((system) => system.number).filter((num): num is string => num !== undefined) || [];
//   const selectedKas = currentQuestion.kas?.map((ka) => ka.ka_number).filter((num): num is string => num !== undefined) || [];

//   const handleChange = (key: string, value: any) => {
//     setReviewedQuestions((prev) => {
//       const updated = [...prev];
//       const index = updated.findIndex((q) => q.questionNumber === currentQuestionNumber);
//       if (index !== -1) {
//         updated[index] = { ...updated[index], [key]: value };
//       }
//       return updated;
//     });
//   };

//   const handleAnswerChange = (newAnswer: Answer, index: number) => {
//     setReviewedQuestions((prev) => {
//       const updated = [...prev];
//       const qIndex = updated.findIndex((q) => q.questionNumber === currentQuestionNumber);
//       if (qIndex === -1) return prev;

//       const currentQ = updated[qIndex];
//       let answers: [Answer, Answer, Answer, Answer];
//       if (currentQ.answers && currentQ.answers.length === 4) {
//         answers = [...currentQ.answers] as [Answer, Answer, Answer, Answer];
//       } else {
//         answers = [defaultAnswer, defaultAnswer, defaultAnswer, defaultAnswer];
//       }

//       if (newAnswer.is_correct) {
//         answers = answers.map((ans, i) =>
//           i === index ? { ...newAnswer } : { ...ans, is_correct: false }
//         ) as [Answer, Answer, Answer, Answer];
//       } else {
//         answers[index] = { ...newAnswer };
//       }

//       updated[qIndex] = { ...currentQ, answers };
//       return updated;
//     });
//   };

//   const createSimpleCheckHandler = function <T>(collection: T[], keyField: keyof T, formField: keyof Question) {
//     return (event: React.ChangeEvent<HTMLInputElement>) => {
//       const itemKey = event.currentTarget.name;
//       const isChecked = event.currentTarget.checked;

//       setReviewedQuestions((prev) => {
//         const updated = [...prev];
//         const index = updated.findIndex((q) => q.questionNumber === currentQuestionNumber);
//         if (index === -1) return prev;

//         const currentQ = updated[index];
//         const currentItems = (currentQ[formField] as unknown as T[]) || [];
//         let updatedItems;

//         if (isChecked) {
//           const itemToAdd = collection.find((item) => String((item as T)[keyField]) === itemKey);
//           if (itemToAdd && !currentItems.find((item) => String(item[keyField]) === itemKey)) {
//             updatedItems = [...currentItems, itemToAdd];
//           } else {
//             updatedItems = currentItems;
//           }
//         } else {
//           updatedItems = currentItems.filter((item) => String(item[keyField]) !== itemKey);
//         }

//         updated[index] = {
//           ...currentQ,
//           [formField]: updatedItems,
//         };
//         return updated;
//       });
//     };
//   };

//   const handleExamCheckChange = createSimpleCheckHandler(exams, 'exam_id', 'exams');
//   const handleSystemCheckChange = createSimpleCheckHandler(systems, 'number', 'systems');
//   const handleKaCheckChange = createSimpleCheckHandler(kas, 'ka_number', 'kas');

//   const goToNext = () => {
//     const currentIdx = reviewedQuestions.findIndex((q) => q.questionNumber === currentQuestionNumber);
//     if (currentIdx < reviewedQuestions.length - 1) {
//       setCurrentQuestionNumber(reviewedQuestions[currentIdx + 1].questionNumber);
//     }
//   };

//   const goToPrevious = () => {
//     const currentIdx = reviewedQuestions.findIndex((q) => q.questionNumber === currentQuestionNumber);
//     if (currentIdx > 0) {
//       setCurrentQuestionNumber(reviewedQuestions[currentIdx - 1].questionNumber);
//     }
//   };

//   const handleRemoveQuestion = (questionNumber: number) => {
//     setReviewedQuestions((prev) => {
//       const updated = prev.filter((q) => q.questionNumber !== questionNumber);
//       if (questionNumber === currentQuestionNumber) {
//         const currentIdx = prev.findIndex((q) => q.questionNumber === questionNumber);
//         if (updated.length === 0) {
//           setCurrentQuestionNumber(null);
//         } else if (currentIdx < updated.length) {
//           setCurrentQuestionNumber(updated[currentIdx].questionNumber);
//         } else {
//           setCurrentQuestionNumber(updated[currentIdx - 1].questionNumber);
//         }
//       }
//       return updated;
//     });
//   };

//   const containerSx: SxProps = {
//     pt: 2,
//     display: 'grid',
//     gridTemplateColumns: {
//       xs: '1fr',
//       sm: '1fr',
//       md: '1fr 1fr',
//     },
//     gap: 2,
//     '@media (max-width: 900px)': {
//       gridTemplateColumns: '1fr',
//     },
//   };

//   const handleImport = async () => {
//     try {
//       const result = await window.files.import.questions();
//       if (result.questions && result.questions.length > 0) {
//         setQuestions(result.questions);
//         setOpen(true);
//       } else {
//         console.error('Import failed or no questions returned:', result);
//       }
//       if (result.stats?.warnings && result.stats.warnings.length > 0) {
//         setImportErrors(result.stats.warnings);
//       } else {
//         setImportErrors([]);
//       }
//     } catch (error) {
//       console.error('Error during import:', error);
//       setImportErrors([{ questionNumber: 0, msgs: [`Import failed: ${error.message || 'Unknown error'}`] }]);
//     }
//   };

//   useEffect(() => {
//     if (questions.length > 0) {
//       const questionsWithNumbers = questions.map((question, index) => ({
//         ...question,
//         questionNumber: index + 1,
//       }));
//       setReviewedQuestions(questionsWithNumbers);
//       setCurrentQuestionNumber(questionsWithNumbers[0]?.questionNumber || null);
//     }
//   }, [questions]);

//   const handleClose = () => {
//     setQuestions([]);
//     setReviewedQuestions([]);
//     setCurrentQuestionNumber(null);
//     setImportErrors([]);
//     setOpen(false);
//   };

//   const handleComfirmImports = () => {
//     console.log('Submitting reviewed questions:', reviewedQuestions);
//     onSubmit(reviewedQuestions);
//     setOpen(false);
//   };

//   function errorDisplay() {
//     const relevantErrors =
//       importErrors.find((error) => error.questionNumber === currentQuestionNumber)?.msgs || [];

//     return (
//       <>
//         {relevantErrors.length > 0 && (
//           <Alert severity="warning" sx={{ mb: 2 }}>
//             <Typography variant="h6" gutterBottom>
//               Import Warnings for Question {currentQuestionNumber}:
//             </Typography>
//             <Box component="ul" sx={{ pl: 2, m: 0 }}>
//               {relevantErrors.map((msg, index) => (
//                 <Typography component="li" key={index} variant="body2">
//                   {msg}
//                 </Typography>
//               ))}
//             </Box>
//           </Alert>
//         )}
//       </>
//     );
//   }

//   return (
//     <>
//       <Dialog disableRestoreFocus open={open} title="Import Questions" onClose={handleClose} fullWidth maxWidth="lg">
//         <DialogTitle>
//           <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//             <Typography variant="h6">
//               Question {currentQuestionNumber} of {reviewedQuestions.length}
//             </Typography>
//             <Box sx={{ display: 'flex', gap: 1 }}>
//               <Button
//                 variant="outlined"
//                 onClick={goToPrevious}
//                 disabled={
//                   !currentQuestionNumber ||
//                   reviewedQuestions.findIndex((q) => q.questionNumber === currentQuestionNumber) === 0
//                 }
//               >
//                 Previous
//               </Button>
//               <Button
//                 variant="outlined"
//                 onClick={goToNext}
//                 disabled={
//                   !currentQuestionNumber ||
//                   reviewedQuestions.findIndex((q) => q.questionNumber === currentQuestionNumber) ===
//                   reviewedQuestions.length - 1
//                 }
//               >
//                 Next
//               </Button>
//               <Button
//                 variant="contained"
//                 color="error"
//                 onClick={() => handleRemoveQuestion(currentQuestionNumber!)}
//                 disabled={!currentQuestionNumber}
//               >
//                 Remove Question
//               </Button>
//             </Box>
//           </Box>
//           {errorDisplay()}
//         </DialogTitle>

//         <DialogContent>
//           {reviewedQuestions.length > 0 ? (
//             <Box sx={containerSx}>
//               <Box>
//                 {questionSchema.map((field) => {
//                   if (field.key === 'last_used') return null;
//                   return (
//                     <Box sx={{ pb: 2 }} key={field.key}>
//                       <TextField
//                         fullWidth
//                         type={field.type}
//                         value={(currentQuestion as any)[field.key] || ''}
//                         onChange={(e) => handleChange(field.key, e.target.value)}
//                         label={field.label}
//                         required={field.required}
//                         rows={field.key === 'question_text' ? 5 : undefined}
//                         multiline={field.key === 'question_text'}
//                       />
//                     </Box>
//                   );
//                 })}
//                 <Box sx={{ pb: 2 }}>
//                   <TextField
//                     fullWidth
//                     type="date"
//                     value={currentQuestion.last_used || ''}
//                     onChange={(e) => handleChange('last_used', e.target.value)}
//                     label="Last Used"
//                     required={false}
//                     InputLabelProps={{ shrink: true }}
//                   />
//                 </Box>
//                 <Box sx={{ pb: 2 }}>
//                   <CheckExams
//                     examOptions={exams}
//                     handleChange={handleExamCheckChange}
//                     selectedIdList={selectedExams}
//                   />
//                 </Box>
//                 <Box sx={{ pb: 2 }}>
//                   <CheckSystems
//                     systemOptions={systems}
//                     handleChange={handleSystemCheckChange}
//                     selectedIdList={selectedSystems}
//                   />
//                 </Box>
//                 <Box sx={{ pb: 2 }}>
//                   <CheckKas
//                     kaOptions={kas}
//                     handleChange={handleKaCheckChange}
//                     selectedIdList={selectedKas}
//                   />
//                 </Box>
//               </Box>
//               <Box>
//                 {currentQuestion.answers?.map((answer, idx) => (
//                   <AnswerForm
//                     updateQuestionForm={(newAnswer) => handleAnswerChange(newAnswer, idx)}
//                     answer={answer}
//                     key={idx}
//                   />
//                 ))}
//               </Box>
//             </Box>
//           ) : (
//             <Typography>No questions to display. Try importing again.</Typography>
//           )}
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setOpen(false)}>Cancel</Button>
//           <Button disabled={reviewedQuestions.length <= 0} onClick={handleComfirmImports}>Import All</Button>
//         </DialogActions>
//       </Dialog>
//       <Button onClick={handleImport}>Import Questions</Button>
//       {reviewedQuestions.length === 0 && errorDisplay()}
//     </>
//   );
// }