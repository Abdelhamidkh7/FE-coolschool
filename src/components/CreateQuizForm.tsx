import React, { useState } from "react";
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

interface CreateQuizFormProps {
  classId: string;
  onSuccess: () => void;
}

type FieldErrors = {
  maxScore?: string;
  title?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  questions?: string;
  submit?: string;
  questionErrors?: Array<{
    question?: string;
    points?: string;
    choices?: (string | undefined)[];
  }>;
};

export default function CreateQuizForm({
  classId,
  onSuccess,
}: CreateQuizFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [quizType, setQuizType] = useState<"QUIZ" | "ASSIGNMENT">("QUIZ");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [manualMax, setManualMax] =  useState<number>(0);
  const [questions, setQuestions] = useState<Question[]>([
    {
      question: "",
      questionType: "MCQ",
      points: 1,
      choices: [{ text: "", isCorrect: false }],
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [triedSubmit, setTriedSubmit] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };


  const minDateTime = new Date().toISOString().slice(0, 16);


  const computedMaxScore = questions.reduce(
    (sum, q) => sum + (isNaN(q.points) ? 0 : q.points),
    0
  );


  const validate = (): FieldErrors => {
    const errs: FieldErrors = {};

    if (!title.trim()) errs.title = "Title is required.";
    if (!description.trim()) errs.description = "Description is required.";

    if (quizType === "QUIZ") {
      if (!startDate) errs.startDate = "Start date is required.";
      if (!endDate) errs.endDate = "End date is required.";
      if (startDate && endDate && startDate > endDate) {
        errs.endDate = "End date must be after start date.";
      }
    } else {
    
      if (!endDate) errs.endDate = "End date is required.";
    }

    if (quizType === "QUIZ") {
      if (questions.length === 0) {
        errs.questions = "At least one question is required.";
      }
      const qErrs: FieldErrors["questionErrors"] = questions.map((q) => {
        const qe: { question?: string; points?: string; choices?: string[] } = {};
        if (!q.question.trim()) qe.question = "Question text is required.";
        if (isNaN(q.points) || q.points <= 0)
          qe.points = "Points must be > 0.";
        if (q.questionType === "MCQ") {
          const ces = q.choices.map((c) =>
            !c.text.trim() ? "Option text is required." : undefined
          );
          if (ces.some((e) => e)) qe.choices = ces;
        }
        return qe;
      });
      if (qErrs.some((qe) => Object.keys(qe).length > 0)) {
        errs.questionErrors = qErrs;
      }
    }

    return errs;
  };

  const handleSubmit = async () => {
    setTriedSubmit(true);
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        classroom_id: Number(classId),
        title,
        description,
        quizType,
        startDate,
        endDate,
        maxScore: quizType === "QUIZ" ? computedMaxScore : manualMax,
        questions: quizType === "QUIZ" ? questions : [],
      };
      await axios.post(`http://localhost:8080/api/quiz`, payload, { headers });
      onSuccess();
    } catch (e) {
      console.error(e);
      setErrors({ submit: "Failed to create quiz." });
    } finally {
      setLoading(false);
    }
  };

 
  const addQuestion = () =>
    setQuestions((q) => [
      ...q,
      { question: "", questionType: "MCQ", points: 1, choices: [{ text: "", isCorrect: false }] },
    ]);
  const removeQuestion = (i: number) =>
    setQuestions((q) => q.filter((_, idx) => idx !== i));
  const updateQuestion = (
    qi: number,
    key: keyof Question,
    value: any
  ) =>
    setQuestions((q) =>
      q.map((qq, idx) => (idx === qi ? { ...qq, [key]: value } : qq))
    );
  const addChoice = (qi: number) =>
    setQuestions((q) =>
      q.map((qq, idx) =>
        idx === qi
          ? { ...qq, choices: [...qq.choices, { text: "", isCorrect: false }] }
          : qq
      )
    );
  const updateChoice = (
    qi: number,
    ci: number,
    key: keyof Choice,
    value: any
  ) =>
    setQuestions((q) =>
      q.map((qq, idx) =>
        idx === qi
          ? {
              ...qq,
              choices: qq.choices.map((cc, cidx) =>
                cidx === ci ? { ...cc, [key]: value } : cc
              ),
            }
          : qq
      )
    );
  const removeChoice = (qi: number, ci: number) =>
    setQuestions((q) =>
      q.map((qq, idx) =>
        idx === qi
          ? {
              ...qq,
              choices: qq.choices.filter((_, cidx) => cidx !== ci),
            }
          : qq
      )
    );

  return (
    <div className="p-6 bg-white shadow-lg rounded-lg max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-[#002d55]">
        Create {quizType === "QUIZ" ? "Quiz" : "Assignment"}
      </h2>


      <div className="mb-4">
        <label className="block text-sm font-medium">Title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={`mt-1 w-full border p-2 rounded focus:ring-2 ${
            triedSubmit && errors.title
              ? "border-red-500 focus:ring-red-500"
              : "border-gray-300 focus:ring-[#0065ea]"
          }`}
        />
        {triedSubmit && errors.title && (
          <p className="text-red-500 text-sm mt-1">{errors.title}</p>
        )}
      </div>

 
      <div className="mb-4">
        <label className="block text-sm font-medium">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={`mt-1 w-full border p-2 rounded focus:ring-2 ${
            triedSubmit && errors.description
              ? "border-red-500 focus:ring-red-500"
              : "border-gray-300 focus:ring-[#0065ea]"
          }`}
        />
        {triedSubmit && errors.description && (
          <p className="text-red-500 text-sm mt-1">{errors.description}</p>
        )}
      </div>

     
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium">Start Date</label>
          <input
            type="datetime-local"
            min={minDateTime}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className={`mt-1 w-full border p-2 rounded focus:ring-2 ${
              triedSubmit && errors.startDate
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:ring-[#0065ea]"
            }`}
          />
          {triedSubmit && errors.startDate && (
            <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium">End Date</label>
          <input
            type="datetime-local"
            min={minDateTime}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className={`mt-1 w-full border p-2 rounded focus:ring-2 ${
              triedSubmit && errors.endDate
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:ring-[#0065ea]"
            }`}
          />
          {triedSubmit && errors.endDate && (
            <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>
          )}
        </div>
      </div>

  
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium">Type</label>
          <select
            value={quizType}
            onChange={(e) =>
              setQuizType(e.target.value as "QUIZ" | "ASSIGNMENT")
            }
            className="mt-1 w-full border p-2 rounded focus:ring-2 focus:ring-[#0065ea]"
          >
            <option value="QUIZ">Quiz</option>
            <option value="ASSIGNMENT">Assignment</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">Max Score</label>
          {quizType === "QUIZ" ? (
            <input
              readOnly
              value={computedMaxScore}
              className="mt-1 w-full bg-gray-100 border p-2 rounded"
            />
          ) : (
            <input
              type="number"
              min={1}
              value={manualMax}
              onChange={e => setManualMax(Number(e.target.value))}
              className={`mt-1 w-full border p-2 rounded focus:ring-2 ${
                triedSubmit && errors.maxScore ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-[#0065ea]"
              }`}
            />
          )}
          {triedSubmit && errors.maxScore && (
            <p className="text-red-500 text-sm mt-1">{errors.maxScore}</p>
          )}
        </div>
      </div>

      
      {quizType === "QUIZ" && (
        <>
          <h3 className="text-lg font-semibold mb-2 text-[#002d55]">
            Questions
          </h3>
          {triedSubmit && errors.questions && (
            <p className="text-red-500 text-sm mb-2">{errors.questions}</p>
          )}
          {questions.map((q, qi) => {
            const qe = errors.questionErrors?.[qi] || {};
            return (
              <div
                key={qi}
                className="border p-4 rounded mb-6 shadow-sm relative"
              >
                <button
                  onClick={() => removeQuestion(qi)}
                  className="absolute top-2 right-2 text-red-600"
                >
                  <Trash2 size={16} />
                </button>

               
                <div className="mb-3">
                  <input
                    placeholder="Question text"
                    value={q.question}
                    onChange={(e) =>
                      updateQuestion(qi, "question", e.target.value)
                    }
                    className={`w-full border p-2 rounded focus:ring-2 ${
                      triedSubmit && qe.question
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-[#0065ea]"
                    }`}
                  />
                  {triedSubmit && qe.question && (
                    <p className="text-red-500 text-sm mt-1">
                      {qe.question}
                    </p>
                  )}
                </div>

               
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <select
                    value={q.questionType}
                    onChange={(e) =>
                      updateQuestion(
                        qi,
                        "questionType",
                        e.target.value as "MCQ" | "ESSAY"
                      )
                    }
                    className="border p-2 rounded focus:ring-2 focus:ring-[#0065ea]"
                  >
                    <option value="MCQ">Multiple Choice With Multiple Answers</option>
                    <option value="ESSAY">Essay</option>
                  </select>
                  <input
                    type="number"
                    placeholder="Points"
                    value={q.points}
                    onChange={(e) =>
                      updateQuestion(qi, "points", Number(e.target.value))
                    }
                    className={`border p-2 rounded focus:ring-2 ${
                      triedSubmit && qe.points
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-[#0065ea]"
                    }`}
                  />
                  {triedSubmit && qe.points && (
                    <p className="text-red-500 text-sm mt-1 col-span-2">
                      {qe.points}
                    </p>
                  )}
                </div>

                {/* MCQ Choices */}
                {q.questionType === "MCQ" &&
                  q.choices.map((c, ci) => {
                    const ce = qe.choices?.[ci];
                    return (
                      <div key={ci} className="flex items-center mb-2 space-x-2">
                        <input
                          placeholder="Option text"
                          value={c.text}
                          onChange={(e) =>
                            updateChoice(qi, ci, "text", e.target.value)
                          }
                          className={`flex-1 border p-2 rounded focus:ring-2 ${
                            triedSubmit && ce
                              ? "border-red-500 focus:ring-red-500"
                              : "border-gray-300 focus:ring-[#0065ea]"
                          }`}
                        />
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={c.isCorrect}
                            onChange={(e) =>
                              updateChoice(qi, ci, "isCorrect", e.target.checked)
                            }
                            className="mr-1"
                          />
                          <span className="text-gray-700">Correct</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => removeChoice(qi, ci)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 size={16} />
                        </button>
                        {triedSubmit && ce && (
                          <p className="text-red-500 text-sm ml-2">{ce}</p>
                        )}
                      </div>
                    );
                  })}

                {q.questionType === "MCQ" && (
                  <button
                    onClick={() => addChoice(qi)}
                    className="flex items-center text-[#0065ea] hover:underline mt-2"
                  >
                    <Plus size={16} className="mr-2" /> Add Option
                  </button>
                )}

                {q.questionType === "ESSAY" && (
                  <textarea
                    rows={4}
                    placeholder="Essay answer space"
                    disabled
                    className="w-full border p-2 rounded bg-gray-100"
                  />
                )}
              </div>
            );
          })}

          <button
            onClick={addQuestion}
            className="flex items-center px-4 py-2 bg-[#0065ea] text-white rounded hover:bg-[#0050aa] transition mb-6"
          >
            <Plus size={16} className="mr-2" /> Add Question
          </button>
        </>
      )}

      {errors.submit && (
        <p className="text-red-600 text-center text-sm mb-4">
          {errors.submit}
        </p>
      )}

      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="px-6 py-3 bg-[#0065ea] text-white rounded hover:bg-[#0050aa] transition disabled:opacity-50"
        >
          Create {quizType === "QUIZ" ? "Quiz" : "Assignment"}
        </button>
      </div>
    </div>
  );
}
