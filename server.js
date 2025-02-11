const express = require('express');
const fs = require('fs');
const path = require('path');
const session = require('express-session');  // Import express-session

const app = express();
const port = 3000;
const filePath = path.join(__dirname, 'submissions.json');
const nodemailer = require('nodemailer');
const { isatty } = require('tty');

// Create a transporter object using your email service credentials
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'contact@vero-design.com',
    pass: 'epxx qytt xspe cetb'
  }
});

// Middleware to parse JSON bodies and URL-encoded data (for form submissions)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set up session middleware with a secret key
app.use(session({
  secret: 'mySecretKey',    // Change this to a strong secret in production
  resave: false,
  saveUninitialized: false
}));

// Serve static files from the "public" folder
app.use(express.static('public'));

// Middleware to protect routes that require authentication
function isAuthenticated(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  } else {
    // Redirect to the custom login page if not authenticated
    res.redirect('/login.html');
  }
}

// POST route for handling login form submissions
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  // Replace these hard-coded credentials with a real user system in production
  if (username === 'admin' && password === 'password') {
    req.session.user = username; // Set the user in session
    res.redirect('/submissions'); // Redirect to the protected submissions page
  } else {
    // Redirect back to login with an error query parameter (optional)
    res.redirect('/login.html?error=1');
  }
});

// Protected route for the submissions page
app.get('/submissions', isAuthenticated, (req, res) => {
  // Send the submissions HTML page if authenticated
  res.sendFile(path.join(__dirname, 'public', 'submissions.html'));
});

// Protected route for fetching submissions data (used by the submissions page)
app.get('/submissionsData', isAuthenticated, (req, res) => {
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        return res.json([]);  // Return empty array if file doesn't exist
      } else {
        console.error('Error reading file:', err);
        return res.status(500).send('Error reading submissions data');
      }
    }
    try {
      const submissions = JSON.parse(data);
      res.json(submissions);
    } catch (parseError) {
      console.error('Error parsing JSON:', parseError);
      res.status(500).send('Error parsing submissions data');
    }
  });
});

// POST endpoint for handling new form submissions
app.post('/submit', (req, res) => {
  console.log('Request body:', req.body); // debugging output
  const submissionData = req.body;
  const userEmail = submissionData.email;
  console.log('User email:', userEmail);
  
  if (!userEmail) {
    return res.status(400).send('Email is required for submission');
  }
  
  // Add a timestamp to the submission data
  submissionData.timestamp = new Date().toISOString();

  // Read the current submissions from the JSON file
  fs.readFile(filePath, 'utf8', (err, data) => {
    let submissions = [];
    if (!err && data) {
      try {
        submissions = JSON.parse(data);
      } catch (parseError) {
        console.error('Error parsing JSON:', parseError);
        return res.status(500).send('Internal server error');
      }
    } else if (err && err.code !== 'ENOENT') {
      console.error('Error reading file:', err);
      return res.status(500).send('Internal server error');
    }

    // Set a new auto-incremented ID based on the current count
    submissionData.id = submissions.length + 1;

    // Create a new submission object with "id" as the first property
    const newSubmission = {
      id: submissionData.id,
      ...submissionData,
      timestamp: submissionData.timestamp
    };

    // Append the new submission to the array
    submissions.push(newSubmission);

    // Write the updated array back to the JSON file
    fs.writeFile(filePath, JSON.stringify(submissions, null, 2), (writeErr) => {
      if (writeErr) {
        console.error('Error writing file', writeErr);
        return res.status(500).send('Error saving submission');
      }

      // Prepare the email options using the variables defined above
      const mailOptions = {
        from: "contact@vero-design.com",
        to: userEmail,  // Use the variable userEmail, not the string "userEmail"
        subject: "Thank you for the submission!",  // Use 'subject', not 'subjects'
        text: `Hello,

Thank you for submitting our form. We have received your submission with the following details:
- Selection: ${newSubmission.option}
- ID: ${newSubmission.id}
- Timestamp: ${newSubmission.timestamp}

If you are in need of a new website, design, or any online service please click on the following link.
https://vero-design.com/client-list-add

Best regards,
VeroDesign Team`
      };

      // Send the email
      transporter.sendMail(mailOptions, (emailErr, info) => {
        if (emailErr) {
          console.error('Error sending mail:', emailErr);
          // You might choose not to fail the submission if email sending fails
        } else {
          console.log('Email Sent: ' + info.response);
        }
      });

      // Send the response to the client once everything is done
      res.send('Submission saved successfully!');
    });
  });
});

app.post('/clearSubmissions', isAuthenticated, (req, res) => {
    const { password } = req.body;
    // Define password for submission clearing
    // For prod. store this in an enviorment variable
    const expectedPassword = 'vero-delete-submissions-123-!@#';

    if (password != expectedPassword) {
      return res.status(403).send('Incorrect Password.');
    }

    // Clear submissions by writting empty array to file
    fs.writeFile(filePath, '[]', (err) => {
      if (err) {
        console.error('Error clearing submissions:', err);
        return res.status(500).send('Error clearing submissions.');
      }
      res.send('All submissions removed successfully!');
    });
});

app.get('/logout', (req, res) => {
    // Destroy session & redirect to login page
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
            return res.status(500).send('Could not log out.');
        }
        res.redirect('/login.html');
    });
});

// Start the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
