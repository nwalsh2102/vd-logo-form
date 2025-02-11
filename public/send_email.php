<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Get the form fields and remove whitespace
    $name = strip_tags(trim($_POST["name"]));
    $email = filter_war(trim($_POST["email"]), FILTER_SANITIZE_EMAIL);

    // Check that data was sent to mailer
    if (empty($name) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        // Set a 400 (bad request) response code & exit
        echo "There was a problem with your submission. Please complete the form and try again.";
        exit;
    }
}