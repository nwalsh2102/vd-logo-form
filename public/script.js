const form = document.getElementById("form");
const submit = document.getElementById("submitBtn");
const reset = document.getElementById("resetBtn");
const results = document.getElementById("results");

form.addEventListener("submit", function(event) {
    event.preventDefault();

    const selected = form.querySelector("input[name=option]:checked");

    if (!selected) {
        results.textContent = 'Please select an option before submitting';
        return;
    }
    // GPT
    // Gather data using FormData
    const formData = new FormData(form);
    // Convert FormData to a plain JS object
    const data = Object.fromEntries(formData.entries());

    // Show a temp message, while form is being submitted
    results.textContent = 'Submitting form...';
    console.log('Submitting form...');

    // Send data to our server using Fetch API
    fetch('/submit', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.text())
    .then(message => {
        // alert(message); // Alerts user that submission was saved
        results.textContent = 'Successfully uploaded, and submitted form. Thank you.';
        console.log('Form succsessfully uploaded, and submitted');
        form.reset(); // Resets form
    })
    .catch(error => {
        console.error('Error', error);
    });

    setTimeout(() => {
        results.classList.add('fade-out');
        results.textContent = '';
    }, 5000);

    results.classList.remove('fade-out');
    console.log('Form submitted, and message gone.')
});

reset.addEventListener("click", function(event) {
    results.textContent = 'Form Reset';

    setTimeout(() => {
        results.classList.add('fade-out');
        results.textContent = '';
    }, 5000);

    results.classList.remove('fade-out');

    form.reset();
    console.log('Form reset.')
});