import React, { useContext, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';

function CreateQuiz() {
  const { backendUrl } = useContext(AppContext);
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [allowedUsers, setAllowedUsers] = useState('');
  const [quizId, setQuizId] = useState(null);
  const [questionText, setQuestionText] = useState('');
  const [addedQuestions, setAddedQuestions] = useState([]);
  const [options, setOptions] = useState([{ text: '', isCorrect: false }]);
  const [currentQuestionId, setCurrentQuestionId] = useState(null);
  const questionFormRef = useRef();

  useEffect(() => {
    if (step === 3) scrollToQuestionForm();
  }, [step]);

  const scrollToQuestionForm = () => {
    questionFormRef?.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const createQuiz = async () => {
    if (!title.trim()) {
      toast.error('Please enter a quiz title.');
      return;
    }

    try {
      // Convert comma-separated strings to arrays
      const tagsArray = tags ? tags.split(',').map(tag => tag.trim()) : [];
      const allowedUsersArray = allowedUsers ? allowedUsers.split(',').map(user => user.trim()) : [];

      const res = await axios.post(`${backendUrl}/api/quiz/post-quiz`, {
        title,
        description,
        tags: tagsArray,
        isPrivate,
        allowedUsers: allowedUsersArray,
      }, { withCredentials: true });

      if (res.data.success) {
        toast.success(res.data.message || 'Quiz created!');
        setQuizId(res.data.data._id); // Backend returns quiz in 'data' field
        setStep(2);
      } else {
        toast.error(res.data.message || 'Failed to create quiz.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create quiz.');
    }
  };

  const submitQuestion = async () => {
    if (!questionText.trim()) {
      toast.error('Please enter a question.');
      return;
    }

    try {
      const res = await axios.post(`${backendUrl}/api/quiz/post-question`, {
        quizId,
        question: questionText,
      }, { withCredentials: true });

      if (res.data.success) {
        toast.success(res.data.message || 'Question added!');
        
        // Use the real question object returned from backend
        if (res.data.question) {
          const newQuestion = res.data.question;
          setAddedQuestions(prev => [...prev, newQuestion]);
          setCurrentQuestionId(newQuestion._id);
        } else {
          // Fallback if backend doesn't return question
          const newQuestion = {
            _id: Date.now().toString(),
            question: questionText,
            quizId
          };
          setAddedQuestions(prev => [...prev, newQuestion]);
          setCurrentQuestionId(newQuestion._id);
        }
        
        setQuestionText('');
        setStep(3);
        scrollToQuestionForm();
      } else {
        toast.error(res.data.message || 'Failed to add question.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add question.');
    }
  };

  const updateOptionText = (index, newText) => {
    const newOptions = [...options];
    newOptions[index].text = newText;
    setOptions(newOptions);
  };

  const setCorrectOption = (index) => {
    const newOptions = options.map((opt, i) => ({
      ...opt,
      isCorrect: i === index,
    }));
    setOptions(newOptions);
  };

  const addOptionField = () => {
    setOptions([...options, { text: '', isCorrect: false }]);
  };

  const removeOptionField = (index) => {
    if (options.length > 1) {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
    }
  };

  const submitOptions = async () => {
    // Validate options
    const filledOptions = options.filter(opt => opt.text.trim() !== '');
    if (filledOptions.length < 2) {
      toast.error('Please add at least 2 options.');
      return;
    }

    const hasCorrectAnswer = filledOptions.some(opt => opt.isCorrect);
    if (!hasCorrectAnswer) {
      toast.error('Please select the correct answer.');
      return;
    }

    try {
      const currentQuestion = addedQuestions[addedQuestions.length - 1];
      if (!currentQuestion) {
        toast.error('No question available to add options to.');
        return;
      }

      const promises = filledOptions.map(opt =>
        axios.post(`${backendUrl}/api/quiz/post-option`, {
          questionId: currentQuestion._id,
          option: opt.text,
          isCorrect: opt.isCorrect,
        }, { withCredentials: true })
      );

      const results = await Promise.all(promises);
      console.log('Results:', results.map(r => r.data)); // Debug log
      
      // Check if all requests were successful
      const allSuccessful = results.every(res => res.data.success);
      
      if (allSuccessful) {
        toast.success('Options saved successfully!');
        setOptions([{ text: '', isCorrect: false }]); // Reset options
        setStep(2); // Go back to question step
      } else {
        // Show specific error messages
        const failedResults = results.filter(res => !res.data.success);
        const errorMessages = failedResults.map(res => res.data.message).join(', ');
        toast.error(`Failed to save some options: ${errorMessages}`);
      }
    } catch (err) {
      console.error('Error saving options:', err); // Debug log
      toast.error(err.response?.data?.message || 'Failed to save options.');
    }
  };

  const addAnotherQuestion = () => {
    setQuestionText('');
    setOptions([{ text: '', isCorrect: false }]);
    setStep(2);
  };

  const finishQuiz = () => {
    toast.success('Quiz created successfully!');
    // Reset all states
    setStep(1);
    setTitle('');
    setDescription('');
    setTags('');
    setIsPrivate(false);
    setAllowedUsers('');
    setQuizId(null);
    setQuestionText('');
    setAddedQuestions([]);
    setOptions([{ text: '', isCorrect: false }]);
    setCurrentQuestionId(null);
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Create Quiz</h1>

      {step === 1 && (
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Quiz Title *"
            className="w-full p-2 border rounded"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            placeholder="Quiz Description"
            className="w-full p-2 border rounded"
            rows="3"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <input
            type="text"
            placeholder="Tags (comma separated)"
            className="w-full p-2 border rounded"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="private"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
            />
            <label htmlFor="private">Make this quiz private</label>
          </div>
          {isPrivate && (
            <input
              type="text"
              placeholder="Allowed Users (comma separated emails)"
              className="w-full p-2 border rounded"
              value={allowedUsers}
              onChange={(e) => setAllowedUsers(e.target.value)}
            />
          )}
          <button
            onClick={createQuiz}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Create Quiz
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4 mt-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Add Question</h2>
            <span className="text-sm text-gray-600">
              Questions added: {addedQuestions.length}
            </span>
          </div>
          <textarea
            placeholder="Enter your question"
            className="w-full p-2 border rounded"
            rows="2"
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
          />
          <div className="flex gap-2">
            <button
              onClick={submitQuestion}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Save Question
            </button>
            {addedQuestions.length > 0 && (
              <button
                onClick={finishQuiz}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Finish Quiz
              </button>
            )}
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="mt-6" ref={questionFormRef}>
          <h3 className="text-xl font-semibold mb-4">
            Add Options for: "{addedQuestions[addedQuestions.length - 1]?.question}"
          </h3>

          {options.map((opt, idx) => (
            <div key={idx} className="flex items-center gap-2 mb-3">
              <input
                type="radio"
                name="correct"
                checked={opt.isCorrect}
                onChange={() => setCorrectOption(idx)}
              />
              <input
                type="text"
                placeholder={`Option ${idx + 1}`}
                value={opt.text}
                onChange={(e) => updateOptionText(idx, e.target.value)}
                className="flex-1 p-2 border rounded"
              />
              {options.length > 1 && (
                <button
                  onClick={() => removeOptionField(idx)}
                  className="text-red-600 hover:text-red-800 px-2"
                >
                  ✕
                </button>
              )}
            </div>
          ))}

          <button
            onClick={addOptionField}
            className="text-blue-600 underline text-sm mb-4"
          >
            ➕ Add another option
          </button>

          <br />

          <div className="flex gap-2">
            <button
              onClick={submitOptions}
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
            >
              Save Options
            </button>
            <button
              onClick={addAnotherQuestion}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              Skip Options (Add Later)
            </button>
          </div>
        </div>
      )}

      {/* Show added questions */}
      {addedQuestions.length > 0 && (
        <div className="mt-8 p-4 bg-gray-50 rounded">
          <h3 className="text-lg font-semibold mb-2">Added Questions:</h3>
          <ul className="space-y-1">
            {addedQuestions.map((q, idx) => (
              <li key={idx} className="text-sm text-gray-700">
                {idx + 1}. {q.question}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default CreateQuiz;