document.addEventListener('DOMContentLoaded', function () {
    const questionContainer = document.getElementById('question-container');
    const questionElement = document.getElementById('question');
    const optionsElement = document.getElementById('options');
    const feedbackElement = document.getElementById('feedback');
    const nextButton = document.getElementById('next-btn');

    let currentQuestionIndex = 0;
    let correctAnswers = 0;

    // Hämta frågorna från API:et
    function fetchQuestions() {
        fetch('https://da-demo.github.io/api/futurama/questions/')
            .then(response => response.json())
            .then(data => {
                if (Array.isArray(data)) {
                    data.forEach(question => {
                        fetchAnswers(question.id)
                            .then(answers => {
                                question.answers = answers;
                                displayQuestion(question);
                            })
                            .catch(error => console.error('Error fetching answers:', error));
                    });
                } else {
                    console.error('Invalid data format:', data);
                }
            })
            .catch(error => console.error('Error fetching questions:', error));
    }
    
    function fetchAnswers(questionId) {
        return fetch(`https://da-demo.github.io/api/futurama/questions/${questionId}/answers`)
            .then(response => {
                console.log(response); // Logga den återvända responsen för att inspektera den
                return response.json();
            })
            .then(data => data.answers)
            .catch(error => {
                console.error('Error fetching answers:', error);
                return [];
            });
    }
    
    
    
    function displayQuestion(question) {
        questionElement.textContent = question.question;
        optionsElement.innerHTML = '';
        question.answers.forEach(answer => {
            const optionElement = document.createElement('li');
            optionElement.textContent = answer;
            optionElement.addEventListener('click', () => checkAnswer(answer === question.correct_answer));
            optionsElement.appendChild(optionElement);
        });
    }
    

    // Kontrollera svaret och visa feedback
    function checkAnswer(isCorrect) {
        if (isCorrect) {
            feedbackElement.textContent = 'Rätt svar!';
            correctAnswers++;
        } else {
            feedbackElement.textContent = 'Fel svar. Det korrekta svaret är: ' + getCurrentQuestion().answer;
        }
        disableOptions();
        showNextButton();
    }

    // Inaktivera svarsalternativen efter att ett svar har valts
    function disableOptions() {
        const optionElements = optionsElement.querySelectorAll('li');
        optionElements.forEach(option => {
            option.removeEventListener('click', checkAnswer);
            option.style.pointerEvents = 'none';
        });
    }

    // Visa nästa fråga eller resultatet
    function showNextButton() {
        if (currentQuestionIndex < 9) {
            nextButton.style.display = 'block';
        } else {
            nextButton.textContent = 'Visa resultat';
            nextButton.addEventListener('click', showResult);
        }
    }

    // Visa resultatet efter att alla frågor har besvarats
    function showResult() {
        feedbackElement.textContent = `Du fick ${correctAnswers} av 10 frågor rätt.`;
        nextButton.style.display = 'none';
    }

    // Hämta den aktuella frågan
function getCurrentQuestion() {
    return questions[currentQuestionIndex];
}


    // Hantera klick på Nästa fråga-knappen
    nextButton.addEventListener('click', () => {
        currentQuestionIndex++;
        feedbackElement.textContent = '';
        fetchQuestions();
    });

    // Starta applikationen genom att hämta frågorna
    fetchQuestions();
});
