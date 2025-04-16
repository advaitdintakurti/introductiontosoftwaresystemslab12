### Fixing the Buggy Code

repo: https://github.com/advaitdintakurti/introductiontosoftwaresystemslab12

- This code has 30 issues out of which 1 is no code in style.css . 
- The total marks for the entire codebase is 40, some issues have more marks than the other one. Style.css is of 5 marks. It will get scaled down to 20. All team members will get equal marks.
- You are suppose to work in teams of 4 or 5
- Each team member has to identify atleast 4 issues and fix atleast 4 issue. If someone doesn't do this, their marks get deducted.
- You are suppose to work on a git repository as collaborators

### What kind of bugs are there

- Bugs which will break your code
- Bugs might be a single word
- Bugs might be section of removed code
- Bugs might be section of unnecessary code
- Bugs might be useless files
- Bugs might be in the UI/UX of the pages
- Bugs might be in the api calls
- Bugs might be in the dependencies  

### submission format

- Make submissions on moodle
- Do not remove .git folder 
- Only 1 submission per team
- Submit it as Corrected_Code.zip

# Add the names of the members and roll numbers of your team below

## Advait Dintakurti - 2024111010
1. remove unused file home.js 0ca41b8
2. missing <nav> in analytics.html  93ba16d
4. wrong include path in profile.html
5. id mismatch with profile.js in profile.html
6. added song reccomendations in profile.html
7. fixed news
8. added container to items.html
9. prevent duplicate users
10. edit css
11. fix ALL of the <nav>s

## Aman Jayesh - 2024101005
1. Initialize API router in items.py - Aman Jayesh
2. Removed the duplicate and incorrect create_item definitions that were in items.py
3. Correct the delete route to accept only item_id and delete one item in items.py
4. Initialize users as an empty list before fetching in analytics.py
5. Use correct dictionary keys "name" and "username" in analytics.py
6. Include the plot base64 string in the JSON response in analytics.py

## Shreyas Ram - 2024111008
1. styles.ss is not filled in
2. quiz.js: loadQuestion in loads a new question every time
3. quiz.js: fetching /quiz/answer with GET as defined in the backend
4. quiz.js: is setup to receive JSON body
5. profile.js: defined baseURL
6. profile.js: use DELETE to delete the profile, instead of PATCH.
7. analytics.js: fixed the baseURL
8. profile.html: changed the script source

## Sai Kapil - 2024111018
 1. routes/users.py was using post instead of get method
 2. routes/users.py was deleting a user but used delete_all instead of delete_one
 3. routs/quiz.py get question was always giving question[1]. changed it to give a random question
 4. routes/quiz.py uses get to submit answer when it should have been post
 5. in main.py in the FAST API APP, user_router was not included so we include it
 6. in models.py made item inherit from pydantic's base model, it wasnt before
 7. in models.py name was defined as an int, changed it to string


## Revan - 2024115006
1. items.html was missing all it's contents, filled it with proper structure
2. items.js the delete function was sending post request, replaced it with delete request
3. the form submission was sending data in html, i changed it to json
4. I have added a CORS middleware to the fastapi application in main.py to allow requests from specific origin
