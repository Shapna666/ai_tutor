import React, { useState, useEffect } from 'react';
import './QuizTakingInterface.css';

export default function QuizTakingInterface({ questions, subject, title, onClose }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState(new Set());
  const [timeLeft, setTimeLeft] = useState(30);
  const [quizCompleted, setQuizCompleted] = useState(false);

  useEffect(() => {
    if (timeLeft > 0 && !quizCompleted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !quizCompleted) {
      handleNextQuestion();
    }
  }, [timeLeft, quizCompleted]);

  const handleAnswerSelect = (answerIndex) => {
    if (answeredQuestions.has(currentQuestionIndex)) return;
    
    setSelectedAnswer(answerIndex);
    setShowFeedback(true);
    
    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = answerIndex === currentQuestion.correct_answer;
    
    if (isCorrect) {
      setScore(score + 1);
    }
    
    setAnsweredQuestions(prev => new Set([...prev, currentQuestionIndex]));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
      setTimeLeft(30);
    } else {
      setQuizCompleted(true);
    }
  };

  const handleFinishQuiz = () => {
    onClose();
  };

  if (quizCompleted) {
    return (
      <div className="quiz-results">
        <h2>Quiz Completed! 🎉</h2>
        <div className="score-display">
          <h3>Your Score</h3>
          <div className="score-circle">
            <span className="score-number">{score}</span>
            <span className="score-total">/ {questions.length}</span>
          </div>
          <p className="score-percentage">
            {Math.round((score / questions.length) * 100)}%
          </p>
        </div>
        <div className="score-message">
          {score === questions.length && <p>Perfect! Excellent work! 🌟</p>}
          {score >= questions.length * 0.8 && score < questions.length && <p>Great job! Well done! 👍</p>}
          {score >= questions.length * 0.6 && score < questions.length * 0.8 && <p>Good effort! Keep practicing! 💪</p>}
          {score < questions.length * 0.6 && <p>Keep studying! You'll improve! 📚</p>}
        </div>
        <div className="quiz-actions">
          <button onClick={handleFinishQuiz} className="btn-primary">Finish Quiz</button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="quiz-taking-container">
      <div className="quiz-header">
        <h3>{subject} - {title}</h3>
        <div className="quiz-info">
          <span className="question-counter">
            Question {currentQuestionIndex + 1} of {questions.length}
          </span>
          <span className="timer">
            Time: {timeLeft}s
          </span>
          <span className="score">
            Score: {score}/{questions.length}
          </span>
        </div>
      </div>

      <div className="question-container">
        <h3 className="question-text">{currentQuestion.question}</h3>
        
        <div className="options-container">
          {currentQuestion.options.map((option, index) => {
            let optionClass = 'option';
            let isSelected = selectedAnswer === index;
            let isCorrect = index === currentQuestion.correct_answer;
            
            if (showFeedback) {
              if (isCorrect) {
                optionClass += ' correct';
              } else if (isSelected && !isCorrect) {
                optionClass += ' incorrect';
              }
            } else if (isSelected) {
              optionClass += ' selected';
            }

            return (
              <button
                key={index}
                className={optionClass}
                onClick={() => handleAnswerSelect(index)}
                disabled={answeredQuestions.has(currentQuestionIndex)}
              >
                <span className="option-letter">{String.fromCharCode(65 + index)}.</span>
                <span className="option-text">{option}</span>
                {showFeedback && isCorrect && <span className="correct-icon">✓</span>}
                {showFeedback && isSelected && !isCorrect && <span className="incorrect-icon">✗</span>}
              </button>
            );
          })}
        </div>

        {showFeedback && (
          <div className="feedback-container">
            {selectedAnswer === currentQuestion.correct_answer ? (
              <div className="feedback correct-feedback">
                <span className="feedback-icon">🎉</span>
                <p>Correct! Well done!</p>
              </div>
            ) : (
              <div className="feedback incorrect-feedback">
                <span className="feedback-icon">❌</span>
                <p>Incorrect. The correct answer is: <strong>{currentQuestion.options[currentQuestion.correct_answer]}</strong></p>
              </div>
            )}
            {currentQuestion.explanation && (
              <div className="explanation">
                <p><strong>Explanation:</strong> {currentQuestion.explanation}</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="quiz-actions">
        {showFeedback && (
          <button onClick={handleNextQuestion} className="btn-primary">
            {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
          </button>
        )}
        <button onClick={onClose} className="btn-secondary">Exit Quiz</button>
      </div>
    </div>
  );
} 