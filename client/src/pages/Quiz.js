import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';
import LikeQuiz from '../components/LikeQuiz';

function Quiz() {
  const { backendUrl, userId } = useContext(AppContext);
  const { quizId } = useParams();
  const [searchParams] = useSearchParams();
  const attemptId = searchParams.get("attemptId");
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [isMine, setIsMine] = useState(false);
  const [isAttempted, setIsAttempted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({});
  const [attemptAnswers, setAttemptAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const fetchQuiz = async () => {
  try {
    setLoading(true);
    const response = await axios.get(`${backendUrl}/api/quiz/get-quiz?quizId=${quizId}`, {
      withCredentials: true
    });
    const res = await axios.get(`${backendUrl}/api/user/attempts`, {
      withCredentials: true
    });

    if (attemptId) {
      const resp = await axios.get(`${backendUrl}/api/user/get-attempt-details/${attemptId}`)
      if (resp.data.success) {
        
        setScore(resp.data.attempt.score)
        const details = resp.data.attempt;
        details.questions.forEach((q) => {
          
          setAttemptAnswers(prev => ({
            ...prev,
            [q._id]: {
              questionId: q._id,
              selectedOptionId: q.selectedOptionId,
              correctOptionId: q.correctOptionId,
              selectedOptionText: q.optionText
            }
          }));
        });
      }
    }

    if (!res.data.success) {
      toast.error(res.data.message);
    }

    if (response.data.success) {
      setIsMine(response.data.authorId === userId);
      const attempts = res.data.attempts || [];
      const attemptedQuizIds = new Set(attempts.map(a => String(a.quizId)));
      setIsAttempted(attemptedQuizIds.has(String(quizId)));
      setQuiz(response.data);
    } else {
      toast.error(response.data.message || 'Failed to load quiz');
    }
  } catch (error) {
    console.error('Failed to fetch quiz:', error);
    toast.error('Failed to load quiz');
  } finally {
    setLoading(false);
  }
};


  const handleAnswerChange = (questionId, optionId, optionText) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: {
        questionId,
        selectedOptionId: optionId,
        selectedOptionText: optionText
      }
    }));
  };

  useEffect(() => {
    if (quizId) fetchQuiz();
  }, [quizId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!quiz || !quiz.question) return;

    const unansweredQuestions = quiz.question.filter(q => !answers[q._id]);
    if (unansweredQuestions.length > 0) {
      toast.error(`Please answer all questions. ${unansweredQuestions.length} question(s) remaining.`);
      return;
    }

    try {
      setSubmitting(true);
      const responses = Object.values(answers);
      const response = await axios.post(`${backendUrl}/api/quiz/attempt`, {
        quizId,
        responses
      }, { withCredentials: true });

      if (response.data.success) {
        toast.success('Quiz submitted successfully!');
        setSubmitted(true);
      } else {
        toast.error(response.data.message || 'Failed to submit quiz');
      }
    } catch (error) {
      console.error('Failed to submit quiz:', error);
      toast.error(error.response?.data?.message || 'Failed to submit quiz');
    } finally {
      setSubmitting(false);
    }
  };

  const getAnsweredCount = () => {
    return Object.keys(answers).length;
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-4 text-center">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-300 rounded mb-4"></div>
          <div className="h-4 bg-gray-300 rounded mb-8"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="border p-4 rounded">
                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!quiz || !quiz.success) {
    return (
      <div className="max-w-2xl mx-auto p-4 text-center">
        <h2 className="text-xl font-semibold text-red-600 mb-4">Quiz Not Found</h2>
        <p className="text-gray-600 mb-4">Sorry, we couldn't load this quiz.</p>
        <button 
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Back to Quizzes
        </button>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto p-4 text-center">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="text-green-600 text-4xl mb-4">✓</div>
          <h2 className="text-xl font-semibold text-green-800 mb-2">Quiz Submitted Successfully!</h2>
          <p className="text-green-700 mb-4">
            You answered {getAnsweredCount()} out of {quiz.totalQuestions} questions.
          </p>
          <button 
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 mr-2"
          >
            Back to Quizzes
          </button>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Take Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='mb-10 md:mb-2'>
      
      {!isMine && !isAttempted && (
        <div className="max-w-2xl mx-auto p-4">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">{quiz.title}</h1>
            <p className="text-gray-600 mb-4">{quiz.description}</p>
            <div className="flex justify-between items-center bg-gray-50 p-3 rounded">
              <span className="text-sm text-gray-700">
                Total Questions: {quiz.totalQuestions}
              </span>
              <span className="text-sm text-gray-700">
                Answered: {getAnsweredCount()}/{quiz.totalQuestions}
              </span>
              <LikeQuiz quizId={quizId}/>
            </div>

          </div>
          <form onSubmit={handleSubmit} className='mb-10'>
            {quiz.question && quiz.question.map((q, index) => (
              <div key={q._id} className="mb-8 p-4 border rounded-lg bg-white shadow-sm">
                <h3 className="font-semibold mb-4 text-lg">
                  Q{index + 1}: {q.question}
                </h3>
                <div className="space-y-2">
                  {q.options && q.options.map((opt, idx) => (
                    <div key={opt._id} className="flex items-center">
                      <input
                        type="radio"
                        name={`question-${q._id}`}
                        value={opt._id}
                        id={`q${q._id}-opt${opt._id}`}
                        className="mr-3 h-4 w-4 text-blue-600"
                        checked={answers[q._id]?.selectedOptionId === opt._id}
                        onChange={() => handleAnswerChange(q._id, opt._id, opt.option)}
                      />
                      <label
                        htmlFor={`q${q._id}-opt${opt._id}`}
                        className="cursor-pointer flex-1 py-2 px-2 rounded hover:bg-gray-50"
                      >
                        {opt.option}
                      </label>
                    </div>
                  ))}
                </div>
                {answers[q._id] && (
                  <div className="mt-2 text-sm text-green-600">
                    ✓ Answered: {answers[q._id].selectedOptionText}
                  </div>
                )}
              </div>
            ))}
            <div className="sticky bottom-0 bg-white p-4 border-t shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-gray-600">
                  Progress: {getAnsweredCount()}/{quiz.totalQuestions} questions answered
                </span>
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(getAnsweredCount() / quiz.totalQuestions) * 100}%` }}
                  ></div>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting || getAnsweredCount() < quiz.totalQuestions}
                className={`w-full py-3 px-4 rounded font-semibold ${
                  submitting || getAnsweredCount() < quiz.totalQuestions
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                } text-white`}
              >
                {submitting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </span>
                ) : getAnsweredCount() < quiz.totalQuestions ? (
                  `Answer ${quiz.totalQuestions - getAnsweredCount()} more question${quiz.totalQuestions - getAnsweredCount() !== 1 ? 's' : ''}`
                ) : (
                  'Submit Quiz'
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {isMine && (
        <div className="max-w-2xl mx-auto p-4">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">{quiz.title}</h1>
            <p className="text-gray-600 mb-4">{quiz.description}</p>
            <LikeQuiz quizId={quizId}/>
            <div className="flex justify-between items-center bg-gray-50 p-3 rounded mb-4">
              <span className="text-sm text-gray-700">
                Total Questions: {quiz.totalQuestions}
              </span>
              
              <div className="space-x-2">
                <button className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600">
                  Edit Quiz
                </button>
                <button className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700">
                  Delete Quiz
                </button>
                <button className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700">
                  Add Question
                </button>
              </div>
            </div>
            {quiz.question && quiz.question.map((q, index) => (
              <div key={q._id} className="mb-6 p-4 border rounded-lg shadow">
                <div className="flex justify-between mb-2">
                  <h3 className="font-semibold text-lg">
                    Q{index + 1}: {q.question}
                  </h3>
                  <div className="space-x-2">
                    <button className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">
                      Edit
                    </button>
                    <button className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600">
                      Delete
                    </button>
                  </div>
                </div>
                <ul className="list-disc pl-5 space-y-1">
                  {q.options.map((opt, idx) => (
                    <li key={opt._id}>{opt.option}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {isAttempted && (
        <div className="max-w-2xl mx-auto p-4">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2 text-blue-800">{quiz.title} (Your Results)</h1>
            <p className="text-gray-600 mb-4">{quiz.description}</p>
            <div className='flex justify-between'>
              <h2 className="text-xl font-semibold mb-6 text-center text-blue-700 bg-blue-50 p-3 rounded-lg ">
                Review Your Answers 📋
              </h2>
              <h3>
                Score: {score}/100
              </h3>
              <LikeQuiz quizId={quizId}/>
            </div>
            
            {quiz.question && quiz.question.length > 0 ? (
              quiz.question.map((q, index) => (
                <div key={q._id} className="mb-6 p-5 border border-blue-200 rounded-lg bg-white shadow-md">
                  <h3 className="font-semibold mb-3 text-xl text-gray-800">
                    Q{index + 1}: {q.question}
                  </h3>
                  <ul className="space-y-2">
                    {q.options.map(opt => {
                      const isSelected = attemptAnswers[q._id]?.selectedOptionId === opt._id;
                      const isCorrect = attemptAnswers[q._id]?.correctOptionId === opt._id;


                      let optionClassName = "p-3 rounded-md border text-gray-800 flex items-center";
                      let statusText = '';
                      let statusEmoji = '';

                      if (isSelected && isCorrect) {
                        optionClassName += " bg-green-100 border-green-400 font-medium";
                        statusText = ' ';
                        statusEmoji = '✅';
                      } else if (isSelected && !isCorrect) {
                        optionClassName += " bg-red-100 border-red-400 font-medium";
                        statusText = ' ';
                        statusEmoji = '❌';
                      } else if (isCorrect) {
                        optionClassName += " bg-blue-50 border-blue-300 font-medium";
                        statusText = '(Correct Answer)';
                        statusEmoji = '🎯';
                      } else {
                        optionClassName += " border-gray-200 hover:bg-gray-50";
                      }

                      return (
                        <li key={opt._id} className={optionClassName}>
                          <span className="flex-grow">{opt.option}</span>
                          {statusText && <span className={`ml-2 font-semibold ${isSelected && isCorrect ? 'text-green-700' : isSelected && !isCorrect ? 'text-red-700' : isCorrect ? 'text-blue-700' : ''}`}>
                            {statusText} {statusEmoji}
                          </span>}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 text-lg mt-8">No questions found for this quiz.</p>
            )}
            <div className="mt-8 text-center">
              <button
                onClick={() => navigate('/')}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-lg font-semibold transition"
              >
                Back to Quizzes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Quiz;
