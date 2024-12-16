# Penpot Copilot: AI-Powered Design Assistant

![Penpot Copilot: AI-Powered Design Assistant](/.github/images/thumb.png "Penpot Copilot: AI-Powered Design Assistant")


# Penpot Copilot Frontend  
**Rest API at [Penpot Copilot Backend](https://github.com/CijeTheCreator/penpot-copilot-backend)**

## 🛠️ Getting Started  

Follow these steps to set up and run the frontend for Penpot Copilot:  

1. **Install Prerequisites**  
   - Ensure **Git** and **Node.js** are installed on your system.  

2. **Clone the Repository**  
   - Clone this repository to your local machine using:  
     ```bash  
     git clone <repository-url>  
     ```  

3. **Set Up the REST API**  
   - Follow the instructions in the [Penpot Copilot Backend README](https://github.com/CijeTheCreator/penpot-copilot-backend/blob/main/README.md) to set up the REST API.  

4. **Configure the Environment**  
   - In the root folder, create a `.env` file (if not already present). Set the `ADDRESS` variable to the base URL of your REST API (e.g., `http://localhost:3000`).  

     Example `.env` file:  
     ```env  
     ADDRESS=http://localhost:3000  
     ```  

5. **Install Dependencies and Start the Frontend**  
   - Run the following commands to install the required packages and start the development server:  
     ```bash  
     npm install && npm run dev  
     ```  

6. **Install the Plugin (For Local Development)**  
   - If you're running the frontend on `localhost`, install the plugin using the following URL:  
     ```  
     http://localhost:4402/manifest.json  
     ```
     
## Description

Penpot Copilot is your AI-powered design assistant, revolutionizing the way you create. With Penpot Copilot, you can turn your ideas into stunning designs effortlessly. Simply describe your vision, and watch as it comes to life in real time. If you can think it, you can design it!

1. **AI-Driven Design**:

   - Generate components and layouts based on natural language descriptions.
   - Effortlessly bring your creative ideas to life without needing advanced design skills.

2. **Real-Time Collaboration**:
   - Share your AI-generated designs instantly with your team.
   - Enhance collaborative workflows by integrating AI seamlessly into the design process.

## Features

1. **AI Component Generation**: Create custom components and layouts by describing them in plain language.
2. **Creative Assistance**: Receive design suggestions tailored to your project’s needs.
3. **Real-Time Design Rendering**: Watch your ideas transform into tangible designs as you describe them.
4. **Team Collaboration**: Share AI-generated designs with teammates and iterate together effortlessly.

## :camera: Screenshots

![Screenshot](/.github/images/screenshot2.png "See real-time rendering of your ideas as designs")
![Screenshot](/.github/images/screenshot1.png "Describe your vision and let AI generate components")

Transform your workflow with Penpot Copilot—your AI design companion for faster, smarter, and more intuitive creation.
