# Chatbot Platform

This is a minimal Chatbot Platform with user authentication, project/agent creation, prompt storage, and integration with the OpenAI Completion API. It also includes an optional file upload feature using the OpenAI Files API.

## Features

*   User registration and login (JWT authentication)
*   Create projects/agents under a user
*   Store and associate prompts with projects/agents
*   Chat interface powered by OpenRouter (mistralai/mistral-7b-instruct)
*   (Optional) File upload to OpenAI Files API (Note: This still uses OpenAI's service and may incur costs if you exceed free tier limits).

## Setup and Installation

1.  **Clone the repository (if applicable):**

    ```bash
    git clone <repository-url>
    cd chatbot-platform
    ```

2.  **Install dependencies:**

    Make sure you have Node.js installed. Then, install the required npm packages:

    ```bash
    npm install express sequelize sqlite3 bcryptjs jsonwebtoken axios
    ```

3.  **Set up environment variables:**

    Create a `.env` file in the root directory and add your OpenRouter API key:

    *   **How to get an OpenRouter API Token:**
        1.  Go to [https://openrouter.ai/](https://openrouter.ai/).
        2.  Sign up or log in to your OpenRouter account.
        3.  Navigate to your "Keys" or "API Keys" section.
        4.  Generate a new key and copy it.

    ```
    OPENROUTER_API_KEY=your_openrouter_api_key_here
    ```

    Replace `your_openrouter_api_key_here` with your actual OpenRouter API key.

4.  **Run the application:**

    ```bash
    npm run start
    ```

    The server will start on `http://localhost:3000` (or the PORT you configured).

## Usage

1.  Open your web browser and navigate to `http://localhost:3000`.
2.  **Register:** Create a new user account using the registration form.
3.  **Login:** Log in with your registered email and password. This will give you a JWT token stored in local storage.
4.  **Create Project:** After logging in, you can create a new project/agent.
5.  **Create Prompt:** Select a project and create prompts associated with it.
6.  **Chat with Agent:** Use the chat interface to interact with the OpenRouter model.

## API Endpoints

*   `POST /register`: Register a new user.
*   `POST /login`: Log in a user and receive a JWT token.
*   `POST /projects`: Create a new project (requires authentication).
*   `GET /projects`: Get all projects for the authenticated user (requires authentication).
*   `POST /projects/:projectId/prompts`: Create a new prompt for a project (requires authentication).
*   `POST /chat`: Send a message to the OpenRouter API and get a response (requires authentication).
