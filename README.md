# COMS-E6998-A-Basic-Chat-Bot
COMS E6998 Cloud Computing and Big Data HW1: A basic serverless chat bot using a variety of AWS servers.
Link: https://s3.us-east-2.amazonaws.com/big-data-columbia/index.html

## Info
Author: Sam Beaulieu	<br />
UNI: srb2208		<br />
Date: 3/5/2018		<br />

## Description
Homework 1 of COMS E6998 Cloud Computing and Big Data. The objective of this assignment was to build a serverless, microservice-driven chat bot web application. This assignment builds upto a full AI Customer Service experience over the course of the semester.

### Frontend
The frontend was to be hosted in AWS S3 and provide a simple interface to interact with the chat bot. We were allowed to use open source libraries and frameworks to get the UI/UX out of the box. The template I modified for my application can be found here: https://codepen.io/supah/pen/jqOBqp
<br />
The main modifications I made were to add a login/logout flow, add a site title, and integrate with a backend API for messages instead of a static list. All of the frontend files stored in AWS S3 can be found in /root.

### Backend
The backend was to use AWS API Gateway and AWS Lambda Functions. We were provided with an Swagger API specification which is included in the /api folder and can be found: https://github.com/001000001/aics-columbia-s2018/blob/master/aics-swagger.yaml
<br />
The API has one real function which is a POST request. It submits a message and the response is either another message or an error. API Gateway checks the signiture of the message and verifies IAM access of the user and then passes it onto Lambda. 
<br />
My Lambda function can be found in /lambda. It receives the message, verifies the form of the message, and selects a new message to return. Right now, the function of the Lambda function is quite simple and the message it returns is simply picked from a list of static functions. Future assignments will provide more complex NLP.

### Authentication
Authentication is done using AWS Cognito. The web app has its own User Pool and auto-generated login page. The user pool is linked to a federated identy pool whcih provides temporary IAM credentials to users when they log in. This allows users to access AWS resources such as the API Gateway. 

### Security
After users log in through Cognito, they are given temporary IAM credentials. The API in API Gateway is set so that only users with the right IAM roles can access it. The temporary credentials provided by Cognito include this role.