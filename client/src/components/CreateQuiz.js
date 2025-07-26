import React, { useContext, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';

function CreateQuiz() {
  const { backendUrl, authToken } = useContext(AppContext); // Ensure authToken is available
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

  // State to manage expansion of the input fields
  const [isQuizFormExpanded, setIsQuizFormExpanded] = useState(false);
  const [isQuestionFormExpanded, setIsQuestionFormExpanded] = useState(false);

  const quizFormRef = useRef();
  const questionFormRef = useRef();

  // Scroll to expanded form when state changes
  useEffect(() => {
    if (isQuizFormExpanded && quizFormRef.current) {
      quizFormRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [isQuizFormExpanded]);

  useEffect(() => {
    if (isQuestionFormExpanded && questionFormRef.current) {
      questionFormRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [isQuestionFormExpanded]);

  // Handle outside clicks to collapse forms (optional, but good UX)
  // For simplicity, we'll keep them expanded once clicked in this version.
  // A more robust solution would involve a custom hook for click outside.

  const createQuiz = async () => {
    if (!title.trim()) {
      toast.error('Please enter a quiz title.');
      return;
    }

    try {
      const tagsArray = tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '') : [];
      const allowedUsersArray = allowedUsers ? allowedUsers.split(',').map(user => user.trim()).filter(user => user !== '') : [];

      const res = await axios.post(`${backendUrl}/api/quiz/post-quiz`, {
        title,
        description,
        tags: tagsArray,
        isPrivate,
        allowedUsers: allowedUsersArray,
      }, {
        headers: {
          'Authorization': `Bearer ${authToken}` // Pass token for authentication
        },
        withCredentials: true // Include cookies/credentials if needed
      });

      if (res.data.success) {
        toast.success(res.data.message || 'Quiz created!');
        setQuizId(res.data.data._id);
        setStep(2); // Move to question adding
        setIsQuizFormExpanded(false); // Collapse quiz form after creation
        setIsQuestionFormExpanded(true); // Auto-expand question form
      } else {
        toast.error(res.data.message || 'Failed to create quiz.');
      }
    } catch (err) {
      console.error('Error creating quiz:', err);
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
      }, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        withCredentials: true
      });

      if (res.data.success) {
        toast.success(res.data.message || 'Question added!');
        const newQuestion = res.data.question || { _id: Date.now().toString(), question: questionText, quizId };
        setAddedQuestions(prev => [...prev, newQuestion]);
        setCurrentQuestionId(newQuestion._id);

        setQuestionText(''); // Clear question text for next question
        setOptions([{ text: '', isCorrect: false }]); // Reset options for next question
        setStep(3); // Move to options adding
        setIsQuestionFormExpanded(false); // Collapse question form
        // Options form implicitly shown by step 3
      } else {
        toast.error(res.data.message || 'Failed to add question.');
      }
    } catch (err) {
      console.error('Error adding question:', err);
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
    if (options.length > 2) { // Require at least 2 options
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
    } else {
      toast.warn('You need at least two options.');
    }
  };

  const submitOptions = async () => {
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
      const currentQuestion = addedQuestions.find(q => q._id === currentQuestionId);
      if (!currentQuestion) {
        toast.error('No question selected to add options to.');
        return;
      }

      // First, delete existing options for the question if any
      // This is a common pattern if you're allowing re-editing options.
      // If your backend handles upsert or ignores duplicates, you might not need this.
      // For a fresh question, this step is effectively a no-op.
      // await axios.delete(`${backendUrl}/api/quiz/delete-options/${currentQuestion._id}`, { withCredentials: true }); // Example delete route

      const promises = filledOptions.map(opt =>
        axios.post(`${backendUrl}/api/quiz/post-option`, {
          questionId: currentQuestion._id,
          option: opt.text,
          isCorrect: opt.isCorrect,
        }, {
          headers: {
            'Authorization': `Bearer ${authToken}`
          },
          withCredentials: true
        })
      );

      const results = await Promise.all(promises);

      const allSuccessful = results.every(res => res.data.success);

      if (allSuccessful) {
        toast.success('Options saved successfully!');
        setOptions([{ text: '', isCorrect: false }]); // Reset options
        setStep(2); // Go back to question step
        setIsQuestionFormExpanded(true); // Re-expand question form for next question
      } else {
        const failedMessages = results.filter(res => !res.data.success)
          .map(res => res.data.message || 'Unknown error').join(', ');
        toast.error(`Failed to save some options: ${failedMessages}`);
      }
    } catch (err) {
      console.error('Error saving options:', err);
      toast.error(err.response?.data?.message || 'Failed to save options.');
    }
  };

  const addAnotherQuestion = () => {
    setQuestionText('');
    setOptions([{ text: '', isCorrect: false }]);
    setStep(2); // Go back to the "Add Question" step
    setIsQuestionFormExpanded(true); // Ensure question form is expanded
  };

  const finishQuiz = () => {
    if (addedQuestions.length === 0) {
      toast.error('Please add at least one question before finishing the quiz.');
      return;
    }
    toast.success('Quiz created successfully and ready!');
    // Reset all states for a fresh start
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
    setIsQuizFormExpanded(false);
    setIsQuestionFormExpanded(false);
  };

 return (
  <div className="p-4 max-w-2xl mx-auto font-sans text-gray-800 dark:text-gray-100">
    <h1 className="text-4xl font-extrabold mb-8 text-center text-gray-800 dark:text-gray-100">
      Unleash Your Inner Quiz Master! 🚀
    </h1>

    {/* Quiz Creation Form */}
    <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg p-6 mb-8 border border-gray-200 dark:border-gray-600">
      <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-200 mb-4">
        {quizId ? 'Quiz Details (Created)' : 'Create Your Quiz'}
      </h2>

      {quizId && (
        <p className="text-green-600 dark:text-green-400 mb-4 font-medium">
          Quiz ID: {quizId}
        </p>
      )}

      <div ref={quizFormRef}>
        <input
          type="text"
          placeholder="What's your quiz about?"
          className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400
            ${isQuizFormExpanded ? 'mb-4' : 'mb-0'}`}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onFocus={() => setIsQuizFormExpanded(true)}
          disabled={step > 1}
        />

        {isQuizFormExpanded && step === 1 && (
          <div className="space-y-4 pt-2">
            <textarea
              placeholder="Give a short description (optional)"
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <input
              type="text"
              placeholder="Tags (e.g., science, fun)"
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="private"
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
                className="h-5 w-5 text-blue-600 dark:bg-gray-600 dark:border-gray-500"
              />
              <label htmlFor="private" className="text-gray-700 dark:text-gray-300 select-none">
                Make this quiz private
              </label>
            </div>
            {isPrivate && (
              <input
                type="text"
                placeholder="Allowed User Emails (comma separated)"
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
                value={allowedUsers}
                onChange={(e) => setAllowedUsers(e.target.value)}
              />
            )}
            <div className="flex justify-end pt-4">
              <button
                onClick={createQuiz}
                className="bg-blue-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Create Quiz
              </button>
            </div>
          </div>
        )}
      </div>
    </div>

    <hr className="my-8 border-gray-300 dark:border-gray-600" />

    {/* Question Addition */}
    {step >= 2 && quizId && (
      <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg p-6 mb-8 border border-gray-200 dark:border-gray-600">
        <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-200 mb-4 flex justify-between">
          <span>Add Questions</span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Total Questions: {addedQuestions.length}
          </span>
        </h2>

        <textarea
          placeholder="Type your question here..."
          className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 text-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400
            ${isQuestionFormExpanded ? 'mb-4' : 'h-12 resize-none overflow-hidden pb-3'}`}
          rows={isQuestionFormExpanded ? "3" : "1"}
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          onFocus={() => setIsQuestionFormExpanded(true)}
          disabled={step === 3}
        />

        {isQuestionFormExpanded && step === 2 && (
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={submitQuestion}
              className="bg-green-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              Save Question
            </button>
            {addedQuestions.length > 0 && (
              <button
                onClick={finishQuiz}
                className="bg-gray-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Finish Quiz
              </button>
            )}
          </div>
        )}
      </div>
    )}

    {/* Step 3 - Add Options */}
    {step === 3 && currentQuestionId && (
      <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg p-6 mb-8 border border-gray-200 dark:border-gray-600">
        <h3 className="text-2xl font-bold text-gray-700 dark:text-gray-200 mb-4">
          Options for:
          <br />
          <span className="text-blue-600 dark:text-blue-400 text-lg font-normal italic">
            "{addedQuestions.find(q => q._id === currentQuestionId)?.question}"
          </span>
        </h3>

        {options.map((opt, idx) => (
          <div key={idx} className="flex items-center gap-3">
            <input
              type="radio"
              name="correct-option"
              checked={opt.isCorrect}
              onChange={() => setCorrectOption(idx)}
              className="h-5 w-5 text-purple-600 dark:bg-gray-700 dark:border-gray-500"
            />
            <input
              type="text"
              placeholder={`Option ${idx + 1}`}
              value={opt.text}
              onChange={(e) => updateOptionText(idx, e.target.value)}
              className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
            />
            {options.length > 2 && (
              <button
                onClick={() => removeOptionField(idx)}
                className="text-red-600 hover:text-red-800 text-xl font-bold p-1 rounded-full hover:bg-red-50 dark:hover:bg-red-900 transition-colors"
              >
                &times;
              </button>
            )}
          </div>
        ))}

        <button
          onClick={addOptionField}
          className="text-blue-600 dark:text-blue-400 underline text-md my-4 flex items-center gap-1 hover:text-blue-800 dark:hover:text-blue-300"
        >
          <span className="text-xl leading-none">+</span> Add another option
        </button>

        <div className="flex justify-end gap-3 pt-4">
          <button
            onClick={submitOptions}
            className="bg-purple-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            Save Options
          </button>
          <button
            onClick={addAnotherQuestion}
            className="bg-gray-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Add Next Question
          </button>
        </div>
      </div>
    )}

    {/* Added Question Summary */}
    {addedQuestions.length > 0 && (
      <div className="mt-8 p-6 bg-blue-50 dark:bg-gray-900 rounded-lg shadow-inner border border-blue-200 dark:border-blue-600">
        <h3 className="text-xl font-bold text-blue-800 dark:text-blue-300 mb-4">
          Your Quiz So Far:
        </h3>
        <ul className="space-y-2">
          {addedQuestions.map((q, idx) => (
            <li key={q._id} className="flex items-start">
              <span className="font-semibold text-blue-700 dark:text-blue-400 mr-2">{idx + 1}.</span>
              <span className="text-gray-800 dark:text-gray-200">{q.question}</span>
            </li>
          ))}
        </ul>
      </div>
    )}
  </div>
);

}

export default CreateQuiz;