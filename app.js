document.addEventListener("DOMContentLoaded", function () {
	const questionElement = document.getElementById("question");
	const optionsElement = document.getElementById("options");
	const feedbackElement = document.getElementById("feedback");
	const nextButton = document.getElementById("next-btn");
	const progressText = document.getElementById("progressText");
	const score = document.getElementById("score");
	const progressBar = document.getElementById("progressBar");
	let totalScoreElement = document.getElementById("totalScore");

	let currentQuestionIndex = 0;
	let correctAnswers = 0;

	let questions = [];

	// Fetch the questions from the API
	async function fetchQuestions() {
		await fetch("https://da-demo.github.io/api/futurama/questions/")
			.then((response) => response.json())
			.then((data) => {
				questions = data.map((q) => {
					const shuffledAnswers = [...q.possibleAnswers].sort(() => Math.random() - 0.5);
					return {
						question: q.question,
						answers: shuffledAnswers,
						correct_answer: shuffledAnswers.indexOf(q.correctAnswer),
					};
				});
				console.log(questions);
			})
			.catch((error) => console.error("Error fetching questions:", error));
	}

	function getRandomQuestions(questions) {
		let randomQuestions = [];
		for (let i = 0; i < Math.min(10, questions.length); i++) {
			let randomIndex = Math.floor(Math.random() * questions.length);
			let question = questions[randomIndex];
			if (question && question.answers) {
				randomQuestions.push(question);
				questions.splice(randomIndex, 1);
			} else {
				console.error("Invalid question object:", question);
			}
		}
		return randomQuestions;
	}

	// Display the current question
	function displayQuestion(question, questionNumber, totalQuestions) {
		progressText.textContent = `Fråga ${questionNumber + 1} av ${totalQuestions}`;
		questionElement.textContent = question.question;
		optionsElement.innerHTML = "";
		question.answers.forEach((answer, index) => {
			const optionElement = document.createElement("li");
			optionElement.textContent = answer;
			optionElement.addEventListener("click", () => checkAnswer(index === question.correct_answer));
			optionsElement.appendChild(optionElement);
		});
	}

	// Check the answer
	function checkAnswer(isCorrect) {
		// Retrieve the total score and total questions from local storage
		let totalScore = localStorage.getItem("totalScore");
		let totalQuestions = localStorage.getItem("totalQuestions");

		// If they don't exist yet, initialize them to 0
		if (totalScore === null) totalScore = 0;
		if (totalQuestions === null) totalQuestions = 1;

		// Convert them to numbers (they are stored as strings)
		totalScore = Number(totalScore);
		totalQuestions = Number(totalQuestions);

		if (isCorrect) {
			correctAnswers++;
			totalScore++; // Increase the total score
			feedbackElement.textContent = "Rätt svar!";
			feedbackElement.style.color = "#ffffff";
			feedbackElement.style.backgroundColor = "#006400";
			feedbackElement.style.padding = "10px";
			feedbackElement.style.borderRadius = "20px";
			feedbackElement.style.display = "inline-block";
		} else {
			feedbackElement.textContent = "Fel svar!";
			feedbackElement.style.color = "#ffffff";
			feedbackElement.style.backgroundColor = "#800000";
			feedbackElement.style.padding = "10px";
			feedbackElement.style.borderRadius = "20px";
			feedbackElement.style.display = "inline-block";
		}

		totalQuestions++; // Increase the total questions

		// Store the updated total score and total questions in local storage
		localStorage.setItem("totalScore", totalScore);
		localStorage.setItem("totalQuestions", totalQuestions);

		totalScoreElement.textContent = `${totalScore} av ${totalQuestions}`;

		// Display the next question or final score
		currentQuestionIndex++;
		if (currentQuestionIndex <= questions.length) {
			// When a question is answered...
			updateProgressBar(currentQuestionIndex, questions.length);
		}

		if (currentQuestionIndex < questions.length) {
			displayQuestion(questions[currentQuestionIndex], currentQuestionIndex, questions.length);
		} else {
			// Disable the options
			const options = document.querySelectorAll("#options li");
			options.forEach((option) => {
				option.style.pointerEvents = "none";
			});
			if (correctAnswers < 5) {
				feedbackElement.style.color = "#ffffff";
				feedbackElement.style.backgroundColor = "#800000";
				feedbackElement.style.padding = "10px";
				feedbackElement.style.borderRadius = "20px";
				feedbackElement.style.display = "inline-block";
				feedbackElement.textContent = `Du fick ${correctAnswers} av ${questions.length} rätt!`;
			} else {
				feedbackElement.style.color = "#ffffff";
				feedbackElement.style.backgroundColor = "#006400";
				feedbackElement.style.padding = "10px";
				feedbackElement.style.borderRadius = "20px";
				feedbackElement.style.display = "inline-block";
				feedbackElement.textContent = `Du fick ${correctAnswers} av ${questions.length} rätt!`;
			}
		}
	}

	// Start a new quiz
	nextButton.addEventListener("click", () => {
		location.reload();
	});

	function updateProgressBar(currentQuestionIndex, totalQuestions) {
		const progress = (currentQuestionIndex / totalQuestions) * 100;
		let scoreValue = Math.floor((correctAnswers / totalQuestions) * 10);
		score.textContent = `${scoreValue} av 10`;
		progressBar.style.width = progress + "%";
	}

	// Fetch the questions and start the quiz
	fetchQuestions().then(() => {
		questions = getRandomQuestions(questions);
		if (questions.length > 0) {
			totalScoreElement.textContent = `${localStorage.getItem(
				"totalScore"
			)} av ${localStorage.getItem("totalQuestions")}`;
			displayQuestion(questions[0], 0, questions.length);
		} else {
			console.error("No questions to display");
		}
	});
});
