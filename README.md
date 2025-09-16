# Medmatch
## Tech Stack
* Frontend
  * Next.js
  * Tailwind CSS
* Backend
  * Express.js
  * MongoDB (mongoose)
  * Libraries
    * Validation - express-validator, class-validator
    * Testing - jest
## Onboarding
### Installing Dependencies
To get started after cloning the repo, first install the necessary dependencies.
The `client` and `server` folders are individual `npm` packages, so you will need to install the respective dependencies separately.  
Run the following commands from the root folder.
```sh
npm ci
cd client
npm ci
cd ../server
npm ci
```
### Connecting To The Database
By this point, you should have recieved an invitation email to the database.  
If you haven't already, follow the link, make a new MongoDB account, and navigate to the overview page for MedMatch (may have to navigate through projects).   
A banner should appear at the top saying that your IP address is not added to the whitelist. Click the button to add your IP address.  
The tech lead should make a database user for you and provide you with a username and password. These will be necessary for the next section.  
### Setting Up Environment Variables
You will need to create a `.env` file in the `/server` directory.  
*Note: The file name should be ".env" verbatim, no file ending.*  
Then copy paste the following into the newly created file.
```.env
DB_USERNAME=[YOUR DATABASE USERNAME]
DB_PASSWORD=[YOUR DATABASE PASSWORD]
DB_HOST=radish.5ujpyx5.mongodb.net
DB_COLLECTION=medmatch
DB_CLUSTER=radish
DEV_PORT=4000
NODE_ENV=development
ACCESS_TOKEN_SECRET=[SECRET KEY]
REFRESH_TOKEN_SECRET=[DIFFERENT SECRET KEY]
```
Make sure to replace the bracketed values with the corresponding data.
You can use an online [uuid generator](https://www.uuidgenerator.net/) to create secret keys.
### Starting The Development Server
In order to start the frontend development server, run the following command from the `client` directory.
```
npm run dev
```
This works the same for the backend. Just run the same command from the `server` directory.

## Documentation Website
We will be using MkDocs for documentation. To run the documentation server, you need to do a few
things.

### Setup 
1. Install MkDocs and required plugins:
```bash
pip install mkdocs mkdocs-material pymdown-extensions 
```
2. Run documentation server:
```bash
cd docs
mkdocs serve
```
3. View the site on: http://127.0.0.1:8000/ 

### Building static documentation
To build the static site:
```bash
cd docs
mkdocs build
```
The static site is built in the ```docs/site``` directory.
