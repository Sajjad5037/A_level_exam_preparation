
import React, { useState, useEffect } from "react";
import { marked } from 'marked';


const ChatbotTrainerUI_sociology = ({ doctorData }) => {
  
  const [pdfs, setPdfs] = useState([]);
  const [selectedPDFs, setSelectedPDFs] = useState([]);
  const [chatLog, setChatLog] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [images, setImages] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);
  const [sessionId, setSessionId] = React.useState(null);  // store sessionId in state
  const [marks, setMarks] = useState(0);
  const [question_text, setQuestionText] = useState("");
  const [minimumWordCount, setMinimumWordCount] = useState(80);
  const [subject, setSubject] = useState("");
  const [availableQuestions, setAvailableQuestions] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // ✅ reset selected question whenever marks change
  useEffect(() => {
    setQuestionText("");
  }, [marks]);



   const questionsData = {
  sociology: {
    4: [
      "Explain two features of a laboratory experiment and how they are used to test hypotheses in sociology.",
      "Describe two types of qualitative interview.",
      "Describe two ways children learn about gender identity.",
      "Describe two ways increased life expectancy may impact upon the family.",
      "Describe two ways social policies may impact upon the family.",
      "Describe two ways childhood is a distinct period from adulthood.",
      "Describe two ways schools can be seen as feminised."
    ],
    6: [
      "Explain two strengths of using unstructured interviews in sociological research.",
      "Using sociological material, give one argument against the view that the peer group is the most important influence in shaping age identity.",
      "Explain two strengths of using content analysis in sociological research.",
      "‘Education is the most important influence in shaping class identity.’ Using sociological material, give one argument against this view.",
      "Explain two strengths of using laboratory experiments in sociological research.",
      "‘Inadequate socialisation is the main cause of deviant behaviour.’",
      "Explain one strength and one limitation of liberal feminist views of the family.",
      "‘Social class is the most important factor affecting the experiences of children in the family.’ Using sociological material, give one argument against this view.",
      "Explain one strength and one limitation of postmodernist views on family diversity.",
      "Explain two strengths of functionalist views of the family."
    ],
    8: [
      "Explain two reasons why some social groups are difficult to study.",
      "Explain two ethical factors to consider when conducting observational studies.",
      "Explain two reasons why unstructured interviews are high in validity.",
      "Explain two reasons for greater gender equality in some families.",
      "Explain two reasons why fewer people are getting married.",
      "Explain two functions the family performs to benefit its members.",
      "Explain two ways racism can affect attainment in schools."
    ],
    10: [
      "The peer group is the most important influence in shaping age identity. Explain this view.",
      "‘Education is the most important influence in shaping class identity.’ Explain this view.",
      "‘Inadequate socialisation is the main cause of deviant behaviour.’",
      "‘Social class is the most important factor affecting the experiences of children in the family.’ Explain this view.",
      "‘The main role of the family is to benefit society.’ Explain this view.",
      "‘There is no longer any social pressure on people to get married.’ Explain this view."
    ],
    12: [
      "IQ tests are a fair measure of educational ability. Using sociological material, give two arguments against this view."
    ],
    26: [
      "Evaluate the view that female identity is very different from fifty years ago.",
      "Evaluate the use of structured interviews in sociological research.",
      "Evaluate the view that human behaviour is shaped by nurture rather than nature.",
      "Evaluate the positivist view that sociologists should use a scientific approach to research.",
      "Evaluate the view that the family is the most important agent of socialisation in shaping identity.",
      "Evaluate the view that sociological research can be value-free.",
      "Evaluate the view that the main role of the family is to promote capitalist ideology.",
      "Evaluate the view that marriage has become less important in society.",
      "Evaluate the view that roles in the family are still based on traditional gender identities.",
      "Evaluate the view that the nuclear family is the dominant family type.",
      "Evaluate the view that cultural differences are the main cause of family diversity.",
      "Evaluate the view that parenthood today is different from the past.",
      "Evaluate the view that education contributes to value consensus."
    ]
  }
};


  // File input ref
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);

    if (selectedFiles.length + images.length > 10) {
      alert('You can only upload up to 10 images.');
      return;
    }

    setImages(prev => [...prev, ...selectedFiles]);
  };
  const handleImageSelect = (event) => {
    const options = event.target.options;
    const selectedNames = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) selectedNames.push(options[i].value);
    }

    setSelectedImages(images.filter(img => selectedNames.includes(img.name)));
  };
  

  const handlePDFSelect = (e) => {
    const selected = Array.from(e.target.selectedOptions).map(opt => opt.value);
    setSelectedPDFs(selected);
  };

  const handleRemoveSelected = () => {
    setImages(prevImages =>
        prevImages.filter(img => !selectedImages.some(sel => sel.name === img.name))
    );
    setSelectedImages([]);
    };

  const handleTrain = async () => {
  if (images.length === 0) {
    alert("Please upload at least one image before training.");
    return;
  }

  try {
    setIsProcessing(true)
    const formData = new FormData();

    // Append each image
    images.forEach((img) => formData.append("images", img));

    formData.append("subject", subject);
    formData.append("total_marks", marks);
    formData.append("question_text", question_text);
    formData.append("minimum_word_count", minimumWordCount);
    formData.append("username",doctorData.name );
    
    console.log("[DEBUG] Sending form data:", formData);

    const response = await fetch(
      "https://usefulapis-production.up.railway.app/train-on-images-anz-way-new",
      {
        method: "POST",
        body: formData,
        // credentials: "include"  // uncomment if you use cookies
      }
    );

    console.log("[DEBUG] Sending form data:");
    for (let [key, value] of formData.entries()) {
      console.log(key, value);
    }
    // Check if the network request failed
    if (!response.ok) {
      const errorText = await response.text();
      console.error("[DEBUG] Response not OK:", response.status, errorText);
      throw new Error(`Error ${response.status}: ${errorText}`);
    }

    // Try parsing JSON
    let result;
    try {
      result = await response.json();
      console.log("[DEBUG] Parsed JSON result:", result);
    } catch (jsonErr) {
      const text = await response.text();
      console.error("[DEBUG] Failed to parse JSON:", text);
      throw new Error("Backend did not return valid JSON.");
    }

    // Check status from backend
    if (result.status !== "success") {
      alert(`❌ Evaluation failed: ${result.detail || "No detail provided"}`);
      return;
    }

    // Use evaluation_text from backend
    const evaluationText = result.evaluation_text;

    setChatLog((prev) => [
      ...prev,
      {
        type: "bot",
        message: (
          <div>
            <h3>Evaluation</h3>
            <div
              style={{
                background: "#f8f8f8",
                padding: "1em",
                borderRadius: "6px",
                whiteSpace: "pre-wrap",
                fontFamily: "inherit",
              }}
              dangerouslySetInnerHTML={{
                __html: evaluationText
                  .replace(/\*\*\s*(.*?)\s*\*\*/g, "<strong>$1</strong>")
                  .replace(/\n/g, "<br/>"),
              }}
            />
          </div>
        ),
      },
    ]);

    // Show summary info
    alert(`✅ Training successful!
📝 Total Marks: ${result.total_marks}
Minimum Word Count: ${result.minimum_word_count}
Student Response Length: ${result.student_response.length} characters`);

    // Optional: store session ID if returned
    if (result.session_id) {
      setSessionId(result.session_id);
    }

  } catch (error) {
    console.error("❌ Error during training:", error);
    alert(`Training failed. See console for details.`);
  } finally {
    setIsProcessing(false); // Hide loading message
  }

};



  const handleRemoveTraining = () => {
    alert("Previous training removed.");
  };

  const handleSendMessage = async () => {
  if (!userInput.trim()) return;
  if (!sessionId) {
    alert("Please train first to get a session ID.");
    return;
  }

  try {
    const response = await fetch("https://usefulapis-production.up.railway.app/chat_interactive_tutor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        session_id: sessionId,
        message: userInput,
        first_message: chatLog.length === 0,
      }),
    });

    if (!response.ok) throw new Error(`Server error: ${response.status}`);

    const data = await response.json();

    setChatLog((prev) => [
      ...prev,
      { type: "user", message: userInput },
      { type: "bot", message: data.reply },  // reply is already the HTML-formatted text
    ]);

    setUserInput("");
  } catch (error) {
    console.error(error);
    alert("Failed to get response from the tutor.");
  }
};

  const handleShowContext = () => {
    alert("Show current training context (stub)");
  };

 return (
  <div className="flex flex-col lg:flex-row justify-between gap-6 p-8 bg-gray-50 rounded-2xl shadow-md w-full box-border font-inter">
    
    {/* Left Panel */}
    <div className="w-full lg:w-80 bg-white rounded-xl shadow-sm p-6 flex flex-col h-[525px]">
      <h3 className="text-center text-gray-800 text-lg font-semibold mb-5">
        Upload Image of Your Response
      </h3>

      <select
        multiple
        size={10}
        value={selectedImages.map((img) => img.name)}
        onChange={handleImageSelect}
        className="w-full h-[300px] p-3 mb-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
      >
        {images.map((file, index) => (
          <option key={index} value={file.name}>
            {file.name}
          </option>
        ))}
      </select>

      <div className="flex flex-col gap-3 mt-auto">
        <label
          htmlFor="fileInput"
          className="cursor-pointer text-center bg-emerald-600 text-white py-2.5 rounded-lg font-medium hover:bg-emerald-700 transition"
        >
          Upload Image
        </label>
        <input
          id="fileInput"
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />

        <button
          onClick={handleRemoveSelected}
          className="py-2.5 rounded-lg text-white bg-red-500 hover:bg-red-600 transition font-medium"
        >
          Remove
        </button>

        <button
          onClick={handleTrain}
          disabled={isProcessing}
          className={`py-2.5 rounded-lg font-medium text-white transition ${
            isProcessing
              ? "bg-blue-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {isProcessing ? "Processing images..." : "Send your essay for checking..."}
        </button>
      </div>
    </div>

    {/* Right Panel */}
    <div className="flex-1 bg-white rounded-xl shadow-sm p-6 flex flex-col h-[525px]">
      {/* Subject & Marks Row */}
      <div className="flex flex-wrap items-center gap-5 mb-4">
        {/* Subject */}
        <div className="flex flex-col">
          <label
            htmlFor="subjectSelect"
            className="font-semibold text-gray-800 mb-1"
          >
            Subject:
          </label>
          <select
            id="subjectSelect"
            className="p-2 rounded-md border border-gray-300 min-w-[160px] focus:ring-2 focus:ring-blue-500 focus:outline-none"
            value={subject}
            onChange={(e) => {
              setSubject(e.target.value);
              setMarks("");
              setQuestionText("");
            }}
          >
            <option value="">-- Select Subject --</option>
            <option value="sociology">Sociology</option>
            <option value="economics">Economics</option>
            <option value="history">History</option>
            <option value="political_science">Political Science</option>
            <option value="literature">Literature</option>
          </select>
        </div>

        {/* Marks */}
        <div className="flex flex-col">
          <label
            htmlFor="marksInput"
            className="font-semibold text-gray-800 mb-1"
          >
            Marks:
          </label>
          <select
            id="marksInput"
            value={marks}
            onChange={(e) => {
              setMarks(e.target.value);
              setQuestionText("");
            }}
            className="p-2 rounded-md border border-gray-300 min-w-[100px] focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="">-- Select Marks --</option>
            {subject &&
              Object.keys(questionsData[subject] || {}).map((markValue) => (
                <option key={markValue} value={markValue}>
                  {markValue}
                </option>
              ))}
          </select>
        </div>

        {/* Question */}
        <div className="flex flex-col flex-1">
          <label
            htmlFor="questionSelect"
            className="font-semibold text-gray-800 mb-1"
          >
            Question:
          </label>
          <select
            id="questionSelect"
            className="p-2 rounded-md border border-gray-300 w-full focus:ring-2 focus:ring-blue-500 focus:outline-none"
            value={question_text}
            onChange={(e) => setQuestionText(e.target.value)}
          >
            <option value="">
              -- Select a valid subject and marks to see the list of questions --
            </option>
            {subject &&
              marks &&
              questionsData[subject]?.[marks]?.map((q, idx) => (
                <option key={idx} value={q}>
                  {q}
                </option>
              ))}
          </select>
        </div>
      </div>

      {/* Chat / Content Box */}
      <div className="h-[400px] overflow-y-auto mb-4 border border-gray-200 p-4 rounded-lg bg-gray-50 flex flex-col gap-3">
        {chatLog.map((msg, index) => {
          let cleanedMessage = msg.message;
          if (msg.type === "bot" && typeof msg.message === "string") {
            cleanedMessage = msg.message
              .replace(/([^\.\?\!])\n/g, "$1 ")
              .replace(/\n/g, "<br>");
          }

          return (
            <div
              key={index}
              className={`flex ${
                msg.type === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[75%] p-3 rounded-lg text-sm leading-relaxed shadow-sm ${
                  msg.type === "user"
                    ? "bg-blue-600 text-white rounded-tr-none"
                    : "bg-white text-gray-900 border border-gray-200 rounded-tl-none"
                }`}
                dangerouslySetInnerHTML={
                  msg.type === "bot" && typeof cleanedMessage === "string"
                    ? { __html: marked.parse(cleanedMessage) }
                    : undefined
                }
              >
                {msg.type === "bot" && typeof cleanedMessage !== "string"
                  ? cleanedMessage
                  : msg.type === "user"
                  ? cleanedMessage
                  : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  </div>
);


};

export default ChatbotTrainerUI_sociology;
