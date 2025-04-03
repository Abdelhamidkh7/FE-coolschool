import { useState } from "react";
import axios from "axios";
import { Plus, Trash2 } from "lucide-react";

interface Choice {
  text: string;
  isCorrect: boolean;
}

interface Question {
  question: string;
  questionType: "MCQ" | "ESSAY";
  points: number;
  choices: Choice[];
}

const CreateQuizForm = ({ classId, onSuccess }: { classId: string; onSuccess: () => void }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [quizType, setQuizType] = useState("QUIZ");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [questions, setQuestions] = useState<Question[]>([
    {
      question: "",
      questionType: "MCQ",
      points: 1,
      choices: [{ text: "", isCorrect: false }],
    },
  ]);

  const token = localStorage.getItem("token");

  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        question: "",
        questionType: "MCQ",
        points: 1,
        choices: [{ text: "", isCorrect: false }],
      },
    ]);
  };

  const updateQuestion = (
    index: number,
    key: keyof Question,
    value: any
  ) => {
    const updated = [...questions];
    updated[index] = {
      ...updated[index],
      [key]: value,
    };
    setQuestions(updated);
  };

  const updateChoice = (
    qIndex: number,
    cIndex: number,
    key: keyof Choice,
    value: string | boolean
  ) => {
    const updated = [...questions];
    const choices = [...updated[qIndex].choices];
    choices[cIndex] = {
      ...choices[cIndex],
      [key]: value,
    };
    updated[qIndex].choices = choices;
    setQuestions(updated);
  };

  const addChoice = (qIndex: number) => {
    const updated = [...questions];
    updated[qIndex].choices.push({ text: "", isCorrect: false });
    setQuestions(updated);
  };

  const removeQuestion = (index: number) => {
    const updated = [...questions];
    updated.splice(index, 1);
    setQuestions(updated);
  };

  const handleSubmit = async () => {
    try {
      await axios.post(
        `http://localhost:8080/api/quiz`,
        {
          classroom_id: classId,
          title,
          description,
          quizType,
          startDate,
          endDate,
          questions,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      alert("Quiz created successfully.");
      onSuccess();
    } catch (err) {
      console.error("Failed to create quiz", err);
      alert("Error while creating quiz.");
    }
  };

  return (
    <div className="p-6 bg-white shadow-xl rounded-lg max-w-3xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Create New {quizType === "QUIZ" ? "Quiz" : "Assignment"}</h2>

      <div className="mb-4">
        <label className="block text-sm font-medium">Title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border rounded p-2 mt-1"
          placeholder="Enter quiz title"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border rounded p-2 mt-1"
          placeholder="Description or instructions"
        />
      </div>

      <div className="mb-4 grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">Start Date</label>
          <input
            type="datetime-local"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full border rounded p-2 mt-1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">End Date</label>
          <input
            type="datetime-local"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full border rounded p-2 mt-1"
          />
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium">Type</label>
        <select
          value={quizType}
          onChange={(e) => setQuizType(e.target.value)}
          className="w-full border rounded p-2 mt-1"
        >
          <option value="QUIZ">Quiz</option>
          <option value="ASSIGNMENT">Assignment</option>
        </select>
      </div>

      <h3 className="text-lg font-semibold mt-6 mb-2">Questions</h3>
      {questions.map((q, index) => (
        <div key={index} className="border p-4 mb-4 rounded-md">
          <div className="flex justify-between items-center">
            <label className="block font-medium">Question {index + 1}</label>
            <button onClick={() => removeQuestion(index)} className="text-red-500">
              <Trash2 size={16} />
            </button>
          </div>

          <input
            type="text"
            value={q.question}
            onChange={(e) => updateQuestion(index, "question", e.target.value)}
            className="w-full mt-2 border rounded p-2"
            placeholder="Type the question here"
          />

          <div className="mt-3 grid grid-cols-2 gap-4">
            <select
              value={q.questionType}
              onChange={(e) => updateQuestion(index, "questionType", e.target.value)}
              className="border rounded p-2"
            >
              <option value="MCQ">Multiple Choice</option>
              <option value="ESSAY">Essay</option>
            </select>
            <input
              type="number"
              value={q.points}
              onChange={(e) => updateQuestion(index, "points", Number(e.target.value))}
              placeholder="Points"
              className="border rounded p-2"
            />
          </div>

          {q.questionType === "MCQ" && (
            <div className="mt-4">
              {q.choices.map((c, cIndex) => (
                <div key={cIndex} className="flex items-center space-x-2 mb-2">
                  <input
                    type="text"
                    className="border rounded p-2 flex-1"
                    placeholder="Option text"
                    value={c.text}
                    onChange={(e) => updateChoice(index, cIndex, "text", e.target.value)}
                  />
                  <label className="flex items-center space-x-1">
                    <input
                      type="checkbox"
                      checked={c.isCorrect}
                      onChange={(e) => updateChoice(index, cIndex, "isCorrect", e.target.checked)}
                    />
                    <span className="text-sm">Correct</span>
                  </label>
                </div>
              ))}
              <button
                onClick={() => addChoice(index)}
                className="text-blue-600 text-sm mt-1 hover:underline"
              >
                + Add Option
              </button>
            </div>
          )}
        </div>
      ))}

      <button
        onClick={addQuestion}
        className="flex items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mb-6"
      >
        <Plus className="mr-2" size={16} /> Add Question
      </button>

      <button
        onClick={handleSubmit}
        className="w-full py-3 bg-green-600 text-white rounded-lg text-lg font-medium hover:bg-green-700"
      >
        Create {quizType === "QUIZ" ? "Quiz" : "Assignment"}
      </button>
    </div>
  );
};

export default CreateQuizForm;
